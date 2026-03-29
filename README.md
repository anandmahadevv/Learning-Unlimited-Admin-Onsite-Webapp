# Learning Unlimited: ESP Onsite Admin Webapp — GSoC 2026 Prototype

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://learning-unlimited-admin-onsite-web.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/anandmahadev/Learning-Unlimited-Admin-Onsite-Webapp)

## 🌟 Overview
This project is a mobile-first, real-time administrative dashboard built for **Learning Unlimited's ESP Website** platform. It enables onsite administrators to monitor "Splash" events directly from their mobile devices or laptops during live session days.

### The Problem It Solves
Existing ESP tools often lack a dedicated, responsive "onsite" view for rapid attendance tracking, capacity management, and teacher check-ins. This prototype demonstrates a unified interface to handle these tasks efficiently under the high-pressure environment of a live event.

---

## 🚀 Live Demo & Evaluation
**View the live prototype here:** [learning-unlimited-admin-onsite-web.vercel.app](https://learning-unlimited-admin-onsite-web.vercel.app/)

### 📝 Instructions for Mentors
To see the full capabilities of the dashboard:
1.  Navigate to the **Settings** page (via the Sidebar).
2.  Scroll to **Data Management** and click **"Seed Sample Data"**.
3.  Confirm the prompt. This will populate the system with 10 realistic classes and hundreds of sample students.
4.  Return to the **Dashboard** to explore real-time search, category filters, and enrollment status tracking.

---

## ✨ Key Features
- **Real-time Dashboard**: Monitor class enrollment ratios, teacher status, and student check-ins at a glance.
- **Micro-interactions**: Seamlessly toggle registration status or teacher check-ins without page reloads.
- **Capacity Management**: Adjust overenrollment caps on-the-fly for individual classes or globally.
- **Smart Filtering**: Filter by category (Computer Science, Science, Humanities, etc.), registration status, or time slot.
- **Data Persistence**: Admin controls to seed demo data or wipe the system for a fresh event start.
- **Mobile Responsive**: Designed using a "Mobile First" approach for onsite portability.

---

## 🛠 Tech Stack
- **Backend**: Python / Django 4.2
- **Deployment**: Vercel (Serverless Runtime)
- **Static Files**: WhiteNoise with Brotli compression
- **Frontend**: Vanilla JavaScript (ES6+), Bootstrap 5, Bootstrap Icons
- **Project Structure**: Integrated REST API for asynchronous UI updates

---

## 🛠 Local Setup & Installation

### 1. Prerequisities
- Python 3.10+
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/anandmahadev/Learning-Unlimited-Admin-Onsite-Webapp.git
cd Learning-Unlimited-Admin-Onsite-Webapp

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed dummy data (optional but recommended for dev)
python manage.py seed
```

### 3. Running the Server
```bash
python manage.py runserver
```
Visit `http://localhost:8000` to view the app.

---

## 🏛 Project Context (GSoC 2026)
This prototype serves as a technical proof-of-concept for a GSoC 2026 proposal. It addresses specific onsite needs discussed in the Learning Unlimited community.

- **Reference Issue**: [ESP-Website/issues/2672](https://github.com/learning-unlimited/ESP-Website/issues/2672)
- **Proposed By**: Anand Mahadev

---

## 🔮 Future Enhancements
- **Real-time WebSockets**: Move from AJAX polling to Django Channels for instant updates across multiple admin devices.
- **PostgreSQL Integration**: Transition from ephemeral SQLite to a persistent production database.
- **LU-CAS Authentication**: Integrate with Learning Unlimited's Central Authentication Service for secure logins.
- **Barcode/QR Scanning**: Add QR code scanning for faster student check-ins.

---

*Built with ❤️ for the Learning Unlimited community.*
