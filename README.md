# FarmDirect AI 

**Built by Sekar Ram**

FarmDirect AI is an **AI-assisted farmer-to-buyer marketplace** designed to help farmers list produce, connect with buyers, manage orders, receive AI-based insights, and track deliveries.

The project is built as an **offline-first web application** with a React frontend, Node.js/Express backend, local MongoDB database, and a Python/FastAPI AI service.

A major feature of this version is **SMS notification support for farmers and buyers** when important order events occur.

---

##  Key Features

### ‍ Farmer Features
- Farmer registration and login
- Create and manage produce listings
- View marketplace listings
- Receive buyer orders
- Confirm, ship, deliver, or cancel orders
- View order timeline
- Receive SMS notifications for new orders and relevant order events
- SMS notification opt-out
- AI-assisted price and demand insights

###  Buyer Features
- Buyer registration and login
- Browse available agricultural produce
- View produce details
- Place orders
- Track order progress
- Cancel eligible orders
- View SMS delivery status
- Receive SMS notifications when orders are confirmed, shipped, delivered, or cancelled

###  AI Features
The Python AI service provides:
- Demand forecasting
- Price intelligence
- Buyer matching
- Route optimization
- Farmer advisory functionality

The current AI models use local/sample datasets and are intended as a project/demo baseline.

###  SMS Notification System
The application supports SMS events for:

| Event | Recipient |
|---|---|
| New order received | Farmer |
| Order confirmed | Buyer |
| Order in transit | Buyer |
| Order delivered | Buyer |
| Order cancelled | Farmer + Buyer |
| Admin test SMS | Test number |

SMS supports:
- Mock/demo mode without an SMS provider
- English templates
- Tamil templates
- English fallback for other supported languages
- SMS opt-out
- Invalid-number handling
- Duplicate-SMS protection
- SMS delivery logs
- Masked phone numbers in API/log output
- Provider integration through a dedicated SMS service

> **Important:** Mock mode does not send real SMS messages. It prints the SMS message in the backend console.

###  Offline-First Support
FarmDirect AI can run locally without an internet connection after the initial dependencies are installed.

Offline functionality includes:
- Local MongoDB
- Local React frontend
- Local Node.js backend
- Local Python AI service
- IndexedDB caching
- Offline produce listing queue
- Marketplace cache
- Offline status banner
- Automatic synchronization when connectivity returns
- Locally bundled fonts and images

---

#  System Architecture

```text
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │       Vite + Tailwind   │
                    │     localhost:5173       │
                    └────────────┬────────────┘
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js + Express    │
                    │       localhost:5000    │
                    │                         │
                    │ Auth / Produce / Orders │
                    │ Marketplace / SMS / AI  │
                    └───────┬─────────┬───────┘
                            │         │
                    MongoDB │         │ HTTP/JSON
                            │         ▼
                            │  ┌─────────────────────┐
                            │  │ Python + FastAPI    │
                            │  │ AI Service           │
                            │  │ localhost:8000       │
                            │  └─────────────────────┘
                            ▼
                    ┌─────────────────────┐
                    │   Local MongoDB     │
                    │ farmdirect database │
                    └─────────────────────┘

SMS:
Node.js Backend
      │
      ▼
SMS Service
      │
      ├── Mock Provider → Console
      │
      └── Real Provider → SMS API
```

---

#  Technology Stack

## Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts
- Lucide React
- IndexedDB

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- Axios
- express-rate-limit
- Morgan

## AI Service
- Python
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- OR-Tools

## SMS
- Dedicated SMS service layer
- Mock SMS provider
- API-provider adapter
- English/Tamil templates
- SMS logging

---

#  Project Structure

```text
farmdirect-ai/
│
├── backend/
│   ├── config/
│   │   └── sms.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── produceController.js
│   │   ├── notificationController.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimit.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Produce.js
│   │   ├── Order.js
│   │   ├── SmsLog.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── produceRoutes.js
│   │   ├── adminRoutes.js
│   │   └── ...
│   │
│   ├── services/
│   │   └── smsService.js
│   │
│   ├── utils/
│   │   └── ...
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── ai-service/
│   ├── data/
│   │   └── sample_orders.csv
│   ├── models/
│   ├── routes/
│   │   ├── demand.py
│   │   ├── price.py
│   │   ├── buyer.py
│   │   ├── logistics.py
│   │   └── advisor.py
│   ├── services/
│   │   ├── price_model.py
│   │   ├── demand_model.py
│   │   ├── buyer_matcher.py
│   │   ├── route_optimizer.py
│   │   └── advisor_service.py
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── i18n/
│   │   ├── offline/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── data/
│   ├── crops.csv
│   ├── market_prices.csv
│   ├── buyers.csv
│   └── weather.json
│
├── start-farmdirect.bat
├── start-farmdirect.sh
└── README.md
```

---

#  Requirements

Install the following software:

- Node.js 18+ recommended
- npm
- Python 3.10+ recommended
- MongoDB Community Server
- Git

For real SMS delivery, an account with a supported SMS provider is also required.

---

#  Installation

## 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd farmdirect-ai
```

If you already downloaded the project ZIP, extract it and open the extracted `farmdirect-ai` folder.

---

# 2. Setup MongoDB

Install MongoDB Community Server and make sure the MongoDB service is running.

The default database connection is:

```text
mongodb://127.0.0.1:27017/farmdirect
```

No MongoDB Atlas connection is required for the local/offline version.

---

# 3. Setup Backend

Open a terminal:

```bash
cd backend
npm install
```

Create the environment file.

### Windows

```cmd
copy .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Open `backend/.env` and configure it.

Example:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/farmdirect

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:8000

CORS_ORIGIN=http://localhost:5173

SMS_PROVIDER=mock
SMS_API_KEY=
SMS_SENDER_ID=FARMDR
SMS_API_URL=
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 4. Setup Python AI Service

Open another terminal:

```bash
cd ai-service
```

Create a virtual environment:

### Windows

```cmd
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the AI service:

```bash
uvicorn main:app --reload --port 8000
```

AI service:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

---

# 5. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create the environment file.

### Windows

```cmd
copy .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

The frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

#  One-Click Startup on Windows

The project includes:

```text
start-farmdirect.bat
```

After completing the one-time installation steps, double-click:

```text
start-farmdirect.bat
```

It attempts to start:

1. MongoDB
2. Python AI service
3. Node/Express backend
4. React/Vite frontend

The normal local URLs are:

```text
Frontend:   http://localhost:5173
Backend:    http://localhost:5000
AI Service: http://localhost:8000
MongoDB:    localhost:27017
```

---

#  SMS Notification Setup

## Default Mock Mode

The project is configured to use mock SMS mode by default:

```env
SMS_PROVIDER=mock
```

In this mode:

- No paid SMS account is required.
- No real SMS is sent.
- SMS messages are printed in the backend terminal.
- SMS records are stored in MongoDB.
- The frontend can display SMS status.

Example backend output:

```text
[smsService] MOCK SMS to 98******10:
FarmDirect: New order received. Order ID: FD123456. Crop: Tomato, Quantity: 20 kg. Please open FarmDirect to confirm.
```

This mode is recommended for classroom demonstrations and offline testing.

---

#  Real SMS Provider

For real SMS delivery, configure an SMS provider supported by the project adapter.

Update:

```env
SMS_PROVIDER=<provider>
SMS_API_KEY=<your-api-key>
SMS_SENDER_ID=FARMDR
SMS_API_URL=<provider-api-url>
```

The current SMS service provides a generic API adapter. Provider-specific authentication and request formats may need to be adjusted according to the provider's current API.

**Never commit real API keys to GitHub.**

Keep credentials only in:

```text
backend/.env
```

---

#  SMS Event Flow

Example: Buyer places an order.

```text
Buyer
  │
  │ Place Order
  ▼
React Frontend
  │
  │ POST /api/orders
  ▼
Express Backend
  │
  ├── Create Order
  │
  ├── Create In-App Notification
  │
  └── Trigger SMS Service
            │
            ▼
       SMS Service
            │
            ├── Check phone number
            ├── Check SMS opt-out
            ├── Check duplicate SMS
            ├── Select language
            ├── Create SmsLog
            └── Send through provider
                     │
                     ▼
                  Farmer 
```

---

#  SMS Status

Every SMS can have one of these statuses:

| Status | Meaning |
|---|---|
| `pending` | SMS request created but delivery is not completed |
| `sent` | Provider accepted the SMS |
| `failed` | SMS provider returned an error |
| `skipped` | SMS was intentionally not sent |

SMS logs are stored in the MongoDB `SmsLog` collection.

Phone numbers are masked when returned through JSON/API serialization.

---

#  Authentication & Security

The project includes several security mechanisms:

- JWT authentication
- Password hashing with bcrypt
- Password strength validation
- Account active-status checks
- Login rate limiting
- Registration rate limiting
- Role-based authorization
- Protected admin account creation
- Server-side input validation
- Produce ownership validation
- Order ownership validation
- Offer ownership validation
- Duplicate offer protection
- Unique vehicle registration numbers
- Restricted editable fields

### Public Registration Roles

The public registration endpoint supports:

```text
farmer
buyer
fpo
```

An administrator cannot create an admin account through normal public registration.

Admin creation is protected by admin authorization.

---

#  Main Application Modules

## 1. Authentication

Users can register and log in using role-based access.

Supported roles include:

- Farmer
- Buyer
- FPO
- Admin

---

## 2. Marketplace

Farmers can list agricultural produce.

Buyers can:

- Browse produce
- View details
- Place orders
- Track orders

---

## 3. Order Management

Orders move through stages such as:

```text
Order Received
      ↓
Confirmed
      ↓
In Transit
      ↓
Delivered
```

Cancellation is also supported where permitted.

---

## 4. AI Price Intelligence

The AI service can provide price-related insights using local datasets and models.

The current implementation is a project/demo baseline and should not be treated as a production agricultural pricing guarantee.

---

## 5. Demand Forecasting

The AI service provides demand-related predictions using local/sample data.

---

## 6. Buyer Matching

The application includes buyer-matching functionality to help connect produce with potential buyers.

---

## 7. Route Optimization

The Python service includes route optimization functionality using OR-Tools.

---

## 8. Notifications

The system supports:

- In-app notifications
- Unread notification count
- Mark notification as read
- Mark all notifications as read
- SMS notifications

---

## 9. Multilingual Interface

The frontend currently includes language files for:

```text
English
Tamil
Hindi
Telugu
Kannada
Marathi
Bengali
```

SMS templates currently have dedicated:

```text
English
Tamil
```

templates.

Other supported SMS languages currently fall back to English until their templates are added.

---

#  Offline Functionality

FarmDirect AI is designed so that the main application can continue working locally without internet access after all dependencies have been installed.

### Offline components

```text
Browser
   ↓
React + IndexedDB
   ↓
Local Express Backend
   ↓
Local MongoDB

             +

Local Python AI Service
```

The frontend includes:

- Offline detection
- Offline banner
- IndexedDB caching
- Produce synchronization queue
- Marketplace cache
- Automatic queue replay when connectivity returns

---

#  Testing the Application

## Test Backend

Open:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "service": "farmdirect-ai-backend"
}
```

## Test AI Service

Open:

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "farmdirect-ai-service"
}
```

## Test Frontend

Open:

```text
http://localhost:5173
```

---

#  Testing SMS Without Sending Real SMS

Keep:

```env
SMS_PROVIDER=mock
```

Then:

1. Start MongoDB.
2. Start the AI service.
3. Start the backend.
4. Start the frontend.
5. Register a farmer and buyer.
6. Add a farmer phone number.
7. Add produce as the farmer.
8. Login as the buyer.
9. Place an order.
10. Check the backend terminal.
11. Verify the mock SMS message.
12. Open the order dashboard and check the SMS status badge.

---

# ‍ Admin SMS Testing

The backend includes an admin-only test SMS endpoint.

The admin can use the SMS test functionality to verify the configured provider.

SMS activity can also be inspected through the admin SMS log functionality.

---

#  Database

The application uses MongoDB.

The local database is:

```text
farmdirect
```

Major collections/models include:

```text
User
Produce
Order
Offer
Notification
SmsLog
Vehicle
```

---

#  AI Data

The AI service includes:

```text
ai-service/data/sample_orders.csv
```

Additional local project data includes:

```text
data/market_prices.csv
data/crops.csv
data/buyers.csv
data/weather.json
```

These datasets allow the project to operate without depending on live external APIs.

---

#  Current AI Limitations

The included AI models are primarily intended for:

- Academic demonstration
- Prototype development
- SIH/project presentation
- Local experimentation

The project should not claim production-level prediction accuracy without:

- Real historical agricultural data
- Proper train/test validation
- MAE/RMSE or other relevant metrics
- Model comparison
- Domain validation
- Regular model retraining

---

#  Environment & Secrets

Do not upload:

```text
.env
backend/.env
API keys
SMS provider credentials
JWT secrets
Database passwords
```

Use the provided:

```text
.env.example
```

files as templates.

---

#  Troubleshooting

## `npm is not recognized`

Install Node.js and restart the terminal.

Check:

```bash
node --version
npm --version
```

---

## `vite is not recognized`

Inside the frontend folder:

```bash
npm install
npm run dev
```

---

## MongoDB connection error

Make sure MongoDB is running.

Check the backend `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/farmdirect
```

---

## Python package error

Activate the virtual environment:

### Windows

```cmd
cd ai-service
venv\Scripts\activate
pip install -r requirements.txt
```

### macOS/Linux

```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
```

---

## AI service connection error

Make sure the AI service is running:

```bash
uvicorn main:app --reload --port 8000
```

Then check:

```text
http://localhost:8000/health
```

Also verify:

```env
AI_SERVICE_URL=http://localhost:8000
```

---

## SMS is not reaching a phone

If:

```env
SMS_PROVIDER=mock
```

then no real SMS will be sent.

The message will only appear in the backend console.

For real SMS delivery:

1. Create an SMS provider account.
2. Obtain API credentials.
3. Configure `SMS_PROVIDER`.
4. Configure `SMS_API_KEY`.
5. Configure `SMS_SENDER_ID`.
6. Configure `SMS_API_URL`.
7. Verify the provider's API request/authentication format.
8. Use the admin test SMS feature.
9. Check `SmsLog` records and backend logs.

---

# ‍ Development Commands

## Backend

```bash
cd backend

npm install
npm run dev
```

Production-style start:

```bash
npm start
```

Seed demo data:

```bash
npm run seed
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## AI Service

```bash
cd ai-service

python -m venv venv
```

Windows:

```cmd
venv\Scripts\activate
```

Install:

```bash
pip install -r requirements.txt
```

Run:

```bash
uvicorn main:app --reload --port 8000
```

---

#  Suggested Demo Flow

For a college project or viva demonstration:

### Step 1
Start MongoDB.

### Step 2
Start the Python AI service.

### Step 3
Start the Node.js backend.

### Step 4
Start the React frontend.

### Step 5
Register/login as a farmer.

### Step 6
Create a produce listing.

### Step 7
Login as a buyer.

### Step 8
Browse the marketplace and place an order.

### Step 9
Show the farmer receiving the new-order notification/SMS.

### Step 10
Confirm the order as the farmer.

### Step 11
Show the buyer receiving the confirmation SMS.

### Step 12
Move the order through:

```text
Confirmed → In Transit → Delivered
```

### Step 13
Show the corresponding SMS status.

### Step 14
Demonstrate the offline banner and local operation.

### Step 15
Demonstrate an AI feature such as price intelligence, demand prediction, buyer matching, or route optimization.

---

#  Project Highlights

FarmDirect AI combines:

```text
Agricultural Marketplace
        +
Role-Based Authentication
        +
Order Management
        +
AI Assistance
        +
Offline-First Architecture
        +
SMS Notifications
        +
Multilingual Support
```

The architecture keeps the major responsibilities separated:

```text
React
  ↓
Express API
  ↓
MongoDB

Express
  ↓
Python AI Service

Express
  ↓
SMS Service
  ↓
Mock / SMS Provider
```

This makes the project easier to maintain, demonstrate, and extend.

---

#  Future Improvements

Possible future enhancements include:

- Complete multilingual SMS templates for Hindi, Telugu, Kannada, Marathi, and Bengali
- Production-specific SMS provider integrations
- SMS delivery webhooks and delivery receipts
- Offline caching for orders and AI results
- Advanced admin analytics
- Mobile responsiveness improvements
- Automated backend/frontend test suites
- Real agricultural datasets
- Better validated ML models
- Weather API integration when online
- Real-time delivery tracking
- Push notifications
- Farmer emergency/contact information
- Buyer/farmer emergency contact workflow
- Production deployment configuration

---

#  Disclaimer

FarmDirect AI is a prototype/project implementation.

AI-generated price, demand, matching, and advisory outputs should be treated as decision-support information rather than guaranteed agricultural or financial advice.

SMS delivery depends on the selected SMS provider, account configuration, network availability, and provider policies.

---

#  Project Purpose

FarmDirect AI is intended to demonstrate how modern web technologies, artificial intelligence, offline-first design, and communication services can be combined to create a practical digital marketplace for farmers and buyers.

---

##  License

Add the project's preferred license here, for example:

```text
MIT License
```

if an MIT license is selected for the repository.

---

## Built By

**Sekar Ram**
