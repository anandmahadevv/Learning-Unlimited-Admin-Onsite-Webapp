import json
import random
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ESP_Class, Enrollment, OnsiteSettings

def dashboard(request):
    return render(request, 'onsite/dashboard.html')

def class_detail(request, class_id):
    obj = get_object_or_404(ESP_Class, id=class_id)
    return render(request, 'onsite/class_detail.html', {'obj': obj})

def settings_page(request):
    return render(request, 'onsite/settings.html')

# API Endpoints

def api_classes_list(request):
    classes = ESP_Class.objects.all()
    data = []
    for c in classes:
        enrolled = c.enrollments.count()
        checked_in = c.enrollments.filter(checked_in=True).count()
        fill_percentage = (enrolled / c.capacity * 100) if c.capacity > 0 else 0
        
        status = "open"
        if not c.registration_open:
            status = "closed"
        elif enrolled >= c.capacity:
            status = "full"
        elif enrolled >= c.capacity * 0.8:
            status = "filling"
            
        data.append({
            "id": c.id,
            "name": c.name,
            "teacher_name": c.teacher_name,
            "teacher_checked_in": c.teacher_checked_in,
            "room": c.room,
            "capacity": c.capacity,
            "overenrollment_cap": c.overenrollment_cap,
            "enrolled": enrolled,
            "checked_in": checked_in,
            "registration_open": c.registration_open,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "category": c.category,
            "fill_percentage": round(fill_percentage),
            "status": status
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def api_toggle_registration(request, class_id):
    if request.method == "POST":
        obj = get_object_or_404(ESP_Class, id=class_id)
        obj.registration_open = not obj.registration_open
        obj.save()
        msg = "Registration opened" if obj.registration_open else "Registration closed"
        return JsonResponse({"id": obj.id, "registration_open": obj.registration_open, "message": msg})
    return JsonResponse({"error": "POST method required"}, status=400)

@csrf_exempt
def api_toggle_teacher_checkin(request, class_id):
    if request.method == "POST":
        obj = get_object_or_404(ESP_Class, id=class_id)
        obj.teacher_checked_in = not obj.teacher_checked_in
        obj.save()
        return JsonResponse({"id": obj.id, "teacher_checked_in": obj.teacher_checked_in})
    return JsonResponse({"error": "POST method required"}, status=400)

@csrf_exempt
def api_toggle_student_checkin(request, enrollment_id):
    if request.method == "POST":
        obj = get_object_or_404(Enrollment, id=enrollment_id)
        obj.checked_in = not obj.checked_in
        obj.save()
        return JsonResponse({"enrollment_id": obj.id, "checked_in": obj.checked_in})
    return JsonResponse({"error": "POST method required"}, status=400)

@csrf_exempt
def api_update_cap(request, class_id):
    if request.method == "POST":
        obj = get_object_or_404(ESP_Class, id=class_id)
        data = json.loads(request.body)
        new_cap = data.get("overenrollment_cap")
        if new_cap is not None:
            obj.overenrollment_cap = new_cap
            obj.save()
            return JsonResponse({"id": obj.id, "overenrollment_cap": obj.overenrollment_cap})
        return JsonResponse({"error": "Overenrollment cap not provided"}, status=400)
    return JsonResponse({"error": "POST method required"}, status=400)

def api_class_detail(request, class_id):
    c = get_object_or_404(ESP_Class, id=class_id)
    enrolled = c.enrollments.count()
    checked_in = c.enrollments.filter(checked_in=True).count()
    fill_percentage = (enrolled / c.capacity * 100) if c.capacity > 0 else 0
    
    status = "open"
    if not c.registration_open:
        status = "closed"
    elif enrolled >= c.capacity:
        status = "full"
    elif enrolled >= c.capacity * 0.8:
        status = "filling"
        
    students = []
    for e in c.enrollments.all():
        students.append({
            "enrollment_id": e.id,
            "name": e.student_name,
            "grade": e.student_grade,
            "checked_in": e.checked_in
        })
        
    return JsonResponse({
        "id": c.id,
        "name": c.name,
        "teacher_name": c.teacher_name,
        "teacher_checked_in": c.teacher_checked_in,
        "room": c.room,
        "capacity": c.capacity,
        "overenrollment_cap": c.overenrollment_cap,
        "enrolled": enrolled,
        "checked_in": checked_in,
        "registration_open": c.registration_open,
        "start_time": c.start_time,
        "end_time": c.end_time,
        "category": c.category,
        "fill_percentage": round(fill_percentage),
        "status": status,
        "students": students
    })

@csrf_exempt
def api_settings(request):
    settings, created = OnsiteSettings.objects.get_or_create(id=1)
    if request.method == "POST":
        data = json.loads(request.body)
        settings.global_registration_open = data.get("global_registration_open", settings.global_registration_open)
        settings.default_overenrollment_cap = data.get("default_overenrollment_cap", settings.default_overenrollment_cap)
        settings.save()
        
        # If global toggle is set, update ALL classes
        if "global_registration_open" in data:
            ESP_Class.objects.all().update(registration_open=settings.global_registration_open)
            
    return JsonResponse({
        "global_registration_open": settings.global_registration_open,
        "default_overenrollment_cap": settings.default_overenrollment_cap,
        "event_name": settings.event_name
    })

@csrf_exempt
def api_seed_data(request):
    if request.method == "POST":
        # Clear existing data
        ESP_Class.objects.all().delete()
        Enrollment.objects.all().delete()
        OnsiteSettings.objects.filter(id=1).delete()

        # Create settings
        OnsiteSettings.objects.create(
            id=1,
            global_registration_open=True,
            default_overenrollment_cap=5,
            event_name="Splash 2026"
        )

        classes_data = [
            {"name": "Introduction to Machine Learning", "teacher": "Dr. Sarah Chen", "room": "101", "cap": 30, "over": 35, "start": "9:00 AM", "end": "10:30 AM", "cat": "Computer Science", "enrolled_count": 28, "checked_in_count": 22, "teacher_checked": True, "reg_open": False},
            {"name": "Creative Writing Workshop", "teacher": "Mr. James Patel", "room": "202", "cap": 20, "over": 22, "start": "9:00 AM", "end": "10:30 AM", "cat": "English", "enrolled_count": 14, "checked_in_count": 8, "teacher_checked": True, "reg_open": True},
            {"name": "Intro to Organic Chemistry", "teacher": "Dr. Emily Rodriguez", "room": "Lab A", "cap": 25, "over": 25, "start": "11:00 AM", "end": "12:30 PM", "cat": "Science", "enrolled_count": 25, "checked_in_count": 0, "teacher_checked": False, "reg_open": False},
            {"name": "Game Development with Unity", "teacher": "Ms. Priya Kumar", "room": "305", "cap": 20, "over": 22, "start": "11:00 AM", "end": "12:30 PM", "cat": "Computer Science", "enrolled_count": 10, "checked_in_count": 10, "teacher_checked": True, "reg_open": True},
            {"name": "Philosophy of Ethics", "teacher": "Prof. David Lee", "room": "Auditorium", "cap": 50, "over": 55, "start": "1:00 PM", "end": "2:30 PM", "cat": "Humanities", "enrolled_count": 32, "checked_in_count": 15, "teacher_checked": True, "reg_open": True},
            {"name": "Robotics and Automation", "teacher": "Mr. Ankit Shah", "room": "Lab B", "cap": 15, "over": 15, "start": "1:00 PM", "end": "2:30 PM", "cat": "Engineering", "enrolled_count": 15, "checked_in_count": 15, "teacher_checked": True, "reg_open": False},
            {"name": "Introduction to Economics", "teacher": "Ms. Laura Wong", "room": "210", "cap": 35, "over": 38, "start": "2:45 PM", "end": "4:15 PM", "cat": "Social Science", "enrolled_count": 5, "checked_in_count": 0, "teacher_checked": False, "reg_open": True},
            {"name": "Painting and Mixed Media Art", "teacher": "Mr. Carlos Rivera", "room": "Art Room", "cap": 18, "over": 20, "start": "2:45 PM", "end": "4:15 PM", "cat": "Arts", "enrolled_count": 18, "checked_in_count": 12, "teacher_checked": True, "reg_open": False},
            {"name": "Astrophysics for Beginners", "teacher": "Dr. Neha Singh", "room": "112", "cap": 30, "over": 33, "start": "9:00 AM", "end": "10:30 AM", "cat": "Science", "enrolled_count": 22, "checked_in_count": 18, "teacher_checked": True, "reg_open": True},
            {"name": "Public Speaking and Debate", "teacher": "Ms. Rachel Kim", "room": "Theater", "cap": 40, "over": 45, "start": "11:00 AM", "end": "12:30 PM", "cat": "Communication", "enrolled_count": 38, "checked_in_count": 20, "teacher_checked": False, "reg_open": True}
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

        return JsonResponse({"message": f"Successfully seeded {len(classes_data)} classes"})
    return JsonResponse({"error": "POST method required"}, status=400)
