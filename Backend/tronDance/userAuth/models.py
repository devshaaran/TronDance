import uuid
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


username_regex = RegexValidator(regex='^[\w\d_]{1,30}$',
                                message="Username must only contain numbers, underscores and letters. Should be less "
                                        "than 30 characters long ")


def validate_username_for_invalid_usernames(username):
    if username.lower() == "me":
        raise ValidationError(
            _(f"Username unavailable. Please choose a different username")
        )


class UserManager(BaseUserManager):

    def create_user(self, email, password, username):
        if not email:
            raise ValueError(_("Email address must be provided"))
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.username = username
        user.save()
        return user

    def create_superuser(self, email, password, username):
        user = self.create_user(email=email, password=password, username=username)
        user.is_admin = True
        user.save()
        return user

    def update_username(self, email: str, username: str):
        user_instance = self.get(email=email)
        user_instance.username = username
        user_instance.clean_fields()
        user_instance.save()
        return user_instance


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(verbose_name=_("Email Address"), unique=True, max_length=200, db_index=True)
    username = models.CharField(max_length=50, unique=True,
                                validators=[username_regex, validate_username_for_invalid_usernames], db_index=True)
    user_uid = models.CharField(max_length=40, default=uuid.uuid4, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    # jwt_secret = models.UUIDField(default=uuid.uuid4)
    date_joined = models.DateTimeField(verbose_name=_("Joined on"), auto_now_add=True, db_index=True)

    objects = UserManager()

    REQUIRED_FIELDS = ["username"]

    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_admin

    @property
    def is_superuser(self):
        return self.is_admin

    def get_username(self):
        return self.username

    def get_email(self):
        return self.email

    def get_user_uid(self):
        return self.user_uid

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def get_tron_address(self):
        wallet_address = self.email.split('@')[0]
        return wallet_address