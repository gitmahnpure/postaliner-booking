from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import Booking, Location, Route, Schedule, SeatHold
from .management.commands.seed_data import LOCATIONS, ROUTES, SCHEDULES


class SeedDataMixin:
    @classmethod
    def setUpTestData(cls):
        for slug, name in LOCATIONS:
            Location.objects.update_or_create(slug=slug, defaults={"name": name})
        for slug, origin, destination, label in ROUTES:
            Route.objects.update_or_create(
                slug=slug,
                defaults={"origin_id": origin, "destination_id": destination, "label": label},
            )
        for route_slug, dep_time, coach, fare in SCHEDULES:
            Schedule.objects.update_or_create(
                route_id=route_slug,
                departure_time=dep_time,
                coach=coach,
                defaults={"total_seats": 44, "fare": fare},
            )


def auth_client(user=None):
    client = APIClient()
    if user is None:
        user = User.objects.create_user(username="testuser", password="testpass123")
    token, _ = Token.objects.get_or_create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client, user, token


class LocationListTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_list_locations(self):
        resp = self.client.get("/api/locations/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), len(LOCATIONS))


class RouteListTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_list_routes(self):
        resp = self.client.get("/api/routes/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), len(ROUTES))


class ScheduleListTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_list_schedules(self):
        resp = self.client.get("/api/schedules/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), len(SCHEDULES))

    def test_filter_by_route(self):
        resp = self.client.get("/api/schedules/?route=busia-nairobi")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        for sched in data["results"]:
            self.assertEqual(sched["routeId"], "busia-nairobi")


class SeatMapTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client = APIClient()
        self.schedule = Schedule.objects.first()

    def test_seat_map_requires_date(self):
        resp = self.client.get(f"/api/schedules/{self.schedule.id}/seats/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_seat_map_returns_seats(self):
        resp = self.client.get(f"/api/schedules/{self.schedule.id}/seats/?date=2026-08-01")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertEqual(data["totalSeats"], self.schedule.total_seats)
        self.assertIsInstance(data["bookedSeats"], list)


class CreateBookingTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client, self.user, _ = auth_client()
        self.schedule = Schedule.objects.first()
        self.busia = Location.objects.get(slug="busia")
        self.nairobi = Location.objects.get(slug="city_square")

    def test_create_booking_success(self):
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-08-15",
            "pickupId": self.busia.slug,
            "dropoffId": self.nairobi.slug,
            "seats": [1, 2],
            "customerName": "Test User",
            "customerPhone": "0712345678",
            "customerIdNumber": "ID12345",
            "customerEmail": "test@example.com",
        }
        resp = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        self.assertEqual(data["totalFare"], self.schedule.fare * 2)

    def test_create_booking_seat_clash(self):
        Booking.objects.create(
            schedule=self.schedule,
            travel_date=date(2026, 8, 15),
            pickup=self.busia,
            dropoff=self.nairobi,
            seats=[1],
            customer_name="First",
            customer_phone="0711111111",
            customer_id_number="ID1",
            total_fare=self.schedule.fare,
        )
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-08-15",
            "pickupId": self.busia.slug,
            "dropoffId": self.nairobi.slug,
            "seats": [1, 2],
            "customerName": "Second",
            "customerPhone": "0722222222",
            "customerIdNumber": "ID2",
            "customerEmail": "test2@example.com",
        }
        resp = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class AuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register(self):
        resp = self.client.post(
            "/api/auth/register/",
            {"username": "newuser", "email": "new@example.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["username"], "newuser")

    def test_login(self):
        User.objects.create_user(username="loginuser", password="secret123")
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "loginuser", "password": "secret123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn("token", data)

    def test_login_invalid(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "nonexistent", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_authenticated(self):
        client, _, token = auth_client()
        resp = client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["username"], "testuser")

    def test_me_unauthenticated(self):
        resp = self.client.get("/api/auth/me/")
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class SeatHoldTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client = APIClient()
        session = self.client.session
        session.save()
        self.schedule = Schedule.objects.first()

    def test_create_hold(self):
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-09-01",
            "seats": [5, 6],
        }
        resp = self.client.post("/api/holds/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        self.assertEqual(data["seats"], [5, 6])

    def test_hold_conflict_with_booking(self):
        busia = Location.objects.get(slug="busia")
        nairobi = Location.objects.get(slug="city_square")
        Booking.objects.create(
            schedule=self.schedule,
            travel_date=date(2026, 9, 1),
            pickup=busia,
            dropoff=nairobi,
            seats=[5],
            customer_name="Test",
            customer_phone="0711111111",
            customer_id_number="ID1",
            total_fare=self.schedule.fare,
        )
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-09-01",
            "seats": [5, 6],
        }
        resp = self.client.post("/api/holds/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_hold_then_booking_same_session(self):
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-09-01",
            "seats": [10, 11],
        }
        resp = self.client.post("/api/holds/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        busia = Location.objects.get(slug="busia")
        nairobi = Location.objects.get(slug="city_square")
        user = User.objects.create_user(username="booker", password="bookpass")
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        booking_payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-09-01",
            "pickupId": busia.slug,
            "dropoffId": nairobi.slug,
            "seats": [10],
            "customerName": "Test",
            "customerPhone": "0711111111",
            "customerIdNumber": "ID1",
        }
        resp = self.client.post("/api/bookings/", booking_payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_release_hold(self):
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-09-01",
            "seats": [7],
        }
        resp = self.client.post("/api/holds/", payload, format="json")
        hold_id = resp.json()["id"]
        resp = self.client.delete(f"/api/holds/{hold_id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_hold_expiry(self):
        SeatHold.create_hold(
            schedule=self.schedule,
            travel_date=date(2026, 9, 1),
            seats=[15],
            session_key="test-session",
            minutes=10,
        )
        self.assertEqual(SeatHold.active_holds_for(self.schedule, date(2026, 9, 1)).count(), 1)

    def test_hold_conflict_with_hold_other_session(self):
        SeatHold.create_hold(
            schedule=self.schedule,
            travel_date=date(2026, 9, 1),
            seats=[20],
            session_key="other-session",
            minutes=10,
        )
        payload = {
            "scheduleId": self.schedule.id,
            "travelDate": "2026-09-01",
            "seats": [20, 21],
        }
        resp = self.client.post("/api/holds/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class PaginationTest(SeedDataMixin, TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_pagination_structure(self):
        resp = self.client.get("/api/locations/")
        data = resp.json()
        self.assertIn("count", data)
        self.assertIn("next", data)
        self.assertIn("previous", data)
        self.assertIn("results", data)

    def test_page_size_parameter(self):
        resp = self.client.get("/api/locations/?page_size=2")
        data = resp.json()
        self.assertLessEqual(len(data["results"]), 2)
