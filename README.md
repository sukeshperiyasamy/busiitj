# IIT Jodhpur Campus Bus Tracking System

A comprehensive real-time bus tracking system for IIT Jodhpur campus, enabling students and staff to track campus buses, view schedules, and ensure reliable transportation services.

![IIT Jodhpur Logo](attached_assets/Design%20of%20New%20Logo%20of%20IITJ-2%20PNG%20BW.png)

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Credentials](#user-credentials)
- [Schedule Information](#schedule-information)
- [Deployment Guide](#deployment-guide)
- [Contributing](#contributing)

## Features

- **Real-time Bus Tracking:** Monitor the current location of campus buses.
- **Multi-User Access:** Separate interfaces for admin, drivers, and students.
- **Bus Schedule Information:** Comprehensive timetables for weekday and Sunday service.
- **Status Indicators:** Visual indicators showing active/inactive bus status.
- **Secure Authentication:** Role-based access control system.
- **Location History:** Track bus movement patterns over time.
- **Interactive Maps:** Google Maps integration for location visualization.

## Architecture

The application follows a client-server architecture:

- **Frontend:** React-based SPA with component-based structure.
- **Backend:** Express.js API server handling requests and data management.
- **Database:** MongoDB for data persistence.
- **Authentication:** Session-based authentication with role-based permissions.
- **Real-time Updates:** Geolocation tracking for bus position updates.

## Technology Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Google Maps JavaScript API

### Backend
- Node.js
- Express.js
- MongoDB (database)
- Passport.js (authentication)

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB connection (or use in-memory storage for development)
- Google Maps API Key

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Sukesh-Periyasamy/busiitj.git
   cd busiitj
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables) section)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The application should now be running at `http://localhost:5000`.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/busTracker

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Session secret
SESSION_SECRET=your_session_secret_key

# Node environment
NODE_ENV=development
```

## API Documentation

The application provides the following API endpoints:

### Authentication

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/register` | POST | Register a new user | `{ name, email, username, password, role }` | User object |
| `/api/auth/login` | POST | Login | `{ username, password }` | User object with session |
| `/api/auth/logout` | POST | Logout | - | Success message |
| `/api/auth/me` | GET | Get current user | - | User object |

### Bus Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/buses` | GET | Get all buses | - | Array of buses |
| `/api/buses/:id` | GET | Get bus by ID | - | Bus object |
| `/api/driver/toggle-status` | POST | Toggle bus active status | - | Success message |
| `/api/driver/update-location` | POST | Update bus location | `{ latitude, longitude }` | Success message |

### Schedules

| Endpoint | Method | Description | Query Params | Response |
|----------|--------|-------------|--------------|----------|
| `/api/schedules` | GET | Get all schedules | `day` (optional), `busId` (optional) | Array of schedules |

### Configuration

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/config/maps-key` | GET | Get Google Maps API key | `{ key: "API_KEY" }` |

## User Credentials

The system comes with pre-configured test accounts:

### Admin Account
- **Username:** admin
- **Password:** admin123
- **Role:** admin

### Driver Accounts
- **Bus 1 Driver:**
  - Username: bus1
  - Password: driver1
  - Role: driver
  - Bus: B1

- **Bus 2 Driver:**
  - Username: bus2
  - Password: driver2
  - Role: driver
  - Bus: B2

### Student Account
- **Username:** student
- **Password:** student123
- **Role:** student

## Schedule Information

The system includes comprehensive bus schedules for both weekdays (Monday-Saturday) and Sundays.

### Weekday Schedule

**Departures from Campus:**
- Bus B1: 6:30 AM to GPRA via Paota and Railway Station
- Bus B2: 6:30 AM to Jaljog Circle via Paota and Riktiya Bheruji Circle
- Bus B1: 10:00 AM to AIIMS Jodhpur via Paota – MBM – AIIMS
- Bus B2: 11:00 AM to MBM via Paota and Railway Station
- Bus B1: 3:00 PM to AIIMS Jodhpur via Paota – Railway Station
- Bus B1: 5:45 PM to GPRA via Paota – MBM – Riktiya Bheruji Circle
- Bus B2: 6:15 PM to Jaljog Circle via Paota – MBM – Riktiya Bheruji Circle – MBM

**Arrivals at Campus:**
- Bus B1: 8:50 AM from GPRA via MBM – Paota – Mandore
- Bus B2: 8:50 AM from Jaljog Circle
- Bus B1: 12:30 PM from AIIMS Jodhpur via MBM College – Paota – Station
- Bus B2: 4:30 PM from MBM
- Bus B1: 5:15 PM from AIIMS Jodhpur via Riktiya Bheruji Circle – MBM – Paota
- Bus B1: 9:30 PM from MBM via Railway Station – Paota
- Bus B2: 10:00 PM from MBM

### Sunday Schedule

**Departures from Campus:**
- Bus B2: 9:30 AM to MBM via Paota – Riktiya Bheruji Circle – MBM
- Bus B1: 10:30 AM to MBM via Paota – MBM
- Bus B1: 4:45 PM to MBM via Paota – MBM – Riktiya Bheruji Circle
- Bus B2: 5:45 PM to MBM via Paota – MBM – Riktiya Bheruji Circle

**Arrivals at Campus:**
- Bus B2: 12:30 PM from MBM via Paota – Mandore – IITJ
- Bus B1: 2:30 PM from MBM via MBM College – Paota – IITJ
- Bus B1: 9:30 PM from MBM via Railway Station – Paota
- Bus B2: 10:00 PM from MBM

## Using the Application

### For Students
1. Login with student credentials
2. View the real-time location of buses on the map
3. Check bus schedules for weekdays and Sundays
4. Monitor bus status (active/inactive)

### For Drivers
1. Login with driver credentials (bus1/driver1 or bus2/driver2)
2. Toggle the active status of your bus
3. The system will automatically track your location when active
4. View your scheduled routes and times

### For Administrators
1. Login with admin credentials
2. Access to all features
3. Manage user accounts and schedules

## Deployment Guide

### Deploying to Replit

1. Fork the repository on GitHub
2. Create a new Replit project by importing from GitHub
3. Set up the necessary environment variables in Replit Secrets:
   - GOOGLE_MAPS_API_KEY
   - MONGODB_URI (if using MongoDB)
   - SESSION_SECRET
4. Run the application using the "Start application" workflow

### Deploying to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku CLI:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create iitj-bus-tracker
   ```
4. Set environment variables:
   ```bash
   heroku config:set GOOGLE_MAPS_API_KEY=your_api_key
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set NODE_ENV=production
   ```
5. Deploy the application:
   ```bash
   git push heroku main
   ```

### Deploying to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Login to Vercel:
   ```bash
   vercel login
   ```
3. Deploy the application:
   ```bash
   vercel
   ```
4. Configure environment variables in the Vercel dashboard

## Contributing

Contributions to the IIT Jodhpur Bus Tracking System are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.