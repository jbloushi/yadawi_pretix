from django.urls import path
from . import views

urlpatterns = [
    path('nbk/return/<str:order>/<str:hash>/', views.nbk_return, name='return'),
    path('nbk/webhook/', views.nbk_webhook, name='webhook'),
]
