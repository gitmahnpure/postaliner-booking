from django.core.management.base import BaseCommand

from booking.models import Location, Route, Schedule

LOCATIONS = [
    ("bumala", "Bumala"),
    ("busia", "Busia"),
    ("city_square", "City Square"),
    ("kangemi", "Kangemi"),
    ("kisumu", "Kisumu"),
    ("luanda", "Luanda"),
    ("maseno", "Maseno"),
    ("ugunja", "Ugunja"),
    ("uthiru", "Uthiru"),
]

ROUTES = [
    ("busia-nairobi", "busia", "city_square", "Busia - Nairobi"),
    ("nairobi-busia", "city_square", "busia", "Nairobi - Busia"),
]

SCHEDULES = [
    ("busia-nairobi", "07:00", "PCK 101", 1200),
    ("busia-nairobi", "12:00", "PCK 104", 1200),
    ("busia-nairobi", "18:30", "PCK 107", 1350),
    ("busia-nairobi", "19:00", "PCK 102", 1350),
    ("busia-nairobi", "20:00", "PCK 110", 1350),
    ("nairobi-busia", "07:00", "PCK 201", 1200),
    ("nairobi-busia", "13:00", "PCK 205", 1200),
    ("nairobi-busia", "18:30", "PCK 208", 1350),
    ("nairobi-busia", "19:00", "PCK 203", 1350),
    ("nairobi-busia", "20:00", "PCK 211", 1350),
]


class Command(BaseCommand):
    help = "Seed the database with demo locations, routes and schedules."

    def handle(self, *args, **options):
        for slug, name in LOCATIONS:
            Location.objects.update_or_create(slug=slug, defaults={"name": name})
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(LOCATIONS)} locations"))

        for slug, origin, destination, label in ROUTES:
            Route.objects.update_or_create(
                slug=slug,
                defaults={"origin_id": origin, "destination_id": destination, "label": label},
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(ROUTES)} routes"))

        created = 0
        for route_slug, time_str, coach, fare in SCHEDULES:
            _, was_created = Schedule.objects.update_or_create(
                route_id=route_slug,
                departure_time=time_str,
                coach=coach,
                defaults={"total_seats": 44, "fare": fare},
            )
            created += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} schedules"))
