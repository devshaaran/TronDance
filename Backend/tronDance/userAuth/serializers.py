from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer
)

User = get_user_model()


class SignatureVerifyRequestSerializer(serializers.Serializer):
    tron_address = serializers.CharField(required=True, max_length=50, min_length=30)
    user_signature = serializers.CharField(required=True, max_length=150, min_length=50)

    class Meta:
        fields = ["tron_address", "user_signature"]
