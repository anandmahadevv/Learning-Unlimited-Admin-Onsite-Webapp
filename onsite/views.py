import json
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
