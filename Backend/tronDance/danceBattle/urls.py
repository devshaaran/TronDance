from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path('complete/', views.CompleteDanceStageView.as_view(), name="complete-dance"),
    path('join/', views.JoinDanceStageView.as_view(), name="join-dance"),
    path('view/', views.DetailedDanceStageView.as_view(), name="view-dance"),
    path('start/', views.StartDanceStageView.as_view(), name="start-dance"),
]