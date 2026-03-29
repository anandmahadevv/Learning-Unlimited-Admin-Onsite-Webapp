from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('classes/<int:class_id>/', views.class_detail, name='class_detail'),
    path('settings/', views.settings_page, name='settings'),
    
    # API endpoints
    path('api/classes/', views.api_classes_list, name='api_classes_list'),
    path('api/classes/<int:class_id>/', views.api_class_detail, name='api_class_detail'),
    path('api/classes/<int:class_id>/toggle-registration/', views.api_toggle_registration, name='api_toggle_registration'),
    path('api/classes/<int:class_id>/toggle-teacher-checkin/', views.api_toggle_teacher_checkin, name='api_toggle_teacher_checkin'),
    path('api/students/<int:enrollment_id>/toggle-checkin/', views.api_toggle_student_checkin, name='api_toggle_student_checkin'),
    path('api/classes/<int:class_id>/update-cap/', views.api_update_cap, name='api_update_cap'),
    path('api/settings/', views.api_settings, name='api_settings'),
]
