# Offline-First Expense Tracker

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge\&logo=angular\&logoColor=white)
![RxDB](https://img.shields.io/badge/RxDB-FF5722?style=for-the-badge\&logo=rxdb\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge\&logo=bootstrap\&logoColor=white)

---

## 📌 Overview

The **Offline-First Expense Tracker** is a **progressive web application (PWA)** designed to manage your expenses **anytime, anywhere** — even without internet connectivity.
It uses **Angular** for a fast and reactive UI, and **RxDB** for **offline-first data persistence** with automatic background sync when reconnected.

---

## ✨ Key Features

### 🔹 Core

* **Create, Read, Update, Delete (CRUD)** expenses
* Fully functional **offline mode** with data stored locally
* **Automatic sync** with backend when internet is available
* **Conflict resolution** to ensure data consistency

### 🔹 UX & UI

* Responsive, mobile-friendly design with **Bootstrap**
* Instant updates via **RxDB observable queries**
* Clear error/success notifications using **Toastr**
* Light & dark mode ready (easy theme toggling)

### 🔹 Developer-Friendly

* **Angular Standalone Components** for cleaner architecture
* **Facade Pattern** for state & API interaction
* **TypeScript strict mode** for reliability
* Organized folder structure following **Atomic Design Principles**

---

## 🛠 Tech Stack

| Technology        | Purpose                               |
| ----------------- | ------------------------------------- |
| **Angular**       | Front-end framework for scalable apps |
| **RxDB**          | Reactive offline-first database       |
| **TypeScript**    | Type-safe JavaScript superset         |
| **Bootstrap**     | UI styling framework                  |
| **Toastr**        | Non-blocking notifications            |
| **Karma/Jasmine** | Unit testing                          |

---

## 🧩 Architecture

* **Smart Components** handle logic and trigger actions.
* **Facade Services** coordinate between smart components and data layer.
* **RxDB** stores all data locally and syncs with a backend.
* Works perfectly **offline**; changes sync automatically when reconnected.

---

## 🚀 Getting Started

### 📋 Prerequisites

* **Node.js** v16+
* **Angular CLI** v20+

### ⚡ Installation

```bash
git clone https://github.com/PaulaSelim/Offline-First-Expense-Tracker.git
cd Offline-First-Expense-Tracker
npm install
ng serve
```

Visit **[http://localhost:4200/](http://localhost:4200/)**

### 🏗 Build & Test

```bash
ng build       # Build for production
ng test        # Run unit tests
ng e2e         # Run end-to-end tests (if configured)
```

---

## 📅 Roadmap

* [x] **User Authentication** — Secure login and registration system.
* [x] **Create Groups** — Organize expenses into groups.
* [x] **Add Users to Groups** — Invite and manage group members.
* [x] **Assign Expenses to Specific Users** — Track shared expenses clearly.
* [x] **Categories for Expenses** — Classify expenses for better reporting.
* [x] **Offline First** — fully functional offline once the user successfully logs in.
* [x] **Automatic Syncing** — Automatically syncs user data when back online.
* [ ] **Data Export/Import** — Backup and restore your data.
* [ ] **Push Notifications for Reminders** — Stay on top of upcoming expenses.
* [ ] **Sign in with Google or Github** — signing in with other service providers accounts.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`feature/your-feature`)
3. Commit your changes
4. Push to your fork
5. Submit a Pull Request

---

## 👥 Contributors

Thanks to the amazing people who made this possible:

* [@PaulaSelim](https://github.com/PaulaSelim) — Creator & Maintainer
* [@MinaGeorge](https://github.com/MinaGeo) — Collaborator

---

