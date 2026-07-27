from django.urls import path

from . import views

urlpatterns = [
    path("locations/", views.locations_view),
    path("routes/", views.routes_view),
    path("schedules/", views.schedules_view),
    path("schedules/<int:schedule_id>/seats/", views.seat_map_view),
    path("bookings/", views.create_booking_view),
    path("bookings/<str:reference>/", views.booking_detail_view),
]
