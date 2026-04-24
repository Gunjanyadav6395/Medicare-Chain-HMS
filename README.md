# 🏥 MediCare - Full Stack Healthcare System

## 🚀 Project Overview

**MediCare** is a full-stack healthcare and hospital management system designed to solve real-world problems in the medical industry.

It enables patients to:

* Book doctor appointments
* Make payments (Online via Stripe or Cash)
* Access and manage medical reports
* Maintain a unified medical history across hospitals and cities

> 🎯 Goal: Eliminate repeated medical tests and create a centralized healthcare experience.

---

## 🌍 Future Vision

MediCare is not just a hospital system — it aims to become a **Medical Tourism & Healthcare Discovery Platform**.

Future capabilities include:

* 🌐 Global users discovering top hospitals/doctors in India
* 🧠 Disease-specific hospital recommendations (Cardiology, Oncology, etc.)
* 📈 SEO & SEM-based lead generation system
* 🤝 Patient-hospital connection platform (commission-based model)

---

## 🛠️ Tech Stack

### Frontend:

* React (Vite)
* Tailwind CSS

### Admin Panel:

* React (Vite)

### Backend:

* Node.js
* Express.js

### Database:

* MongoDB (Mongoose)

### Authentication:

* Clerk (Token-based)

### Payments:

* Stripe (Online + Cash)

### File Upload:

* Cloudinary

---

## 📁 Project Structure

```
admin/
frontend/
backend/
```

> ⚠️ Note:
>
> * Folder structure is strictly maintained
> * Components folder may contain files named like pages (but they are NOT routes)

---

## ✅ Features Implemented

### 🔐 Authentication

* Clerk integration
* Secure token-based API communication

---

### 👨‍⚕️ Doctor Module

* Add Doctor
* List Doctors
* Doctor Details Page

---

### 👤 Patient Module

* Patient Profile Management
* Save & Fetch Profile Data
* Temporary fallback: `createdBy = "temp-user-1"`

---

### 📅 Appointment System

* Book Appointment
* Fetch User Appointments
* Cancel Appointment

#### 💳 Payment Options:

* Online Payment (Stripe) → **Paid**
* Cash Payment → **Pending**

#### 📌 Appointment Status:

* Confirmed
* Canceled

---

### 📋 My Appointments Page

* Dynamic UI
* Displays:

  * Doctor Details
  * Patient Info
  * Date & Time
  * Payment Status

#### ✨ UI Enhancements:

* Card-based layout
* Status badges
* Toggle:

  * Active Appointments
  * Appointment History

---

### 🛠️ Admin Panel

* Dashboard UI
* Doctor Management
* Basic Stats UI

---

### 🏥 Service Module

* Service CRUD (Admin + Backend)
* Service Appointment Flow (Partial)

---

## 🚧 Features In Progress

### 📄 Reports System

Backend:

* Report Model
* Controllers:

  * Upload Report
  * Get Reports

Routes:

* `GET /api/reports/me`
* `POST /api/reports`

Frontend:

* My Reports Page
* API Integration
* Empty state UI

⚠️ Current Status:

* No data available yet
* Upload feature pending

---

## 🐞 Known Issues

* `createdBy` mismatch (Clerk vs temp fallback)
* Reports not displaying (no data yet)
* Admin doctor fetch issue (previous)
* Some auth inconsistencies in routes

---

## 🎯 Upcoming Features

### 🔥 Immediate Goals

* Upload Reports (PDF/Image)
* Cloudinary integration for reports
* Patient report view & download
* Admin upload reports for patients

---

### 🚀 Next Level Features

* Unified Patient Medical History
* Multi-hospital data sharing
* Advanced analytics dashboard

---

## 🌟 Long-Term Vision

* Medical Tourism Platform
* AI-based hospital recommendations
* Disease-specific rankings
* SEO-driven healthcare discovery
* Lead generation system for hospitals

---

## 🧠 Learning Outcome

This project demonstrates:

* Full Stack Development
* REST API Design
* Authentication & Authorization
* Payment Integration
* Real-world Problem Solving

---

## 👩‍💻 Developer Note

This project is built as a **placement-ready real-world system** with scalable architecture.

> Focus: Practical learning + Industry-level implementation

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---
