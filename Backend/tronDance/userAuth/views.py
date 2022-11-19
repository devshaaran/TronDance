import datetime
import re

import logging
import pytz
import shortuuid

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import views, permissions, status
from rest_framework.response import Response
from userAuth.serializers import SignatureVerifyRequestSerializer
from userAuth.server_utility import Utility
from userAuth.view_utility import get_tokens_for_user, OauthUtility

USERNAME_SIZE = 30


class UserWalletAuthView(views.APIView):
    request_serializer = SignatureVerifyRequestSerializer

    def post(self, request):
        try:
            serializer = self.request_serializer(data=request.data)
            if serializer.is_valid() is False:
                return Response({
                    "status": "error",
                    "message": "Essential params missing/invalid",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

            data = dict(serializer.validated_data)

            if not data["tron_address"] or data["tron_address"][0] != "T":
                return Response({
                    "status": "error",
                    "message": "Tron address invalid",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

            user_address = data["tron_address"]
            user_signature = data["user_signature"]

            try:
                email = "{}@trondance.com".format(user_address)
                try:
                    if Utility.check_signature_owner(user_address, user_signature):
                        user_check = get_user_model().objects.filter(email=email)
                        if user_check:
                            user = get_user_model().objects.get(email__iexact=email)
                            return Response({
                                "status": "success",
                                "message": "Login Successful",
                                "token": get_tokens_for_user(user)
                            }, status=status.HTTP_200_OK)

                        else:
                            try:
                                username, user_pass = OauthUtility.credentials_for_oauth_client(
                                    email)
                                with transaction.atomic():
                                    user = get_user_model().objects.create_user(email, user_pass, username)
                            except Exception as e:
                                print("Fatal Error While Creating user", e)
                                return Response({
                                    "status": "error",
                                    "message": "Something went wrong",
                                    "payload": ""
                                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                            return Response({
                                "status": "success",
                                "message": "Signup Successful",
                                "token": get_tokens_for_user(user)
                            }, status=status.HTTP_200_OK)

                    return Response({
                        "status": "error",
                        "message": "Invalid Credentials, kindly login again (107)",
                        "payload": ""
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                except Exception:
                    print("Signature entered is corrupted or augmented")
                    return Response({
                        "status": "error",
                        "message": "Invalid Credentials, kindly login again",
                        "payload": ""
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except Exception:
                return Response({
                    "status": "error",
                    "message": "Invalid Credentials or Token Expired, kindly login again.",
                    "payload": ""
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception:
            return Response({
                "status": "error",
                "message": "Something went wrong, please try again (108)",
                "payload": ""
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UsernameView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        try:
            username = request.data.get('username')

            if username:
                username = username.lower()
                username_exists = get_user_model().objects.filter(username__iexact=username)
                if not username_exists:
                    if re.match(r'^[\w\d_]+$', username) and len(username) < USERNAME_SIZE:
                        _user = get_user_model().objects.update_username(email=request.user.email, username=username)
                        return Response({
                            "status": "success",
                            "message": "Username Update Successful",
                            "payload": username
                        }, status=status.HTTP_200_OK)
                    return Response({
                        "status": "error",
                        "message": "Invalid Characters",
                        "payload": username
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        "status": "error",
                        "message": "Username already exists",
                        "payload": username
                    }, status=status.HTTP_400_BAD_REQUEST)

            else:
                username = get_user_model().objects.get(email=request.user.email).username
                return Response({
                    "status": "success",
                    "message": "Username Retrieval Successful",
                    "payload": username
                }, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({
                "status": "error",
                "message": ve.messages[0],
                "payload": ""
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            ("Fatal Error While Username Change")
            return Response({
                "status": "error",
                "message": "Something went wrong",
                "payload": ""
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
