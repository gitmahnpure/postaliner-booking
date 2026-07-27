from rest_framework import serializers

from .models import Booking, Location, Route, Schedule


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

        already_booked = set(schedule.booked_seats_for(travel_date))
        clashing = already_booked.intersection(seats)
        if clashing:
            raise serializers.ValidationError(
                {"seats": f"Seat(s) {sorted(clashing)} are already booked for this trip and date."}
            )
        return attrs

    def create(self, validated_data):
        schedule = validated_data["schedule"]
        seats = validated_data["seats"]
        validated_data["total_fare"] = schedule.fare * len(seats)
        return super().create(validated_data)


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
