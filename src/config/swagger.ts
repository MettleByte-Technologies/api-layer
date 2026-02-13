import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Integration API",
      version: "1.0.0",
      description:
        "API for managing integrations (Google, Outlook, Hubspot, etc.) with calendar and OAuth flows.",
    },
    servers: [
      {
        url: "/api/v1",
      },
    ],
    components: {
      schemas: {
        CreateEventRequest: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
            attendees: {
              type: "array",
              items: { type: "string", format: "email" },
            },
          },
          required: ["title", "start", "end"],
        },
      },
    },
    paths: {
      "/integrations/{provider}/connect/{userId}": {
        get: {
          tags: ["Integrations"],
          summary: "Start OAuth flow for a provider",
          parameters: [
            {
              name: "provider",
              in: "path",
              required: true,
              schema: { type: "string", example: "google" },
            },
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Auth URL generated",
            },
            400: {
              description: "Unsupported provider",
            },
          },
        },
      },
      "/integrations/{provider}/calendars/{userId}": {
        get: {
          tags: ["Calendars"],
          summary: "List calendars for a provider",
          parameters: [
            {
              name: "provider",
              in: "path",
              required: true,
              schema: { type: "string", example: "google" },
            },
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "List of calendars",
            },
            400: {
              description: "Unsupported provider or action",
            },
          },
        },
      },
      "/integrations/{provider}/calendars/{userId}/events": {
        get: {
          tags: ["Calendars"],
          summary: "List events for a calendar",
          parameters: [
            {
              name: "provider",
              in: "path",
              required: true,
              schema: { type: "string", example: "google" },
            },
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "calendarId",
              in: "query",
              required: false,
              schema: { type: "string", example: "primary" },
            },
          ],
          responses: {
            200: {
              description: "List of events",
            },
            400: {
              description: "Unsupported provider or action",
            },
          },
        },
        post: {
          tags: ["Calendars"],
          summary: "Create an event",
          parameters: [
            {
              name: "provider",
              in: "path",
              required: true,
              schema: { type: "string", example: "google" },
            },
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "calendarId",
              in: "query",
              required: false,
              schema: { type: "string", example: "primary" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateEventRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Event created",
            },
            400: {
              description: "Unsupported provider or action",
            },
          },
        },
      },
      "/oauth/google/callback": {
        get: {
          tags: ["OAuth"],
          summary: "Google OAuth callback",
          parameters: [
            {
              name: "code",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "state",
              in: "query",
              required: true,
              schema: { type: "string", description: "userId" },
            },
          ],
          responses: {
            200: {
              description: "Google connected successfully",
            },
            400: {
              description: "Invalid request",
            },
            500: {
              description: "OAuth failed",
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);


