# Storely Frontend

A modern, secure, and fully responsive React application for the Storely e-commerce platform.

## 🚀 Tech Stack

- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **React Router 6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Hook Form + Zod** - Form handling and validation
- **Lucide React** - Icon library
- **Vanilla CSS** - Custom design system with CSS variables

## 📁 Project Structure

```
src/
├── assets/          # Images and global styles
├── components/      # Reusable components
│   ├── ui/         # Atomic components (Button, Input, Card)
│   ├── layout/     # Layout components (AdminLayout, UserLayout)
│   └── common/     # Shared components (ProtectedRoute)
├── hooks/          # Custom React hooks
├── pages/          # Page-level components
├── services/       # API service layer
├── store/          # Zustand state stores
├── utils/          # Helper functions
└── App.jsx         # Main router
```

## 🎨 Design System

The application uses a token-based design system with CSS variables:

- **Primary Color**: `#2563EB` (Blue 600)
- **Accent Color**: `#F59E0B` (Amber 500)
- **Mobile-First**: Responsive breakpoints at 768px and 1024px
- **Accessibility**: WCAG 2.1 AA compliant with 44px touch targets

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with Axios interceptors
- **Role-Based Access Control**: Admin and user route protection
- **Input Validation**: Zod schemas for all forms
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Coordinated with backend CORS

## 🛠️ Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Update `VITE_API_URL` to point to your backend API.

3. **Run development server**:
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📱 Features

### Admin Dashboard
- Theme management (CRUD operations)
- Component library management
- Store overview and analytics
- Responsive sidebar navigation

### User Dashboard
- Store overview with statistics
- Product management (CRUD)
- Category management
- Store customization (theme & component selection)

### Authentication
- Secure login/registration
- Email verification flow
- Password reset functionality
- Protected routes with role checks

## 🧪 Testing

The application includes:
- Form validation on all inputs
- Error boundaries for graceful failures
- Loading states for async operations
- Responsive design tested on multiple devices

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

MIT
