# Havenora

**Havenora** is a real estate platform where users can discover, list, and express interest in properties (lands, plots, houses) for **sale or rent**. The company ensures personal follow-up, guidance, and complete paperwork support for every confirmed transaction.

## 🔍 Features

- 🔎 Search for properties by **location**, **property type**, and **purpose** (Buy/Rent)
- 🏠 List properties for sale or rent with images and details
- 📞 Personalized follow-up: team contacts users after expression of interest
- 📜 Full documentation and permissions handled by Havenora
- 🔐 User authentication (to be added)
- 📊 Admin dashboard (to be added)

---

## 🛠️ Tech Stack

- **Frontend**: React (via Vite), TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (or MongoDB as alternative)
- **Hosting**: Netlify (Frontend), Render/AWS/GCP (Backend & DB)

---

## 📂 Project Structure

havenora/
├── client/ # Frontend (React)
│ ├── src/
│ │ ├── pages/ # Home, Listings, AddProperty, etc.
│ │ ├── components/ # Navbar, Footer, PropertyCard, etc.
│ │ └── App.jsx
│ └── index.html
│
├── server/ # Backend (Node.js + Express)
│ ├── routes/ # API routes (properties, users)
│ ├── models/ # DB schema
│ └── index.js
