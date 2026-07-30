from django.urls import path

from . import authentication, views

urlpatterns = [
    path("locations/", views.LocationList.as_view()),
    path("routes/", views.RouteList.as_view()),
    path("schedules/", views.ScheduleList.as_view()),
    path("schedules/<int:schedule_id>/seats/", views.seat_map_view),
    path("bookings/my/", views.my_bookings_view),
    path("bookings/", views.BookingList.as_view()),
    path("bookings/<str:reference>/", views.booking_detail_view),
    path("holds/", views.create_hold_view),
    path("holds/<int:hold_id>/", views.release_hold_view),
    path("auth/register/", authentication.register_view),
    path("auth/login/", authentication.login_view),
    path("auth/me/", authentication.me_view),
]
