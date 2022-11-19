import hashlib

from django.conf import settings
import secrets
import string
from django.contrib.auth import get_user_model
from typing import Tuple

from rest_framework_simplejwt.tokens import RefreshToken


class OauthUtility:

    @staticmethod
    def random_string_generator(length: int) -> str:
        return ''.join(secrets.choice(string.ascii_lowercase + string.digits) for i in range(length))

    @staticmethod
    def oauth_gmail_username_generator(email_part: str) -> str:
        """
        Takes an email and generates a username for the google sign in oauth
        """
        flag = True
        email_part = email_part.lower()
        email_part_filtering = ''.join([character for character in email_part if character.isalnum()])
        username_len = len(email_part_filtering)
        while flag:
            if username_len <= 6:
                username = email_part_filtering + OauthUtility.random_string_generator(10 - username_len)
            else:
                username = email_part_filtering[:6] + OauthUtility.random_string_generator(4)

            flag = get_user_model().objects.filter(username=username).exists()

        return username + "tronDance"

    def oauth_gmail_password_generator(email_part: str) -> str:
        email_hash = hashlib.sha1(email_part.encode("UTF-8")).hexdigest()
        email_hash = email_hash[:10]
        return f"_@717" + email_hash + f"_@717"

    @staticmethod
    def credentials_for_oauth_client(email: str) -> Tuple[str, str]:
        """
        Takes an email id and returns a username and password for the oauth client
        """
        email_part = email.split('@')[0]
        username = OauthUtility.oauth_gmail_username_generator(email_part)
        user_pass = OauthUtility.oauth_gmail_password_generator(email_part)
        return username, user_pass


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }