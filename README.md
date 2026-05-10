# PlantCare v2

PlantCare v2 is a mobile-first smart plant-care application built around plant identification, plant health tracking, user authentication, and a planned IoT irrigation layer. The project combines an Expo React Native mobile app, an Express/MongoDB backend, Plant.id-powered plant recognition, and future MQTT/ESP32 integration for sensor telemetry and pump control.

> Current status: prototype / rebuild candidate. The app already includes a mobile frontend, authentication endpoints, plant CRUD endpoints, MongoDB persistence, and Plant.id integration. The IoT layer is planned but not fully implemented yet.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Backend API](#backend-api)
- [Mobile App Notes](#mobile-app-notes)
- [Plant.id Integration](#plantid-integration)
- [IoT / MQTT Design](#iot--mqtt-design)
- [Database Models](#database-models)
- [Security Notes](#security-notes)
- [Known Issues](#known-issues)
- [Recommended Improvements](#recommended-improvements)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

PlantCare v2 helps users identify plants, save plant records, monitor plant health information, and manage plant-care data from a mobile app. The longer-term goal is to connect the mobile app to smart irrigation devices that can report sensor data and receive watering commands.

The system is designed around these main parts:

1. **Expo mobile app** for authentication, plant scanning, plant records, and dashboard screens.
2. **Express backend API** for auth, plant CRUD, validation, and MongoDB persistence.
3. **MongoDB database** for users, refresh tokens, and plant records.
4. **Plant.id API integration** for plant identification and health assessment.
5. **Planned MQTT/ESP32 layer** for telemetry, irrigation commands, and smart watering automation.

---

## Core Features

### Implemented / Prototype Features

- User sign up and login.
- JWT access token and refresh token flow.
- User profile endpoint.
- Plant creation, retrieval, update, and deletion.
- Plant records linked to a user ID.
- Plant.id classification and plant-health payload storage.
- Expo Router-based mobile navigation.
- Environment-based configuration for backend and mobile app.
- Basic request validation middleware.
- Centralized backend database connection.
- Centralized backend error handling pattern.

### Planned Features

- Secure authenticated plant ownership.
- Server-side Plant.id proxy to protect API keys.
- Device pairing and provisioning.
- ESP32 firmware integration.
- MQTT telemetry ingestion.
- Soil moisture history.
- Temperature and humidity history.
- Pump command history.
- Irrigation schedules.
- Smart watering rules.
- Device online/offline status.
- Alerts and notifications.
- Secure logout and refresh-token revocation.
- Automated tests and CI/CD.

---

## Tech Stack

### Mobile

- Expo SDK 54
- React Native
- React
- Expo Router
- TypeScript
- AsyncStorage currently used in prototype flows
- Plant.id client integration

### Backend

- Node.js
- Express `^4.21.2`
- MongoDB
- Mongoose `^8.10.1`
- bcryptjs `^3.0.2`
- jsonwebtoken `^9.0.2`
- dotenv `^16.4.7`
- cors `^2.8.5`
- nodemon `^3.1.9`

### Planned / Recommended

- TypeScript backend
- Zod validation
- TanStack Query for server state
- Zustand for local state
- expo-secure-store for sensitive token storage
- MQTT.js for backend MQTT integration
- Mosquitto, EMQX, or HiveMQ as MQTT broker
- Pino for logging
- Jest/Vitest, Supertest, and React Native Testing Library

---

## Project Structure

The current project is organized as a mobile app with a separate backend folder.

```text
PlantCare-v2/
  app/
    # Expo Router screens and routes
  models/
    # TypeScript interfaces for plant data
  services/
    # API client, auth storage, Plant.id integration, plant functions
  constants/
    # Runtime configuration
  utils/
    # Formatting and helper utilities
  widgets/
    # Reusable UI component placeholders
  state/
    # Future state management folder
  backend/
    config/
      db.js
      env.js
    controllers/
      authController.js
      plantController.js
    middleware/
      asyncHandler.js
      authMiddleware.js
      errorHandler.js
      validateRequest.js
    models/
      User.js
      Plant.js
    routes/
      authRoutes.js
      plantRoutes.js
    server.js
```

---

## Architecture

PlantCare v2 follows a client-server architecture.

```text
Mobile App
  |
  | HTTP / JSON
  v
Express Backend API
  |
  | Mongoose
  v
MongoDB

Mobile App
  |
  | Plant image / API request
  v
Plant.id API

Future IoT Layer:

ESP32 Device
  |
  | MQTT telemetry/status
  v
MQTT Broker
  |
  v
Backend MQTT Client
  |
  v
MongoDB + Mobile API
```

### Main Responsibilities

| Component | Responsibility |
|---|---|
| Mobile app | User interface, image capture, auth flow, plant views |
| Backend API | Auth, validation, plant CRUD, persistence |
| MongoDB | Users, refresh tokens, plant records |
| Plant.id | Plant classification and health assessment |
| MQTT broker | Future device message bus |
| ESP32 firmware | Future pump control and sensor telemetry |

---

## Prerequisites

Before running the project, install or prepare:

- Node.js 18 or newer
- npm
- MongoDB Atlas account or local MongoDB instance
- Expo Go app or a mobile simulator/emulator
- Plant.id API key
- Git

---

## Environment Variables

### Backend Environment

Create a `.env` file inside the `backend/` folder.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Recommended production-ready backend variables:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
PLANT_ID_API_KEY=your_plant_id_api_key
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
CORS_ORIGIN=http://localhost:8081
```

### Mobile Environment

Create a `.env` file in the repository root.

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_PLANT_ID_API_KEY=your_plant_id_api_key
```

When testing on a physical phone, replace `localhost` with your computer LAN IP address:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000
```

Important: variables prefixed with `EXPO_PUBLIC_` are bundled into the mobile app. Do not store private secrets in public Expo variables in production.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/BahrouniAyoub/PlantCare-v2.git
cd PlantCare-v2
```

Install mobile dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create backend environment file:

```bash
cp .env.example .env
```

Create mobile environment file from the root folder:

```bash
cd ..
cp .env.example .env
```

Fill in all required environment variables before starting the app.

---

## Running the Project

### Start the Backend

```bash
cd backend
npm run dev
```

The backend runs by default at:

```text
http://localhost:5000
```

### Start the Mobile App

From the repository root:

```bash
npm run dev
```

Then open the app using:

- Expo Go on a physical device
- Android emulator
- iOS simulator
- Web preview, if supported by the current Expo configuration

### Useful Checks

Backend syntax check:

```bash
cd backend
npm run check
```

Mobile type check:

```bash
npm run typecheck
```

---

## Backend API

Base URL:

```text
http://localhost:5000
```

The backend currently supports both `/plants` and `/api/plants` for compatibility. New clients should prefer `/api/plants`.

---

### Authentication Endpoints

#### Sign Up

```http
POST /api/auth/signup
```

Request body:

```json
{
  "name": "Plant Owner",
  "email": "owner@example.com",
  "password": "minimum8chars"
}
```

Successful response:

```json
{
  "userId": "mongodb-user-id",
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

---

#### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "owner@example.com",
  "password": "minimum8chars"
}
```

Successful response:

```json
{
  "userId": "mongodb-user-id",
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

---

#### Get Profile

```http
GET /api/auth/profile
```

Headers:

```text
Authorization: Bearer <accessToken>
```

---

#### Refresh Token

```http
POST /api/auth/refresh-token
```

Request body:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Successful response:

```json
{
  "accessToken": "new-jwt-access-token"
}
```

---

### Plant Endpoints

#### Create Plant

```http
POST /api/plants
```

Required fields:

- `name`
- `image`
- `userId`

Request body:

```json
{
  "name": "Monstera deliciosa",
  "image": "file-or-uri",
  "userId": "mongodb-user-id",
  "is_plant": {},
  "classification": {},
  "plantHealth": {}
}
```

---

#### Get Plants by User ID

```http
GET /api/plants/:userId
```

Response:

```json
[
  {
    "_id": "plant-id",
    "name": "Monstera deliciosa",
    "image": "file-or-uri",
    "userId": "mongodb-user-id"
  }
]
```

---

#### Get Plant by Plant ID

```http
GET /api/plants/plant/:id
```

---

#### Update Plant

```http
PUT /api/plants/:id
```

Request body:

```json
{
  "name": "Updated plant name"
}
```

---

#### Delete Plant

```http
DELETE /api/plants/:id
```

Successful response:

```json
{
  "message": "Plant deleted"
}
```

---

## Error Responses

Validation error example:

```json
{
  "message": "Validation failed",
  "errors": [
    "email must be a valid email address"
  ]
}
```

Runtime error example:

```json
{
  "message": "Server error"
}
```

Recommended future standard error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

---

## Mobile App Notes

The mobile app uses Expo Router. Route files should remain inside the `app/` directory because Expo Router depends on the file-system routing structure.

Recommended mobile organization for future refactoring:

```text
src/
  app/
    (auth)/
      login.tsx
      signup.tsx
    (tabs)/
      plants.tsx
      devices.tsx
      alerts.tsx
      settings.tsx
    plant/
      [plantId].tsx
      scan.tsx
    device/
      [deviceId].tsx
      pair.tsx
  components/
    plants/
    devices/
    forms/
    layout/
    feedback/
  features/
    auth/
    plants/
    devices/
    scans/
    schedules/
    alerts/
  services/
    api/
    queryClient.ts
    secureStorage.ts
  stores/
    authStore.ts
  types/
  utils/
  constants/
```

---

## Plant.id Integration

The app currently uses Plant.id to identify plants and assess plant health from captured images.

In the prototype, the mobile app may call Plant.id directly using an Expo public environment variable. This is acceptable for local experimentation but not secure for production, because public Expo variables can be extracted from the shipped app.

Recommended production flow:

```text
Mobile App
  -> Backend /plants/identify
  -> Plant.id API
  -> Backend validates and stores result
  -> Mobile receives normalized plant scan response
```

Recommended endpoint:

```http
POST /api/plants/identify
```

Production recommendations:

- Keep `PLANT_ID_API_KEY` only on the backend.
- Add request size limits for images.
- Add rate limiting for scan endpoints.
- Normalize Plant.id responses before storing them.
- Store scan history separately from the main plant profile.

---

## IoT / MQTT Design

The planned IoT layer uses MQTT as the message bus between ESP32 devices and the backend.

### Recommended MQTT Topics

```text
plantcare/devices/{deviceId}/telemetry
plantcare/devices/{deviceId}/commands
plantcare/devices/{deviceId}/status
plantcare/devices/{deviceId}/acks
```

### Telemetry Payload Example

```json
{
  "soilMoisture": 42,
  "temperature": 24.5,
  "humidity": 58,
  "tankLevel": 81,
  "pumpOn": false,
  "batteryPercent": 92,
  "timestamp": "2026-05-06T12:00:00.000Z"
}
```

### Watering Command Example

```json
{
  "command": "water",
  "durationSeconds": 10,
  "correlationId": "uuid"
}
```

### IoT Safety Recommendations

- Enforce maximum pump duration on both backend and firmware.
- Add watering cooldowns.
- Record every irrigation command in an audit log.
- Use device-specific credentials.
- Add MQTT last-will messages for offline detection.
- Validate all telemetry payloads before saving them.

---

## Database Models

### Current User Model

Current user fields include:

- `name`
- `email`
- `password`
- `role`
- `refreshToken`

### Current Plant Model

Current plant fields include:

- Plant name
- Image
- User ID
- Plant.id classification payload
- Plant health payload
- Status fields

### Recommended Future Collections

For a production rebuild, use separate collections for:

- Users
- Sessions
- Plants
- Plant scans
- Devices
- Sensor readings
- Irrigation events
- Schedules
- Alerts

---

## Security Notes

The current prototype has several important security concerns that should be addressed before production use.

### Critical Security Issues

1. Plant CRUD routes are not fully protected by authentication middleware.
2. Plant ownership is controlled by `userId` sent from the mobile client.
3. Refresh tokens are stored in plaintext.
4. Plant.id API calls should not happen from the production mobile app.
5. Mobile public environment variables must not contain secrets.
6. CORS configuration should be restricted in production.
7. Auth endpoints should have rate limiting.
8. Request validation should validate route params, ObjectIds, nested objects, and payload sizes.

### Recommended Fixes

- Protect all plant, device, telemetry, schedule, irrigation, and alert routes.
- Derive ownership from the authenticated user, not from request body `userId`.
- Store only hashed refresh tokens.
- Add refresh token rotation.
- Add logout and logout-all endpoints.
- Move Plant.id calls to the backend.
- Add rate limits to auth and scan endpoints.
- Add strict CORS origin configuration.
- Rotate any credentials that were ever committed to the repository.

---

## Known Issues

- Plant endpoints are currently not protected enough for production use.
- `GET /api/plants/:id` means user ID, while `GET /api/plants/plant/:id` means plant ID, which is confusing.
- Both `/plants` and `/api/plants` are active, increasing API surface area.
- Error responses are inconsistent in some places.
- Validation is shallow and does not fully validate nested data.
- Refresh token endpoint does not rotate refresh tokens.
- No logout endpoint currently exists.
- No rate limiting currently exists for authentication endpoints.
- IoT/MQTT integration is planned but not fully implemented.
- Dashboard data may depend on locally stored current plant data instead of fresh API reads.
- Automated tests and CI/CD are missing.

---

## Recommended Improvements

### Backend

- Rebuild backend modules around auth, plants, scans, devices, telemetry, irrigation, schedules, and alerts.
- Use TypeScript.
- Use Zod for validation.
- Add centralized API response standards.
- Add route-level authorization.
- Add structured logging with request IDs.
- Add API tests with Supertest.

### Mobile

- Move sensitive token storage from AsyncStorage to `expo-secure-store`.
- Use TanStack Query for server-state caching.
- Use Zustand for local UI/auth state.
- Avoid storing complex plant records in AsyncStorage for navigation.
- Navigate by IDs and fetch fresh records from the API.
- Consolidate duplicate plant scan/add flows.

### IoT

- Add device pairing.
- Add backend MQTT client.
- Add telemetry ingestion.
- Add irrigation command publishing.
- Add command acknowledgements.
- Add offline detection.
- Add pump safety rules.

---

## Roadmap

### Phase 1: Stabilize Prototype

- Remove committed secrets.
- Rotate database and JWT credentials.
- Protect plant routes.
- Standardize API errors.
- Add logout endpoint.
- Add request validation for ObjectIds and nested fields.

### Phase 2: Improve Mobile Data Layer

- Add secure token storage.
- Add TanStack Query.
- Add proper auth refresh handling.
- Refactor duplicated scan logic.
- Improve loading and error states.

### Phase 3: Move Plant.id to Backend

- Add `/api/plants/identify` endpoint.
- Store Plant.id key only in backend `.env`.
- Add image limits and rate limits.
- Store scan history.

### Phase 4: Add IoT Core

- Add device model.
- Add device pairing endpoint.
- Add MQTT broker configuration.
- Add telemetry ingestion.
- Add watering command endpoint.
- Add irrigation event history.

### Phase 5: Production Readiness

- Add tests.
- Add CI/CD.
- Add deployment configuration.
- Add monitoring and logging.
- Add production CORS and rate limits.
- Add release builds with EAS.

---

## Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add your feature"
```

4. Push your branch:

```bash
git push origin feature/your-feature-name
```

5. Open a pull request.

Before opening a pull request, run the available checks:

```bash
npm run typecheck
cd backend
npm run check
```

---

## License

No license information was found in the provided project documentation. Add a `LICENSE` file before distributing or publishing the project for reuse.

---

## Maintainer Notes

This README is written for the current PlantCare v2 prototype and includes production recommendations based on the documented project architecture and audit notes. Update this file whenever the API routes, environment variables, setup steps, or app structure change.
