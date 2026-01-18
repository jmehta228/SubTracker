# SubTracker

A modern, full-stack subscription management application that helps users track, manage, and analyze their recurring subscriptions in one centralized dashboard.

## Features

- **Subscription Management** - Add, edit, and delete subscriptions with ease
- **Smart Dashboard** - View all subscriptions sorted by due date with visual indicators
- **Analytics & Insights** - Interactive charts showing spending trends and cost distribution
- **Due Date Tracking** - Visual alerts for upcoming and overdue payments
- **Mark as Paid** - Track payment history and automatically update next billing dates
- **Dark/Light Theme** - Toggle between themes for comfortable viewing
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing

## Tech Stack

### Frontend
- **Angular 20** - Modern web framework with standalone components
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Advanced styling with CSS variables
- **Chart.js** - Interactive data visualizations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SubTracker.git
   cd SubTracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=4000
   ```

5. **Seed the database (optional)**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the development servers**

   Backend (from `backend` directory):
   ```bash
   npm run dev
   ```

   Frontend (from `frontend` directory):
   ```bash
   ng serve
   ```

7. **Open the application**

   Navigate to `http://localhost:4200` in your browser.

## Project Structure

```
SubTracker/
├── backend/
│   ├── controllers/        # Route controllers
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   └── Subscription.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   └── subscriptionRoutes.js
│   ├── index.js             # Express app entry point
│   ├── seedSubscriptions.js # Database seeder
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Reusable UI components
│   │   │   │   ├── confirm-modal/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── skeleton/
│   │   │   │   ├── stats-card/
│   │   │   │   ├── subscription-card/
│   │   │   │   └── toast/
│   │   │   ├── guards/      # Route guards
│   │   │   ├── pages/       # Page components
│   │   │   │   ├── analytics/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── services/    # Angular services
│   │   ├── styles/          # Global styles
│   │   └── index.html
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/:userId` | Get all subscriptions for a user |
| POST | `/api/subscriptions/:userId` | Create a new subscription |
| PUT | `/api/subscriptions/:id` | Update a subscription |
| DELETE | `/api/subscriptions/:id` | Delete a subscription |

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Analytics
![Analytics](screenshots/analytics.png)

### Dark Mode
![Dark Mode](screenshots/dark-mode.png)

## Scripts

### Backend
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with sample subscriptions
```

### Frontend
```bash
ng serve         # Start development server
ng build         # Build for production
ng test          # Run unit tests
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Angular](https://angular.io/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Chart.js](https://www.chartjs.org/)
