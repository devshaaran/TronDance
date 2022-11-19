from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path('username/', views.UsernameView.as_view(), name="user-username-edit"),
    path('login/wallet/', views.UserWalletAuthView.as_view(), name="user-wallet-login"),
]

urlpatterns += [
    path('login/', views.UserWalletAuthView.as_view(), name="user_wallet_login"),
]
