from django.db import models

class ESP_Class(models.Model):
    name = models.CharField(max_length=200)
    teacher_name = models.CharField(max_length=100)
    teacher_checked_in = models.BooleanField(default=False)
    room = models.CharField(max_length=50)
    capacity = models.IntegerField()
    overenrollment_cap = models.IntegerField()
    registration_open = models.BooleanField(default=True)
    start_time = models.CharField(max_length=20)
    end_time = models.CharField(max_length=20)
    category = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Enrollment(models.Model):
    esp_class = models.ForeignKey(
        ESP_Class, on_delete=models.CASCADE, 
        related_name='enrollments'
    )
    student_name = models.CharField(max_length=100)
    student_grade = models.IntegerField()
    checked_in = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student_name} - {self.esp_class.name}"

class OnsiteSettings(models.Model):
    global_registration_open = models.BooleanField(default=True)
    default_overenrollment_cap = models.IntegerField(default=5)
    event_name = models.CharField(max_length=100, 
                                  default="Splash 2026")

class Announcement(models.Model):
    message = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.message[:50]
