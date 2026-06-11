# RentivoMK — Frontend

**Course:** Service Oriented Architectures  
**Faculty:** CST, SEE University  
**Semester:** 8th Semester (2025/2026)  

---

## Table of Contents

- [About](#about)
- [Team Members](#team-members)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
  - [Running the App](#running-the-app)
- [Pages & Navigation](#pages--navigation)
- [Role-Based UI](#role-based-ui)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Related Repository](#related-repository)

---

## About

This is the frontend for RentivoMK — a vehicle rental management system built as our final project for the Service Oriented Architectures course at SEE University. It's a React single-page application that connects to our ASP.NET Core backend API and provides a different experience depending on who's logged in — customers can browse and reserve vehicles, workers manage reservations, and admins have full control over everything.

We built it with simplicity and usability in mind: a clean dark UI, role-aware navigation, toast notifications, and smooth transitions throughout.

---

## Team Members

| Name | ID |
|------|-------|
| Stefan Gavrovski | 130841 |
| Angel Nikoloski | 130847 |

---

## Features

- Login and registration with JWT authentication
- Role-aware routing — each role only sees what they're allowed to
- Dashboard with live stats tailored to the logged-in user's role
- Vehicle browsing with "All" and "Available Only" filter tabs
- Vehicle detail page with a reservation modal for customers
- Real-time price preview when selecting rental dates
- My Reservations page for customers to track and cancel bookings
- Reservations management page for admins/workers with search, filtering, and action buttons
- Full user management for admins (edit roles, delete accounts)
- Vehicle management for admins (add, edit, delete vehicles)
- Password strength indicator on the registration page
- Toast notification system for success and error feedback
- Confirmation dialogs before any destructive action
- Responsive layout with a collapsible sidebar for mobile
- Automatic redirect to login on token expiry (401 handling)

---

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v6
- **HTTP Client:** Axios (with request/response interceptors)
- **State Management:** React Context API (Auth + Toast)
- **Deployment:** Vercel

---

## Project Structure

```
src/
├── api/                  # Axios instance and per-entity API modules
│   ├── axios.ts          # Base Axios config with JWT interceptor and 401 handler
│   ├── vehicles.ts       # Vehicle API calls
│   ├── reservations.ts   # Reservation API calls
│   ├── users.ts          # User API calls
│   └── dashboard.ts      # Dashboard data fetching (role-based)
│
├── components/
│   ├── layout/           # App shell components
│   │   ├── AppLayout.tsx         # Main layout wrapper with sidebar + mobile top bar
│   │   ├── Sidebar.tsx           # Navigation sidebar with role-filtered nav items
│   │   ├── TopBar.tsx            # Page top bar with title and role badge
│   │   └── PageHeader.tsx        # Reusable page title + action button area
│   ├── ui/               # Shared UI components
│   │   ├── StatusBadge.tsx       # Colored badge for vehicle/reservation statuses
│   │   └── ConfirmDialog.tsx     # Modal confirmation dialog for destructive actions
│   ├── vehicles/
│   │   └── VehicleFormModal.tsx  # Add/edit vehicle modal form
│   ├── reservations/
│   │   └── CreateReservationModal.tsx  # Reservation date picker with price preview
│   └── users/
│       └── UserFormModal.tsx     # Edit user details and role modal
│
├── context/
│   ├── AuthContext.tsx   # Auth state (user, login, logout) stored in localStorage
│   └── ToastContext.tsx  # Global toast notification system
│
├── hooks/
│   ├── useAuth.ts        # Hook to access AuthContext
│   └── useScrollToTop.ts # Scrolls to top on route change
│
├── pages/                # One file per route/page
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── UnauthorizedPage.tsx
│   ├── DashboardPage.tsx
│   ├── VehiclesPage.tsx
│   ├── VehicleDetailPage.tsx
│   ├── MyReservationsPage.tsx
│   ├── ReservationsPage.tsx
│   └── UsersPage.tsx
│
├── routes/
│   └── ProtectedRoute.tsx  # Guards routes by auth state and role
│
├── types/
│   └── index.ts          # Shared TypeScript types and DTOs
│
├── App.tsx               # Route definitions
├── main.tsx              # App entry point
└── index.css             # Tailwind import + custom animations
```

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- The RentivoMK backend API running (see the [backend repo](https://github.com/stefangavrovski/rentivomk))

### Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080/api
```

Point this to wherever your backend is running. For the deployed version, this would be your Render API URL.

### Running the App

```bash
# Clone the repository
git clone https://github.com/stefangavrovski/rentivomk-frontend.git
cd rentivomk-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

To build for production:

```bash
npm run build
```

---

## Pages & Navigation

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | All authenticated |
| `/vehicles` | Vehicle listing | All authenticated |
| `/vehicles/:id` | Vehicle detail + reserve | All authenticated |
| `/reservations/my` | My reservations | Customer |
| `/reservations` | All reservations | Admin, Worker |
| `/users` | User management | Admin |
| `/unauthorized` | Access denied | — |

Any route not listed above redirects to `/`. Unauthenticated users are redirected to `/login`. Users accessing a route outside their role get redirected to `/unauthorized`.

---

## Role-Based UI

The UI adapts based on the logged-in user's role. Navigation items, action buttons, and dashboard sections all change depending on who's logged in.

**Admin** sees everything: fleet overview, reservation stats, user stats, and quick actions for managing vehicles, reservations, and users. The vehicles page shows Edit and Delete buttons, and the users page is fully accessible.

**Worker** sees the fleet and reservation stats on their dashboard, can manage reservations (approve, reject, complete, cancel), and can browse vehicles — but has no access to the users page and can't add or delete vehicles.

**Customer** gets a personal dashboard showing only their own reservation stats, a vehicles page where available vehicles show a "Reserve This Vehicle" button, and a My Reservations page to track and cancel their bookings.

---

## Architecture

The frontend is structured around a few clear ideas:

**API layer** — all HTTP calls live in `src/api/`. Each entity (vehicles, reservations, users) has its own file. The base `axios.ts` instance automatically attaches the JWT token from localStorage to every request and handles 401 responses by clearing the session and redirecting to login.

**Auth context** — `AuthContext` holds the current user's token, email, role, and full name. It persists across page refreshes using localStorage and is accessible anywhere in the app via the `useAuth` hook.

**Protected routes** — `ProtectedRoute` wraps route groups and checks both authentication and role. If a user isn't logged in, they go to `/login`. If they're logged in but don't have the right role, they go to `/unauthorized`.

**Toast notifications** — `ToastContext` provides a `showToast(message, type)` function used throughout the app to give users feedback on actions like creating reservations, updating vehicles, or encountering errors.

**Component structure** — pages own their data-fetching and state. Shared UI (status badges, confirm dialogs, modals) is kept in `src/components/` and reused across pages.

---

## Deployment

The frontend is deployed on **Vercel** and connects to the backend API deployed on **Render**. Vercel handles builds automatically on every push to the main branch.

The `VITE_API_URL` environment variable is configured in the Vercel project settings to point to the production Render API URL.

---

## Related Repository

- **Backend (ASP.NET Core API):** [https://github.com/stefangavrovski/rentivomk](https://github.com/stefangavrovski/rentivomk)

---

## License

This project was created for educational purposes as part of university coursework.