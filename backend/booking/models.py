import random
import string
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class Location(models.Model):
    """A town/stage served as a pickup or dropoff point."""

    slug = models.SlugField(primary_key=True)
    name = models.CharField(max_length=80)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Route(models.Model):
    """One travel direction, e.g. Busia -> Nairobi."""

    slug = models.SlugField(primary_key=True)
    origin = models.ForeignKey(Location, related_name="routes_from", on_delete=models.CASCADE)
    destination = models.ForeignKey(Location, related_name="routes_to", on_delete=models.CASCADE)
    label = models.CharField(max_length=120)

    def __str__(self):
        return self.label


class Schedule(models.Model):
    """A specific departure ("trip") offered on a route."""

    route = models.ForeignKey(Route, related_name="schedules", on_delete=models.CASCADE)
    departure_time = models.CharField(max_length=5)  # "HH:MM"
    coach = models.CharField(max_length=20)
    total_seats = models.PositiveIntegerField(default=44)
    fare = models.PositiveIntegerField(help_text="Fare per seat, in KES")

    class Meta:
        ordering = ["route", "departure_time"]

    def __str__(self):
        return f"{self.route.label} @ {self.departure_time} ({self.coach})"

    def booked_seats_for(self, date):
        seat_lists = self.bookings.filter(travel_date=date).values_list("seats", flat=True)
        booked = []
        for seats in seat_lists:
            booked.extend(seats)
        hold_lists = self.seatholds.filter(travel_date=date, expires_at__gt=timezone.now()).values_list("seats", flat=True)
        for seats in hold_lists:
            booked.extend(seats)
        return booked


def generate_reference():
    return "PL-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=7))


class Booking(models.Model):
    """A confirmed reservation of one or more seats on a schedule/date."""

    reference = models.CharField(max_length=12, unique=True, default=generate_reference, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="bookings", on_delete=models.SET_NULL, null=True, blank=True)
    schedule = models.ForeignKey(Schedule, related_name="bookings", on_delete=models.CASCADE)
    travel_date = models.DateField()
    pickup = models.ForeignKey(Location, related_name="+", on_delete=models.PROTECT)
    dropoff = models.ForeignKey(Location, related_name="+", on_delete=models.PROTECT)
    seats = models.JSONField(help_text="List of seat numbers, e.g. [3, 4]")
    customer_name = models.CharField(max_length=120)
    customer_phone = models.CharField(max_length=20)
    customer_id_number = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True)
    total_fare = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} ({self.customer_name})"


class SeatHold(models.Model):
    """A temporary hold on seats for a schedule/date."""

    schedule = models.ForeignKey(Schedule, related_name="seatholds", on_delete=models.CASCADE)
    travel_date = models.DateField()
    seats = models.JSONField(help_text="List of seat numbers on hold, e.g. [3, 4]")
    session_key = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Hold on {self.schedule} [{self.seats}] for {self.travel_date}"

    @classmethod
    def active_holds_for(cls, schedule, travel_date):
        return cls.objects.filter(
            schedule=schedule,
            travel_date=travel_date,
            expires_at__gt=timezone.now(),
        )

    @classmethod
    def create_hold(cls, schedule, travel_date, seats, session_key, minutes=10):
        now = timezone.now()
        return cls.objects.create(
            schedule=schedule,
            travel_date=travel_date,
            seats=seats,
            session_key=session_key,
            expires_at=now + timedelta(minutes=minutes),
        )
