from rest_framework import serializers

from danceBattle.models import DanceStage

from userAuth.models import User


# match_id = models.CharField(max_length=30, default=shortuuid.uuid, unique=True)
#     dancer1 = models.ForeignKey(
#         User, on_delete=models.CASCADE, related_name="dancer_profile1"
#     )
#     dancer2 = models.ForeignKey(
#         User, on_delete=models.CASCADE, related_name="dancer_profile2", null=True
#     )
#     dancer1_move = models.CharField(max_length=250, blank=True)
#     dancer2_move = models.CharField(max_length=250, blank=True)
#     song = models.CharField(max_length=50, blank=True, db_index=True)
#     status = models.CharField(verbose_name=_("Dance Status"),
#                               default=TEAMING, db_index=True, max_length=15)
#     match_start = models.DateTimeField("MatchStart", null=True, db_index=True)
#     created_at = models.DateTimeField("Created", auto_now_add=True, db_index=True)
#     updated_at = models.DateTimeField("Updated", auto_now=True)

# class CustomerViewSerializer(serializers.ModelSerializer):
#
#      = serializers.CharField(source="user.get_username", read_only=True)
#     customer_id = serializers.UUIDField(read_only=True, source="id")
#     img = ImageSerializer(read_only=True)
#
#     class Meta:
#         model = CustomerProfile
#         fields = ("name", "customer_id", "img", "username", "stark_key", "email")


class UserPublicViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email",)


class DanceStagePublicViewSerializer(serializers.ModelSerializer):

    dancer1 = UserPublicViewSerializer(read_only=True)
    dancer2 = UserPublicViewSerializer(read_only=True)

    class Meta:
        model = DanceStage
        fields = ("match_id", "dancer1", "dancer2", "status", "song", "match_start", "created_at")