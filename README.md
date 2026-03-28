# 🎓 Teacher Portal – Full Stack Management System

A streamlined, full-stack web application designed for educational institutions to manage teaching staff, track activities, and visualize data.

---

## 📌 Overview
The **Teacher Portal** provides a secure environment for administrators to handle teacher records. It features a robust React frontend and a RESTful PHP backend, utilizing JWT for secure authentication and transactions to ensure data integrity.

### ✨ Key Features
* **Secure Auth:** JWT-based login/registration with protected API routes.
* **Teacher Management:** Full CRUD (Create, Read, Update, Delete) functionality.
* **Interactive Dashboard:** Data visualization using **Chart.js**.
* **Activity Tracking:** Logs every user action (Login, Create, Edit) with IP addresses.
* **Smart Tools:** Search/Filter functionality and **Export to CSV**.
* **Auto-Save:** Drafts are saved automatically while filling out teacher forms.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, Bootstrap 5, Axios, React Router |
| **Backend** | CodeIgniter 4.7 (PHP 8.2), REST API |
| **Database** | MySQL / MariaDB (Relational Schema) |
| **Security** | JWT (JSON Web Tokens), CORS Middleware |

---

## 🚀 Quick Start

### 1. Database Setup
1. Create a database named `teacher_portal` in your MySQL environment (e.g., phpMyAdmin).
2. Import the `teacher_portal.sql` file provided in the root folder.

### 2. Backend Setup
```bash

cd backend
composer install
cp .env.example .env
php spark serve --port=8080

### 3. Frontend Setup
```bash

cd frontend
npm install
npm start

Access the app at: http://localhost:3000