# 📊 Retail Sales Management System

A full-stack web application designed to manage, filter, search, sort, and analyze sales transactions using a clean, high-performance backend and an intuitive, modern frontend UI.

---

## 📚 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)

---

## 🧾 Introduction

The **Sales Management Dashboard** is a complete MERN-based application built to:

- View and manage sales transactions  
- Perform fast search, filtering, and sorting  
- Navigate large datasets using efficient pagination  
- Follow a clean architecture with separation of concerns

Designed to match the provided Figma layout and follow industry-level engineering standards.

---

## ✨ Features

- 🔍 **Full-text Search** — Search by customer name and phone number (case-insensitive, accurate, optimized).  
- 🎯 **Advanced Multi-Select Filters** — Region, Gender, Age Range, Category, Tags, Payment Method, Date Range.  
- ↕️ **Sorting Capabilities** — Date (newest first), Quantity, Customer Name (A–Z).  
- 📄 **Pagination** — 10 items per page, retaining search/filters/sort state.  
- 💾 **Clean Data Processing Logic** — Centralized filter/sort pipelines, predictable state management.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS (Vite)  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB or JSON dataset (per assignment)  
- **State Management:** Custom hooks + Context (if required)  
- **Architecture:** Service → Controller → Route pattern

---

## 🚀 Installation

### Prerequisites

- Node.js (v16+ recommended)  
- npm or yarn

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Sales_management.git
   cd Sales_management


   Install backend dependencies:

    cd backend
    npm install


    Install frontend dependencies:

    cd ../frontend
    npm install

    🔁 Running the Project

    Backend:

    cd backend
    npm start


    Frontend:

    cd ../frontend
    npm run dev
