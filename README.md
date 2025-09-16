# Road Trip Planner

## Project Overview
Road Trip Planner is a full-stack web application that allows users to discover, create, and share detailed road trip plans. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js), it offers users the ability to upload images, view weather info, plan routes, and engage with a community through comments and reviews.

---

## Features
- User authentication with registration and login (JWT-based security)
- Create, read, update, and delete (CRUD) road trips
- Upload multiple images per trip hosted via Cloudinary
- Community features: like/unlike trips, add comments and reviews
- Real-time weather information for trip locations
- Interactive route mapping showing distance and duration (OpenRouteService)
- Nearby places and attractions for trip destinations (Geoapify)
- Responsive UI built with React and Tailwind CSS

---

## Technology Stack
- Frontend: React.js, React Router, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB (via Mongoose)
- Authentication: JSON Web Tokens (JWT), bcrypt.js
- Image Uploads: Multer, Cloudinary API
- Maps & Routes: React Leaflet, OpenRouteService API
- External APIs: WeatherAPI, Geoapify Places API

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- Cloudinary account for image uploads
- API keys for WeatherAPI, OpenRouteService, Geoapify

### Installation

1. Clone the repository

git clone https://github.com/yourusername/road-trip-planner.git
cd road-trip-planner

text

2. Backend Setup

cd backend
npm install

text

Create a `.env` file in the `backend` folder with the following variables:

MONGODBCONNECTIONSTRING=your_mongodb_connection_string
JWTSECRET=your_jwt_secret
WEATHERAPIKEY=your_weather_api_key
ORSAPIKEY=your_open_route_service_key
GEOAPIFYAPIKEY=your_geoapify_api_key
CLOUDINARYCLOUDNAME=your_cloudinary_cloud_name
CLOUDINARYAPIKEY=your_cloudinary_api_key
CLOUDINARYAPISECRET=your_cloudinary_api_secret

text

Start the backend server:

npm start

text

3. Frontend Setup

cd ../frontend
npm install
npm start

text

The frontend will run on `http://localhost:3000` and proxy API requests to backend.

---

## Usage Guide

- Register an account or login with existing credentials.
- Explore trips on the homepage.
- Create new trips with detailed routes and images.
- Like, comment, and review trips to engage with other users.
- View weather and route information for trip destinations.
- Manage your own trips from the "My Trips" section.

---

## API Documentation

The backend includes Swagger-based interactive API documentation.

After starting the backend, access the docs at:

http://localhost:5000/api-docs

text

This provides detailed information on all REST API endpoints, request/response formats, and authentication requirements.

---

## Code Documentation

The backend codebase is documented using JSDoc. Developers can generate HTML docs using:

npm run docs

text

Ensure JSDoc is installed (`npm install --save-dev jsdoc`).

---

## Troubleshooting

- Ensure all required environment variables are correctly set.
- Clear browser cache if static assets like favicon or images don’t update.
- Verify API keys are valid and have required permissions.
- For issues with route or weather APIs, check usage limits and network access.

---

## Contributions

Contributions and feedback are welcome! Please follow the standard fork-branch-pull request workflow.

---

## License

This project is licensed under the MIT License.

---