# Google API Integration Documentation

This document provides comprehensive documentation for the Google Calendar API integration endpoints.

## Base URL

```
http://localhost:5000/api/v1/google
```

## Authentication

Most endpoints require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Connect - Generate Auth URL

Generate an OAuth authorization URL to initiate the Google authentication flow.

**Endpoint:** `POST /api/v1/google/connect`

**Request Body:**
```json
{
  "redirect_uri": "https://your-app.com/callback"
}
```

**Response:**
```json
{
  "authUri": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/google/connect \
  -H "Content-Type: application/json" \
  -d '{"redirect_uri": "https://your-app.com/callback"}'
```

**Response Example:**
```json
{
  "authUri": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=https://www.googleapis.com/auth/calendar%20https://www.googleapis.com/auth/userinfo.email&redirect_uri=https://your-app.com/callback&response_type=code&client_id=..."
}
```

---

### 2. Get Access Token

Exchange the authorization code for access and refresh tokens.

**Endpoint:** `POST /api/v1/google/token`

**Request Body:**
```json
{
  "code": "4/0AeanS...",
  "redirect_uri": "https://your-app.com/callback"
}
```

**Response:**
```json
{
  "access_token": "ya29.a0AfH6SMC...",
  "refresh_token": "1//0g...",
  "expiry_date": 1234567890000,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/google/token \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AeanS...",
    "redirect_uri": "https://your-app.com/callback"
  }'
```

**Note:** The `redirect_uri` must match exactly the one used in the connect endpoint.

---

### 3. Get All Calendars

Retrieve a list of all calendars accessible to the authenticated user.

**Endpoint:** `GET /api/v1/google/calendars`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "calendars": [
    {
      "id": "primary",
      "summary": "your-email@gmail.com",
      "description": "Primary calendar",
      "timeZone": "America/New_York",
      "accessRole": "owner"
    },
    {
      "id": "calendar-id-2",
      "summary": "Work Calendar",
      "description": "Work events",
      "timeZone": "America/New_York",
      "accessRole": "owner"
    }
  ]
}
```

**Example:**
```bash
curl -X GET http://localhost:5000/api/v1/google/calendars \
  -H "Authorization: Bearer ya29.a0AfH6SMC..."
```

---

### 4. Get All Events

Retrieve all events from a specific calendar.

**Endpoint:** `GET /api/v1/google/events`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `calendarId` (optional): Calendar ID. Defaults to `"primary"` if not provided.

**Response:**
```json
{
  "events": [
    {
      "id": "event-id-1",
      "summary": "Meeting with Team",
      "description": "Discuss project progress",
      "start": {
        "dateTime": "2024-01-15T10:00:00Z",
        "timeZone": "UTC"
      },
      "end": {
        "dateTime": "2024-01-15T11:00:00Z",
        "timeZone": "UTC"
      },
      "attendees": [
        {
          "email": "attendee@example.com",
          "responseStatus": "accepted"
        }
      ]
    }
  ]
}
```

**Example:**
```bash
# Get events from primary calendar
curl -X GET http://localhost:5000/api/v1/google/events \
  -H "Authorization: Bearer ya29.a0AfH6SMC..."

# Get events from specific calendar
curl -X GET "http://localhost:5000/api/v1/google/events?calendarId=calendar-id-2" \
  -H "Authorization: Bearer ya29.a0AfH6SMC..."
```

---

### 5. Create Event

Create a new calendar event.

**Endpoint:** `POST /api/v1/google/events`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "start": "2024-01-15T10:00:00Z",
  "end": "2024-01-15T11:00:00Z",
  "attendees": ["attendee1@example.com", "attendee2@example.com"],
  "calendarId": "primary"
}
```

**Required Fields:**
- `title` (string): Event title
- `start` (string): Start date/time in ISO 8601 format
- `end` (string): End date/time in ISO 8601 format

**Optional Fields:**
- `description` (string): Event description
- `attendees` (array of strings): List of attendee email addresses
- `calendarId` (string): Calendar ID where to create the event. Defaults to `"primary"` if not provided.

**Response:**
```json
{
  "event": {
    "id": "new-event-id",
    "summary": "Team Meeting",
    "description": "Weekly team sync",
    "start": {
      "dateTime": "2024-01-15T10:00:00Z",
      "timeZone": "UTC"
    },
    "end": {
      "dateTime": "2024-01-15T11:00:00Z",
      "timeZone": "UTC"
    },
    "attendees": [
      {
        "email": "attendee1@example.com"
      },
      {
        "email": "attendee2@example.com"
      }
    ],
    "htmlLink": "https://www.google.com/calendar/event?eid=...",
    "status": "confirmed"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/google/events \
  -H "Authorization: Bearer ya29.a0AfH6SMC..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "start": "2024-01-15T10:00:00Z",
    "end": "2024-01-15T11:00:00Z",
    "attendees": ["attendee1@example.com", "attendee2@example.com"]
  }'
```

---

### 6. Refresh Access Token

Refresh an expired access token using a refresh token.

**Endpoint:** `POST /api/v1/google/refresh`

**Request Body:**
```json
{
  "refresh_token": "1//0g..."
}
```

**Response:**
```json
{
  "access_token": "ya29.newAccessToken...",
  "refresh_token": "1//0g...",
  "expiry_date": 1234567890000,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/google/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "1//0g..."
  }'
```

---

## Complete OAuth Flow Example

### Step 1: Generate Auth URL
```bash
POST /api/v1/google/connect
{
  "redirect_uri": "https://your-app.com/callback"
}
```

Response contains `authUri`. Redirect user to this URL.

### Step 2: User Authorizes
User is redirected to Google, authorizes the app, and is redirected back to your `redirect_uri` with a `code` parameter.

### Step 3: Exchange Code for Tokens
```bash
POST /api/v1/google/token
{
  "code": "<code-from-callback>",
  "redirect_uri": "https://your-app.com/callback"
}
```

Store the `access_token` and `refresh_token` securely.

### Step 4: Use Access Token
Use the `access_token` in the Authorization header for all subsequent API calls.

### Step 5: Refresh Token (when expired)
When the access token expires, use the refresh token:
```bash
POST /api/v1/google/refresh
{
  "refresh_token": "<stored-refresh-token>"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "redirect_uri is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization header with Bearer token is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to get calendars",
  "message": "Detailed error message"
}
```

---

## Scopes

The Google API integration uses the following OAuth scopes:
- `https://www.googleapis.com/auth/calendar` - Full access to Google Calendar
- `https://www.googleapis.com/auth/userinfo.email` - Access to user's email address

---

## Environment Variables

Make sure the following environment variables are set:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.com/callback
```

---

## Notes

1. **Token Storage**: This API does not store tokens in a database. You must securely store the `access_token` and `refresh_token` on your client side.

2. **Token Expiry**: Access tokens typically expire after 1 hour. Use the refresh token endpoint to get a new access token.

3. **Redirect URI**: The `redirect_uri` used in the connect endpoint must exactly match the one used in the token exchange endpoint.

4. **Calendar ID**: The default calendar ID is `"primary"`, which refers to the user's primary calendar.

5. **Date Format**: All dates should be in ISO 8601 format (e.g., `2024-01-15T10:00:00Z`).

---

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:5000/api-docs
```

