from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
import datetime
import re
from tronpy import Tron
import logging
import pytz
import shortuuid
from tronpy.keys import PrivateKey
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from danceBattle.models import DanceStage

from danceBattle.serializers import DanceStagePublicViewSerializer

TEAMING = "teaming"  # team not full
READY = "ready"  # ready for dance
COMPLETED = "completed"  # dance completed

SONG_TIME = {"Gangnam-Style": 300, "Rasputin": 310, "Pink-Venom": 320, "Dance-Monkey": 360, "YMCA": 330}

client = Tron(network='nile')
priv_key = PrivateKey(bytes.fromhex("b3e187f86ab7bc3ff64d9c02ec7342ceb1601f2d2e3d14e8d78e52560ca6a170"))
contract = client.get_contract('TTG6tyv5ACmF4gKdARDSTzj3kkuvnVHH4H')


def time_hence(timed=timezone.now(), seconds=90):
    return timed + timezone.timedelta(seconds=seconds)


def get_address(email):
    email = email.split("@")
    return email[0]


def decrypt_moves(moves):
    m = ""

    if moves == "":
        return 0

    for i in moves[:76]:
        if (i == "T"):
            m = m + "4"
        elif (i == "Q"):
            m = m + "3"
        elif (i == "M"):
            m = m + "2"
        else:
            m = m + "1"
    return int(m)


def get_sum(n):
    sum = 0
    for digit in str(n):
        sum += int(digit)
    return sum


def complete_battle(dancer1, dancer2, movements1, movements2, danceBattleID):
    print(dancer1, dancer2, movements1, movements2, danceBattleID)
    txn = (
        contract.functions.battledone(dancer1, dancer2, movements1, movements2, danceBattleID)
        .with_owner('TAL3XRC9qVnhYe8zDrGhURqX6Z1ZgpbxXP')  # address of the private key
        .fee_limit(100_000_000)
        .build()
        .sign(priv_key))
    transactioned = txn.broadcast()
    print(transactioned)
    return transactioned


class StartDanceStageView(APIView):
    permission_classes = [IsAuthenticated]
    request_serializer = None

    def post(self, request):

        try:
            address = get_address(request.user.email)
            available_balance = contract.functions.retrieveDancerBalance(address)
            if available_balance < 4999999:
                return Response({
                    "status": "error",
                    "message": "Balance insufficient",
                    "payload": {}
                }, status=status.HTTP_400_BAD_REQUEST)

            time_of_expiry = timezone.now() - timezone.timedelta(seconds=80)
            available_stages = DanceStage.objects.filter(created_at__gte=time_of_expiry, status=TEAMING)
            if available_stages:
                serializer = DanceStagePublicViewSerializer(available_stages, many=True)
                return Response({
                        "status": "success",
                        "message": "Successful",
                        "payload": serializer.data
                    }, status=status.HTTP_200_OK)
            else:
                stage_created = DanceStage.objects.create(dancer1=request.user)
                match_id = stage_created.match_id
                song = stage_created.song

                return Response({
                    "status": "error",
                    "message": "Created new stage",
                    "payload": [{
                        "match_id": match_id,
                        "song": song,
                        "dancer2": None,
                        "new": True
                    }]
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(e)
            return Response({
                "status": "error",
                "message": "Unable to create/get dance floor",
                "payload": ""
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DetailedDanceStageView(APIView):
    permission_classes = [IsAuthenticated]
    request_serializer = None

    def post(self, request):

        try:
            match_id = request.data.get("match_id")

            if not match_id or match_id=="":
                return Response({
                    "status": "error",
                    "message": "Invalid Match ID",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

            available_stages = DanceStage.objects.filter(match_id=match_id)
            if available_stages:
                serializer = DanceStagePublicViewSerializer(available_stages[0])
                return Response({
                        "status": "success",
                        "message": "Successfully Retrieved",
                        "payload": serializer.data
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "message": "No dance floor found",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response({
                "status": "error",
                "message": "Unable to create/get dance floor",
                "payload": ""
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JoinDanceStageView(APIView):
    permission_classes = [IsAuthenticated]
    request_serializer = None

    def post(self, request):

        try:
            match_id = request.data.get("match_id")

            if not match_id or match_id == "":
                return Response({
                    "status": "error",
                    "message": "Invalid Match ID",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

            address = get_address(request.user.email)
            available_balance = contract.functions.retrieveDancerBalance(address)
            print(available_balance)
            if available_balance < 4999999:
                return Response({
                    "status": "error",
                    "message": "Balance insufficient",
                    "payload": {}
                }, status=status.HTTP_400_BAD_REQUEST)

            available_stages = DanceStage.objects.filter(match_id=match_id)
            if available_stages:
                dance_stage_instance = available_stages[0]

                if dance_stage_instance.status == TEAMING and time_hence(dance_stage_instance.created_at) < timezone.now():
                    dance_stage_instance.status = "expired"
                    dance_stage_instance.save()
                    return Response({
                        "status": "error",
                        "message": "Dance floor timeout!",
                        "payload": ""
                    }, status=status.HTTP_400_BAD_REQUEST)

                if request.user == dance_stage_instance.dancer1:
                    return Response({
                        "status": "error",
                        "message": "You cannot join your own dance floor!",
                        "payload": ""
                    }, status=status.HTTP_400_BAD_REQUEST)

                if not dance_stage_instance.dancer2 and dance_stage_instance.status == TEAMING:
                    dance_stage_instance.dancer2 = request.user
                    dance_stage_instance.status = READY
                    match_start_time = timezone.now() + timezone.timedelta(seconds=40)
                    dance_stage_instance.match_start = match_start_time

                    with transaction.atomic():
                        dance_stage_instance.save()

                    return Response({
                        "status": "success",
                        "message": "Successfully Joined",
                        "payload": {
                            "match_start": match_start_time.timestamp()
                        }
                    }, status=status.HTTP_200_OK)

                else:
                    return Response({
                        "status": "error",
                        "message": "Dance floor full!",
                        "payload": ""
                    }, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response({
                    "status": "error",
                    "message": "No dance floor found",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response({
                "status": "error",
                "message": "Unable to join dance floor",
                "payload": ""
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteDanceStageView(APIView):
    permission_classes = [IsAuthenticated]
    request_serializer = None

    def post(self, request):

        try:
            match_id = request.data.get("match_id")
            moves = request.data.get("moves")

            if not match_id or match_id == "":
                return Response({
                    "status": "error",
                    "message": "Invalid Match ID",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

            available_stages = DanceStage.objects.filter(status=READY, match_id=match_id)
            if available_stages:
                dance_stage_instance = available_stages[0]
                song = dance_stage_instance.song
                dancer2_address = get_address(dance_stage_instance.dancer2.email)
                dancer1_address = get_address(dance_stage_instance.dancer1.email)
                match_start_time = dance_stage_instance.match_start
                print(match_start_time.timestamp())
                print(time_hence(match_start_time, SONG_TIME[song]).timestamp())
                print(time_hence(match_start_time, SONG_TIME[song]).timestamp() - timezone.now().timestamp())
                if match_start_time and time_hence(match_start_time, SONG_TIME[song]) > timezone.now():

                    # If user is dancer 1
                    if request.user == dance_stage_instance.dancer1:
                        dance_stage_instance.dancer1_move = moves
                        dance_stage_instance.save()
                        if dance_stage_instance.dancer2_move:  # If user 2 dance is completed

                            result = complete_battle(dancer1_address, dancer2_address, decrypt_moves(moves),
                                                     decrypt_moves(dance_stage_instance.dancer2_move), match_id)
                            if result["result"]:
                                dance_stage_instance.status = COMPLETED
                                dance_stage_instance.save()
                                return Response({
                                    "status": "success",
                                    "message": "Successfully Completed",
                                    "payload": result,
                                    "me": get_sum(decrypt_moves(moves)),
                                    "opp": get_sum(decrypt_moves(dance_stage_instance.dancer2_move))
                                }, status=status.HTTP_200_OK)

                            else:
                                return Response({
                                    "status": "error",
                                    "message": "Please try again there was a issue",
                                    "payload": ""
                                }, status=status.HTTP_400_BAD_REQUEST)

                        else:
                            return Response({
                                "status": "success",
                                "message": "Successfully Completed",
                                "payload": {
                                    "wait_until": time_hence(match_start_time, SONG_TIME[song]).timestamp()
                                }
                            }, status=status.HTTP_200_OK)

                    # If dancer is 2
                    elif request.user == dance_stage_instance.dancer2:
                        dance_stage_instance.dancer2_move = moves
                        dance_stage_instance.save()
                        if dance_stage_instance.dancer1_move:  # If user 1 dance is completed

                            result = complete_battle(dancer1_address, dancer2_address, decrypt_moves(dance_stage_instance.dancer1_move),
                                                     decrypt_moves(moves), match_id)
                            if result["result"]:
                                dance_stage_instance.status = COMPLETED
                                dance_stage_instance.save()
                                return Response({
                                    "status": "success",
                                    "message": "Successfully Completed",
                                    "payload": result,
                                    "me": get_sum(decrypt_moves(moves)),
                                    "opp": get_sum(decrypt_moves(dance_stage_instance.dancer1_move))
                                }, status=status.HTTP_200_OK)
                            else:
                                return Response({
                                    "status": "error",
                                    "message": "Please try again there was a issue",
                                    "payload": ""
                                }, status=status.HTTP_400_BAD_REQUEST)

                        else:
                            return Response({
                                "status": "success",
                                "message": "Successfully Completed",
                                "payload": {
                                    "wait_until": time_hence(match_start_time, SONG_TIME[song]).timestamp()
                                }
                            }, status=status.HTTP_200_OK)

                    else:
                        return Response({
                            "status": "error",
                            "message": "User validation failed!",
                            "payload": ""
                        }, status=status.HTTP_400_BAD_REQUEST)

                else:

                    if dance_stage_instance.dancer1_move != "" or dance_stage_instance.dancer2_move != "":
                        result = complete_battle(dancer1_address, dancer2_address,
                                                 decrypt_moves(dance_stage_instance.dancer1_move),
                                                 decrypt_moves(dance_stage_instance.dancer2_move), match_id)
                        if result["result"]:
                            dance_stage_instance.status = COMPLETED
                            dance_stage_instance.save()
                            if request.user == dance_stage_instance.dancer1:
                                return Response({
                                    "status": "success",
                                    "message": "Successfully Completed",
                                    "payload": result,
                                    "me": get_sum(decrypt_moves(dance_stage_instance.dancer1_move)),
                                    "opp": get_sum(decrypt_moves(dance_stage_instance.dancer2_move))
                                }, status=status.HTTP_200_OK)
                            else:
                                return Response({
                                    "status": "success",
                                    "message": "Successfully Completed",
                                    "payload": result,
                                    "opp": get_sum(decrypt_moves(dance_stage_instance.dancer1_move)),
                                    "me": get_sum(decrypt_moves(dance_stage_instance.dancer2_move))
                                }, status=status.HTTP_200_OK)

                        else:
                            return Response({
                                "status": "error",
                                "message": "Please try again there was a issue",
                                "payload": ""
                            }, status=status.HTTP_400_BAD_REQUEST)

                    return Response({
                        "status": "error",
                        "message": "Dance expired!",
                        "payload": ""
                    }, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response({
                    "status": "error",
                    "message": "No dance floor found",
                    "payload": ""
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response({
                "status": "error",
                "message": "Unable to complete dance floor",
                "payload": ""
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
