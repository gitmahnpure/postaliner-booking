from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Booking, Location, Route, Schedule, SeatHold
from .validation import validate_seats_available, validate_seats_list, validate_seat_bounds


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
    departureTime = serializers.TimeField(source="departure_time", format="%H:%M")
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
        return validate_seats_list(value)

    def validate(self, attrs):
        schedule = attrs["schedule"]
        travel_date = attrs["travel_date"]
        seats = attrs["seats"]
        validate_seat_bounds(seats, schedule.total_seats)
        validate_seats_available(schedule, travel_date, seats, self.context.get("session_key", ""))
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
    travelDate = serializers.DateField(source="travel_date")
    customerName = serializers.CharField(source="customer_name")
    customerPhone = serializers.CharField(source="customer_phone")
    customerIdNumber = serializers.CharField(source="customer_id_number")
    customerEmail = serializers.EmailField(source="customer_email")
    totalFare = serializers.IntegerField(source="total_fare")
    createdAt = serializers.DateTimeField(source="created_at")

    class Meta:
        model = Booking
        fields = [
            "reference",
            "schedule",
            "travelDate",
            "pickup",
            "dropoff",
            "seats",
            "customerName",
            "customerPhone",
            "customerIdNumber",
            "customerEmail",
            "totalFare",
            "createdAt",
        ]


class SeatHoldSerializer(serializers.ModelSerializer):
    scheduleId = serializers.PrimaryKeyRelatedField(source="schedule", queryset=Schedule.objects.all())
    travelDate = serializers.DateField(source="travel_date")

    class Meta:
        model = SeatHold
        fields = ["id", "scheduleId", "travelDate", "seats", "session_key", "expires_at", "created_at"]
        read_only_fields = ["id", "session_key", "expires_at", "created_at"]

    def validate_seats(self, value):
        return validate_seats_list(value)

    def validate(self, attrs):
        schedule = attrs["schedule"]
        travel_date = attrs["travel_date"]
        seats = attrs["seats"]
        validate_seat_bounds(seats, schedule.total_seats)
        validate_seats_available(schedule, travel_date, seats, self.context.get("session_key", ""))
        return attrs
