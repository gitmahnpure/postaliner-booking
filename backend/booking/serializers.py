from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Booking, Location, Route, Schedule, SeatHold


class LocationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug")

    class Meta:
        model = Location
        fields = ["id", "name"]


class RouteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug")
    originId = serializers.CharField(source="origin_id")
    destinationId = serializers.CharField(source="destination_id")

    class Meta:
        model = Route
        fields = ["id", "originId", "destinationId", "label"]


class ScheduleSerializer(serializers.ModelSerializer):
    routeId = serializers.CharField(source="route_id")
    departureTime = serializers.CharField(source="departure_time")
    totalSeats = serializers.IntegerField(source="total_seats")

    class Meta:
        model = Schedule
        fields = ["id", "routeId", "departureTime", "coach", "totalSeats", "fare"]


class SeatMapSerializer(serializers.Serializer):
    scheduleId = serializers.IntegerField(source="schedule_id")
    date = serializers.DateField()
    totalSeats = serializers.IntegerField()
    bookedSeats = serializers.ListField(child=serializers.IntegerField())


class BookingCreateSerializer(serializers.ModelSerializer):
    scheduleId = serializers.PrimaryKeyRelatedField(source="schedule", queryset=Schedule.objects.all())
    travelDate = serializers.DateField(source="travel_date")
    pickupId = serializers.SlugRelatedField(source="pickup", slug_field="slug", queryset=Location.objects.all())
    dropoffId = serializers.SlugRelatedField(source="dropoff", slug_field="slug", queryset=Location.objects.all())
    customerName = serializers.CharField(source="customer_name")
    customerPhone = serializers.CharField(source="customer_phone")
    customerIdNumber = serializers.CharField(source="customer_id_number")
    customerEmail = serializers.EmailField(source="customer_email", required=False, allow_blank=True)

    class Meta:
        model = Booking
        fields = [
            "scheduleId",
            "travelDate",
            "pickupId",
            "dropoffId",
            "seats",
            "customerName",
            "customerPhone",
            "customerIdNumber",
            "customerEmail",
        ]

    def validate_seats(self, value):
        if not value or not isinstance(value, list):
            raise serializers.ValidationError("Select at least one seat.")
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate seats selected.")
        return value

    def validate(self, attrs):
        schedule = attrs["schedule"]
        travel_date = attrs["travel_date"]
        seats = attrs["seats"]

        if max(seats) > schedule.total_seats or min(seats) < 1:
            raise serializers.ValidationError("One or more seats do not exist on this coach.")

        already_booked = set(
            s for seats_list in schedule.bookings.filter(travel_date=travel_date).values_list("seats", flat=True)
            for s in seats_list
        )
        clashing = already_booked.intersection(seats)
        if clashing:
            raise serializers.ValidationError(
                {"seats": f"Seat(s) {sorted(clashing)} are already booked for this trip and date."}
            )

        session_key = self.context.get("session_key", "")
        active_holds = SeatHold.active_holds_for(schedule, travel_date)
        for hold in active_holds:
            if hold.session_key == session_key:
                continue
            hold_seats = set(hold.seats)
            clashing = hold_seats.intersection(seats)
            if clashing:
                raise serializers.ValidationError(
                    {"seats": f"Seat(s) {sorted(clashing)} are currently on hold for this trip."}
                )
        return attrs

    def create(self, validated_data):
        schedule = validated_data["schedule"]
        seats = validated_data["seats"]
        validated_data["total_fare"] = schedule.fare * len(seats)
        return super().create(validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class BookingSerializer(serializers.ModelSerializer):
    schedule = ScheduleSerializer()
    pickup = LocationSerializer()
    dropoff = LocationSerializer()

    class Meta:
        model = Booking
        fields = [
            "reference",
            "schedule",
            "travel_date",
            "pickup",
            "dropoff",
            "seats",
            "customer_name",
            "customer_phone",
            "customer_id_number",
            "customer_email",
            "total_fare",
            "created_at",
        ]


class SeatHoldSerializer(serializers.ModelSerializer):
    scheduleId = serializers.PrimaryKeyRelatedField(source="schedule", queryset=Schedule.objects.all())
    travelDate = serializers.DateField(source="travel_date")

    class Meta:
        model = SeatHold
        fields = ["id", "scheduleId", "travelDate", "seats", "session_key", "expires_at", "created_at"]
        read_only_fields = ["id", "session_key", "expires_at", "created_at"]

    def validate_seats(self, value):
        if not value or not isinstance(value, list):
            raise serializers.ValidationError("Select at least one seat.")
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate seats selected.")
        return value

    def validate(self, attrs):
        schedule = attrs["schedule"]
        travel_date = attrs["travel_date"]
        seats = attrs["seats"]

        if max(seats) > schedule.total_seats or min(seats) < 1:
            raise serializers.ValidationError("One or more seats do not exist on this coach.")

        already_booked = set(
            s for seats_list in schedule.bookings.filter(travel_date=travel_date).values_list("seats", flat=True)
            for s in seats_list
        )
        clashing = already_booked.intersection(seats)
        if clashing:
            raise serializers.ValidationError(
                {"seats": f"Seat(s) {sorted(clashing)} are already booked for this trip and date."}
            )

        session_key = self.context.get("session_key", "")
        active_holds = SeatHold.active_holds_for(schedule, travel_date)
        for hold in active_holds:
            if hold.session_key == session_key:
                continue
            hold_seats = set(hold.seats)
            clashing = hold_seats.intersection(seats)
            if clashing:
                raise serializers.ValidationError(
                    {"seats": f"Seat(s) {sorted(clashing)} are currently on hold for this trip."}
                )
        return attrs
