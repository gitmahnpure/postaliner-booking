from datetime import date as date_cls

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Booking, Location, Route, Schedule
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    LocationSerializer,
    RouteSerializer,
    ScheduleSerializer,
)


@api_view(["GET"])
def locations_view(request):
    return Response(LocationSerializer(Location.objects.all(), many=True).data)


@api_view(["GET"])
def routes_view(request):
    return Response(RouteSerializer(Route.objects.all(), many=True).data)


@api_view(["GET"])
def schedules_view(request):
    qs = Schedule.objects.select_related("route")
    route_id = request.query_params.get("route")
    if route_id:
        qs = qs.filter(route_id=route_id)
    return Response(ScheduleSerializer(qs, many=True).data)


@api_view(["GET"])
def seat_map_view(request, schedule_id):
    schedule = get_object_or_404(Schedule, pk=schedule_id)
    date_str = request.query_params.get("date")
    if not date_str:
        return Response({"detail": "Query param 'date' (YYYY-MM-DD) is required."}, status=400)
    try:
        travel_date = date_cls.fromisoformat(date_str)
    except ValueError:
        return Response({"detail": "Invalid date format, expected YYYY-MM-DD."}, status=400)

    booked = schedule.booked_seats_for(travel_date)
    return Response(
        {
            "scheduleId": schedule.id,
            "date": date_str,
            "totalSeats": schedule.total_seats,
            "bookedSeats": sorted(set(booked)),
            "fare": schedule.fare,
        }
    )


@api_view(["POST"])
def create_booking_view(request):
    serializer = BookingCreateSerializer(data=request.data)
    if serializer.is_valid():
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def booking_detail_view(request, reference):
    booking = get_object_or_404(Booking, reference=reference)
    return Response(BookingSerializer(booking).data)
