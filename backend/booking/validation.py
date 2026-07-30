from rest_framework import serializers

from .models import Booking, SeatHold


def validate_seats_list(value):
    if not value or not isinstance(value, list):
        raise serializers.ValidationError("Select at least one seat.")
    if len(set(value)) != len(value):
        raise serializers.ValidationError("Duplicate seats selected.")
    return value


def validate_seat_bounds(seats, total_seats):
    if max(seats) > total_seats or min(seats) < 1:
        raise serializers.ValidationError("One or more seats do not exist on this coach.")


def validate_seats_available(schedule, travel_date, seats, session_key=""):
    already_booked = set(
        s for seats_list in schedule.bookings.filter(travel_date=travel_date).values_list("seats", flat=True)
        for s in seats_list
    )
    clashing = already_booked.intersection(seats)
    if clashing:
        raise serializers.ValidationError(
            {"seats": f"Seat(s) {sorted(clashing)} are already booked for this trip and date."}
        )

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
