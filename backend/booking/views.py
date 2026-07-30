from datetime import date as date_cls

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from .models import Booking, Location, Route, Schedule, SeatHold
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    LocationSerializer,
    RouteSerializer,
    ScheduleSerializer,
    SeatHoldSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class LocationList(ListAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    pagination_class = StandardPagination


class RouteList(ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    pagination_class = StandardPagination


class ScheduleList(ListAPIView):
    serializer_class = ScheduleSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Schedule.objects.select_related("route")
        route_id = self.request.query_params.get("route")
        if route_id:
            qs = qs.filter(route_id=route_id)
        return qs


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


class BookingList(ListAPIView):
    serializer_class = BookingSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Booking.objects.none()
        return Booking.objects.filter(user=self.request.user).select_related(
            "schedule__route", "pickup", "dropoff"
        )

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        schedule_id = request.data.get("scheduleId")
        if schedule_id:
            Schedule.objects.select_for_update().filter(pk=schedule_id).first()

        context = {"session_key": request.session.session_key or ""}
        if request.user.is_authenticated:
            context["user"] = request.user
        serializer = BookingCreateSerializer(data=request.data, context=context)
        if serializer.is_valid():
            booking = serializer.save(user=context.get("user"))
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookings_view(request):
    bookings = Booking.objects.filter(user=request.user).select_related(
        "schedule__route", "pickup", "dropoff"
    )
    return Response(BookingSerializer(bookings, many=True).data)


@api_view(["GET"])
def booking_detail_view(request, reference):
    booking = get_object_or_404(
        Booking.objects.select_related("schedule__route", "pickup", "dropoff"),
        reference=reference,
    )
    if not request.user.is_authenticated or booking.user != request.user:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(BookingSerializer(booking).data)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def create_hold_view(request):
    session_key = request.session.session_key
    if not session_key:
        request.session.save()
        session_key = request.session.session_key

    schedule_id = request.data.get("scheduleId")
    if schedule_id:
        Schedule.objects.select_for_update().filter(pk=schedule_id).first()

    context = {"session_key": session_key}
    serializer = SeatHoldSerializer(data=request.data, context=context)
    if serializer.is_valid():
        hold = SeatHold.create_hold(
            schedule=serializer.validated_data["schedule"],
            travel_date=serializer.validated_data["travel_date"],
            seats=serializer.validated_data["seats"],
            session_key=session_key,
        )
        return Response(SeatHoldSerializer(hold).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def release_hold_view(request, hold_id):
    hold = get_object_or_404(SeatHold, pk=hold_id)
    session_key = request.session.session_key
    if hold.session_key != session_key:
        return Response({"detail": "You do not own this hold."}, status=status.HTTP_403_FORBIDDEN)
    hold.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
