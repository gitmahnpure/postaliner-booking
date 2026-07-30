from django.core.management.base import BaseCommand
from django.utils import timezone

from booking.models import SeatHold


class Command(BaseCommand):
    help = "Delete expired seat holds."

    def handle(self, *args, **options):
        count, _ = SeatHold.objects.filter(expires_at__lte=timezone.now()).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} expired holds."))
