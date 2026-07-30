from django.contrib import admin

from .models import Booking, Location, Route, Schedule, SeatHold


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ["slug", "name"]


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ["slug", "label", "origin", "destination"]


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ["id", "route", "departure_time", "coach", "total_seats", "fare"]
    list_filter = ["route"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["reference", "schedule", "travel_date", "customer_name", "seats", "total_fare", "created_at"]
    list_filter = ["schedule__route", "travel_date"]
    search_fields = ["reference", "customer_name", "customer_phone"]
    readonly_fields = ["reference", "seats", "total_fare", "created_at"]
    list_select_related = ["schedule__route", "pickup", "dropoff"]
    date_hierarchy = "travel_date"
    raw_id_fields = ["schedule", "user"]


@admin.register(SeatHold)
class SeatHoldAdmin(admin.ModelAdmin):
    list_display = ["id", "schedule", "travel_date", "seats", "session_key", "created_at", "expires_at"]
    list_filter = ["schedule__route", "travel_date"]
    search_fields = ["session_key"]
    readonly_fields = ["seats", "created_at", "expires_at"]
    list_select_related = ["schedule__route"]
    date_hierarchy = "travel_date"
    raw_id_fields = ["schedule"]
