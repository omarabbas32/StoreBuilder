# 🛒 Storely - AI-Powered Storefront Builder

Storely is a cutting-edge, full-stack e-commerce platform designed for multi-tenancy and AI-driven store creation. It enables users to build, customize, and manage their own online stores with ease, powered by a robust Node.js backend and a dynamic React frontend.

---

## ✨ Features

### 🤖 AI-Powered Onboarding
- **AI Chat Creation:** Build your store by simply chatting with an AI assistant (powered by Groq SDK).
- **Automated Schema Generation:** AI generates store descriptions, categories, and initial structures based on user input.

### 🎨 Store Customization
- **Drag-and-Drop Editor:** Real-time storefront customization using `@dnd-kit`.
- **Theme Engine:** Manage global themes and UI components from an admin dashboard.
- **Dynamic Storefronts:** Automatic routing and rendering based on store slugs or subdomains.

### 📦 E-Commerce Essentials
- **Product Management:** Full CRUD for products with multi-image support (Cloudinary).
- **Category Hierarchy:** Parent-child category relationships for complex catalogs.
- **Shopping Cart:** Persistent cart management for registered and session users.
- **Order Flow:** Complete checkout process from cart to order success.
- **Product Reviews:** Verified purchase reviews with helpful voting system.

### 🔐 Security & Infrastructure
- **Authentication:** JWT-based auth with email verification and password reset flows.
- **Role-Based Access:** Multi-level permissions (Admin, Store Owner, Customer).
- **Multi-Tenant Isolation:** Secure data separation across different stores.
- **Media Management:** integrated with Cloudinary for fast, optimized image delivery.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Node.js / Express.js
- **Database:** PostgreSQL with **Prisma ORM**
- **AI Integration:** Groq SDK
- **Media:** Cloudinary (via Multer)
- **Email:** Nodemailer (SMTP)
- **Security:** bcryptjs (Hashing), JWT (Auth), Helmet, CORS
- **Validation:** Joi & Zod
- **Logging:** Winston & Morgan

### Frontend
- **Framework:** React 18 with Vite
- **State Management:** Zustand
- **Navigation:** React Router 6
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Drag & Drop:** `@dnd-kit/core` & `@hello-pangea/dnd`
- **Styling:** Vanilla CSS with a custom design system

---

## 📁 Project Structure

```text
storely/
├── Backend/
│   ├── prisma/             # Prisma Schema & Migrations
│   ├── src/
│   │   ├── config/          # Cloudinary, Database, SMTP Config
│   │   ├── controllers/     # Business Logic Handlers
│   │   ├── middleware/      # Auth, Error, Upload, Validation
│   │   ├── models/          # (Legacy) Models - now handled by Prisma
│   │   ├── routes/          # API Route Definitions
│   │   ├── services/        # Third-party Integrations (AI, Media, Email)
│   │   ├── utils/           # Helper Functions
│   │   └── container.js     # Dependency Injection Container
│   └── server.js            # Entry Point
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # UI, Layout, & Feature Components
│   │   ├── pages/           # Page Components (Customizer, Dashboards)
│   │   ├── services/        # API Client Services (Axios)
│   │   ├── store/           # Zustand State Stores
│   │   ├── utils/           # Frontend Helpers
│   │   └── App.jsx          # Routing & Providers
│   └── index.css            # Global Styles & Tokens
│
└── MainTheme/               # Reference Gatsby E-commerce Theme
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL instance
- Cloudinary Account (for media)
- Gmail App Password (for email service)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment (`.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/storely"
   
   # JWT & Security
   JWT_SECRET="your_very_secret_key"
   
   # External Services
   GROQ_API_KEY="your_groq_api_key"
   CLOUDINARY_CLOUD_NAME="your_name"
   CLOUDINARY_API_KEY="your_key"
   CLOUDINARY_API_SECRET="your_secret"
   
   # SMTP
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```
4. Run Migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment (`.env`):
   ```env
   VITE_API_URL="http://localhost:3000/api"
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

---

## 🔗 Key API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Register a new user |
| **Auth** | `/api/auth/login` | `POST` | Login & receive JWT |
| **AI** | `/api/onboarding/ai-chat` | `POST` | Chat with AI for store setup |
| **Stores** | `/api/stores` | `POST` | Create a new store |
| **Products** | `/api/products` | `GET` | List products with filters |
| **Cart** | `/api/cart` | `GET` | Retrieve current cart |
| **Admin** | `/api/components/admin`| `POST` | Create global UI components |

---

## 🛡️ License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ by Omar Abbas**
