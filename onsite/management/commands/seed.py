import random
from django.core.management.base import BaseCommand
from onsite.models import ESP_Class, Enrollment, OnsiteSettings

class Command(BaseCommand):
    help = 'Seeds exactly 10 classes with realistic data'

    def handle(self, *args, **kwargs):
        # Clear existing data
        ESP_Class.objects.all().delete()
        Enrollment.objects.all().delete()
        OnsiteSettings.objects.all().delete()

        # Create settings
        OnsiteSettings.objects.create(
            global_registration_open=True,
            default_overenrollment_cap=5,
            event_name="Splash 2026"
        )

        classes_data = [
            {
                "name": "Introduction to Machine Learning",
                "teacher": "Dr. Sarah Chen", "room": "101", "cap": 30,
                "over": 35, "start": "9:00 AM", "end": "10:30 AM",
                "cat": "Computer Science", "enrolled_count": 28, "checked_in_count": 22,
                "teacher_checked": True, "reg_open": False
            },
            {
                "name": "Creative Writing Workshop",
                "teacher": "Mr. James Patel", "room": "202", "cap": 20,
                "over": 22, "start": "9:00 AM", "end": "10:30 AM",
                "cat": "English", "enrolled_count": 14, "checked_in_count": 8,
                "teacher_checked": True, "reg_open": True
            },
            {
                "name": "Intro to Organic Chemistry",
                "teacher": "Dr. Emily Rodriguez", "room": "Lab A", "cap": 25,
                "over": 25, "start": "11:00 AM", "end": "12:30 PM",
                "cat": "Science", "enrolled_count": 25, "checked_in_count": 0,
                "teacher_checked": False, "reg_open": False
            },
            {
                "name": "Game Development with Unity",
                "teacher": "Ms. Priya Kumar", "room": "305", "cap": 20,
                "over": 22, "start": "11:00 AM", "end": "12:30 PM",
                "cat": "Computer Science", "enrolled_count": 10, "checked_in_count": 10,
                "teacher_checked": True, "reg_open": True
            },
            {
                "name": "Philosophy of Ethics",
                "teacher": "Prof. David Lee", "room": "Auditorium", "cap": 50,
                "over": 55, "start": "1:00 PM", "end": "2:30 PM",
                "cat": "Humanities", "enrolled_count": 32, "checked_in_count": 15,
                "teacher_checked": True, "reg_open": True
            },
            {
                "name": "Robotics and Automation",
                "teacher": "Mr. Ankit Shah", "room": "Lab B", "cap": 15,
                "over": 15, "start": "1:00 PM", "end": "2:30 PM",
                "cat": "Engineering", "enrolled_count": 15, "checked_in_count": 15,
                "teacher_checked": True, "reg_open": False
            },
            {
                "name": "Introduction to Economics",
                "teacher": "Ms. Laura Wong", "room": "210", "cap": 35,
                "over": 38, "start": "2:45 PM", "end": "4:15 PM",
                "cat": "Social Science", "enrolled_count": 5, "checked_in_count": 0,
                "teacher_checked": False, "reg_open": True
            },
            {
                "name": "Painting and Mixed Media Art",
                "teacher": "Mr. Carlos Rivera", "room": "Art Room", "cap": 18,
                "over": 20, "start": "2:45 PM", "end": "4:15 PM",
                "cat": "Arts", "enrolled_count": 18, "checked_in_count": 12,
                "teacher_checked": True, "reg_open": False
            },
            {
                "name": "Astrophysics for Beginners",
                "teacher": "Dr. Neha Singh", "room": "112", "cap": 30,
                "over": 33, "start": "9:00 AM", "end": "10:30 AM",
                "cat": "Science", "enrolled_count": 22, "checked_in_count": 18,
                "teacher_checked": True, "reg_open": True
            },
            {
                "name": "Public Speaking and Debate",
                "teacher": "Ms. Rachel Kim", "room": "Theater", "cap": 40,
                "over": 45, "start": "11:00 AM", "end": "12:30 PM",
                "cat": "Communication", "enrolled_count": 38, "checked_in_count": 20,
                "teacher_checked": False, "reg_open": True
            }
        ]

        names = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]

        for data in classes_data:
            c = ESP_Class.objects.create(
                name=data["name"],
                teacher_name=data["teacher"],
                teacher_checked_in=data["teacher_checked"],
                room=data["room"],
                capacity=data["cap"],
                overenrollment_cap=data["over"],
                registration_open=data["reg_open"],
                start_time=data["start"],
                end_time=data["end"],
                category=data["cat"]
            )

            for i in range(data["enrolled_count"]):
                is_checked_in = i < data["checked_in_count"]
                Enrollment.objects.create(
                    esp_class=c,
                    student_name=f"{random.choice(names)} {random.choice(last_names)}",
                    student_grade=random.randint(9, 12),
                    checked_in=is_checked_in
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(classes_data)} classes and their enrollments'))
