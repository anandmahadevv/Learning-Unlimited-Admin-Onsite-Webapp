# ESP Admin Onsite Webapp — GSoC 2026 Prototype

## What This Is
This is a fully functional Django-based prototype of an "Admin Onsite" interface for Learning Unlimited's ESP Website platform. It addresses the lack of a mobile-friendly dashboard for event administrators to monitor class enrollment, track student/teacher check-ins, and manage registration settings in real-time during live "Splash" events.

## Quick Start
1. **Clone the repository** (or navigate to the project folder)
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Setup Database**:
   ```bash
   python manage.py migrate
   ```
4. **Seed Sample Data**:
   ```bash
   python manage.py seed
   ```
5. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```
6. **Open in Browser**: [http://localhost:8000/onsite/](http://localhost:8000/onsite/)

## Pages
- **Dashboard**: [http://localhost:8000/onsite/](http://localhost:8000/onsite/) — Real-time monitoring with filters and status cards.
- **Settings**: [http://localhost:8000/onsite/settings/](http://localhost:8000/onsite/settings/) — Global registration and default cap controls.
- **API**: [http://localhost:8000/onsite/api/classes/](http://localhost:8000/onsite/api/classes/) — REST endpoint for class data.

## Tech Stack
- **Backend**: Django 4.2
- **Frontend**: Bootstrap 5 + Vanilla JavaScript
- **Database**: SQLite (default Django)
- **Icons**: Bootstrap Icons

## GSoC Context
This is a proof-of-concept prototype for a GSoC 2026 proposal for Learning Unlimited's ESP Website.
Issue Reference: [github.com/learning-unlimited/ESP-Website/issues/2672](https://github.com/learning-unlimited/ESP-Website/issues/2672)
