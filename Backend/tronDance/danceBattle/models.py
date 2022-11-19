import shortuuid
from django.contrib.auth import get_user_model
from django.db import models
from django.dispatch import receiver
from django.utils import timezone
from userAuth.models import User
from django.utils.translation import gettext_lazy as _
import random as rand
import string

SONGS = ["Gangnam-Style", "Rasputin", "Pink-Venom", "Dance-Monkey", "YMCA"]

# SONGS = ["Gangnam-Style"]

def half_minute_hence():
    return timezone.now() + timezone.timedelta(seconds=30)


def one_minute_hence():
    return timezone.now() + timezone.timedelta(seconds=60)


def song_pick():
    return rand.choice(SONGS)


def get_random_string(length=5):
    # choose from all lowercase letter
    letters = string.ascii_uppercase
    result_str = ''.join(rand.choice(letters) for i in range(length))
    return result_str


# Create your models here.
class DanceStage(models.Model):
    TEAMING = "teaming"  # team not full
    READY = "ready"  # ready for dance
    COMPLETED = "completed"  # dance completed

    match_id = models.CharField(max_length=30, default=get_random_string, unique=True)
    dancer1 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="dancer_profile1"
    )
    dancer2 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="dancer_profile2", null=True
    )
    dancer1_move = models.CharField(max_length=250, blank=True)
    dancer2_move = models.CharField(max_length=250, blank=True)
    song = models.CharField(max_length=50, default=song_pick, db_index=True)
    status = models.CharField(verbose_name=_("Dance Status"),
                              default=TEAMING, db_index=True, max_length=15)
    match_start = models.DateTimeField("MatchStart", null=True, db_index=True)
    created_at = models.DateTimeField("Created", auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField("Updated", auto_now=True)

