# 🌾 Kisan Setu (KPIP)

### Kisan Procurement Intelligence Platform

> A digital platform designed to streamline the farmer-to-procurement-centre journey under India's Minimum Support Price (MSP) procurement ecosystem.

---

## 📌 About

**Kisan Setu (KPIP)** digitizes the crop procurement workflow between **farmers and procurement-centre operators**.

It helps farmers book procurement slots, receive daily tokens, track their procurement status, and monitor payments, while enabling procurement centres to manage queues, quality checks, weighment, and procurement operations digitally.

### 🔄 Core Workflow

```text
Farmer
  ↓
OTP Login
  ↓
Profile & Bank Setup
  ↓
Slot Booking
  ↓
Token Allocation
  ↓
Centre Arrival
  ↓
Verification
  ↓
Quality Check
  ↓
Weighment
  ↓
Procurement
  ↓
Payment
```

---

## 🚀 Key Features

### 👨‍🌾 Farmer

* OTP + JWT authentication
* One-time profile & DBT setup
* Procurement-centre selection
* Smart slot booking
* Daily token generation
* Booking & payment tracking

### 🏢 Procurement Centre

* Operator authentication
* Queue management
* Farmer verification
* Quality assessment
* Weighment management
* Procurement & payment workflow

### 🧠 Intelligence

* Automated queue management
* Waiting-time prediction
* Payout calculation
* Real-time procurement status

---

## 🛠️ Tech Stack

* **Frontend:** React, JavaScript
* **Backend:** Node.js
* **API:** REST
* **Database:** PostgreSQL
* **Authentication:** OTP + JWT
* **Testing:** Jest
* **Tools:** Git & GitHub

---

## 🏗️ Architecture

```text
Farmer Portal ──────┐
                    │
                    ▼
              REST API
                    │
                    ▼
          Application Services
                    │
                    ▼
             PostgreSQL
                    ▲
                    │
Operator Portal ────┘
```

---

## 🎫 Token Management

Tokens are generated sequentially for each procurement centre and reset daily.

```text
Centre A → #001 → #002 → #003 → ...
Centre B → #001 → #002 → #003 → ...
```

Database-level locking helps prevent duplicate token allocation during concurrent bookings.

---

## 🔌 API Examples

### Farmer Login

```http
POST /api/v1/auth/farmer/login
```

```json
{
  "mobileNumber": "9876543210"
}
```

### Verify OTP

```http
POST /api/v1/auth/farmer/verify-otp
```

```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

### Farmer Profile

```http
GET /api/v1/farmers/profile
Authorization: Bearer <token>
```

---

## 📁 Project Structure

```text
kisan-setu/
├── frontend/
├── backend/
├── database/
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js 18+
* npm
* PostgreSQL
* Git

### Installation

```bash
git clone https://github.com/USERNAME/kisan-setu.git
cd kisan-setu
npm install
npm run dev
```

Run tests:

```bash
npm test
```

---

## 🧠 Future Enhancements

* [ ] Multilingual farmer interface
* [ ] SMS/WhatsApp notifications
* [ ] Offline support
* [ ] Advanced analytics
* [ ] Fraud/anomaly detection
* [ ] Government & payment-system integrations
* [ ] Mobile application

---

## 🏆 Hackathon

**Smart India Hackathon (SIH) 2026**
**Domain:** Agriculture & Farmer Procurement

Kisan Setu is being developed to create a more **transparent, efficient, and farmer-friendly procurement experience**.

---

# 👥 Team Kisan Setu

**Hackathon:** Smart India Hackathon (SIH) 2026
**Domain:** Agriculture & Farmer Procurement

### 🔗 Team Members

* **Team Member 1** — [GitHub](https://github.com/iamkumaresh) · [LinkedIn](https://www.linkedin.com/in/kumaresh-jana-050406k)
* **Team Member 2** — [GitHub](https://github.com/Zabed05) · [LinkedIn](https://www.linkedin.com/in/zabed-khan/)
* **Team Member 3** — [GitHub](https://github.com/HRITWIK11) · [LinkedIn](https://www.linkedin.com/in/hritwik-mondal-ba2a47332/)
* **Team Member 4** — [GitHub](https://github.com/beraa5413-ops) · [LinkedIn](https://www.linkedin.com/in/priyoshree-bera-b5196a303/)
* **Team Member 5** — [GitHub](https://github.com/sayantikaghosh581-ctrl) · [LinkedIn](https://www.linkedin.com/in/sayantika-ghosh-4257413ba)
* **Team Member 6** — [GitHub](https://github.com/souranaray-sketch) · [LinkedIn](https://www.linkedin.com/in/sourana-ray-8215b3371/)

---

## 📄 License

Developed for **educational, research, and hackathon purposes**.

---

### 🌾 Kisan Setu

**Connecting Farmers. Streamlining Procurement. Building a Smarter Agricultural Ecosystem.**
