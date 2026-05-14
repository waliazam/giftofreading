# Gift of Reading Portal

AKHSS Kharadar 100 Years Celebration - Gift of Reading Initiative

## Overview

A web portal for the AKESP community to pledge and track collective reading of 100,000 books in celebration of 100 years of AKHSS Kharadar.

## Features

- ✅ User Registration with B-Form/CNIC
- ✅ Photo Frame Generator
- ✅ Book Reading Tracker
- ✅ Personal Dashboard
- ✅ Global Statistics
- ✅ Real-time Progress Tracking

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL + Sequelize
- Multer (file uploads)
- Sharp (image processing)

**Frontend:**
- React.js
- React Router
- Axios
- HTML5 Canvas (photo frames)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL 17

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:migrate
npm start
