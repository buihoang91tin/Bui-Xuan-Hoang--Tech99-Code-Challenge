# Scoreboard API Service

## Overview

This document describes the specification for the **Scoreboard API Service**, which is responsible for handling user scores in a live scoreboard environment. The system is designed to:
- Update and track user scores in real-time.
- Provide secure access to the scoreboard.
- Prevent unauthorized updates to the scores.

The following sections describe the core functionality, security requirements, API endpoints, and additional details needed for the backend engineering team to implement the service.

---

## Functional Requirements

### User Actions and Score Update
- Users will perform certain actions on the website that result in a score increase.
- After completing an action, the frontend will send a request to the backend API to update the user's score.
- The system will handle the score update by adding the new score to the user's total score.

### Live Update of Scoreboard
- The scoreboard should always show the **top 10 highest scores**.
- The system must update the scoreboard in real-time to reflect score changes as users complete actions.
- There must be an endpoint to fetch the current top 10 scores, and this list should always be sorted in descending order of scores.

### Authorization and Security
- The system must authenticate and authorize users before allowing score updates.
- Only users with valid authentication (e.g., via API tokens or sessions) should be allowed to update scores.
- The backend should prevent **malicious users** from tampering with scores by ensuring that:
  - Users can only update their own score.
  - API requests must include a valid user token to ensure proper user identity.

### API Design
The API should include the following endpoints:

1. **POST /scores/update**
   - **Description**: Updates the user's score after performing an action.
   - **Input**: 
     - `userId`: (string) The ID of the user.
     - `score`: (integer) The score increase.
   - **Output**: 
     - Success response with the updated score for the user.
   - **Security**: Requires authentication (API token).

2. **GET /scores/top**
   - **Description**: Fetches the current top 10 user scores.
   - **Output**: 
     - A list of top 10 users and their scores, sorted in descending order.
   - **Security**: Open for all users (no authentication required).

3. **POST /scores/authenticate**
   - **Description**: Authenticates the user and issues a token for further requests.
   - **Input**: 
     - `username`: (string) The username of the user.
     - `password`: (string) The password for authentication.
   - **Output**:
     - A JWT token for the authenticated user.
   - **Security**: Requires the user to be valid and have the right credentials.

4. **PUT /scores/reset**
   - **Description**: Allows admins to reset the scores of all users.
   - **Output**: 
     - Success message confirming that all scores are reset.
   - **Security**: Only accessible by authorized admin users.

---

## Security Requirements

- **Authentication**: 
  - Users must authenticate to interact with the API using an API token or session cookie.
  - Authentication can be done via **JWT (JSON Web Token)** or another suitable mechanism.
  
- **Authorization**:
  - Only authorized users should be able to update their scores.
  - Users should not be able to update the scores of other users.
  - For the **reset endpoint**, only admins should be allowed to trigger score resets.

- **Input Validation**:
  - The API should validate all incoming requests to ensure no malicious data is processed (e.g., SQL injection prevention).
  - Validate that the `score` is a positive integer and within a valid range.

---

## Architecture & Design

### Database Schema

The system should have a database table for storing user scores. Below is the suggested schema:

  ```sql
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```

- users Table: Stores information about each user.
- score Table: Stores scores for users, with each score update recorded with a timestamp.

---

## API Server Design

- The server should be implemented using *Node.js* and *Express.js.*
- JWT Authentication will be used to secure endpoints requiring user identity verification.
- The backend should implement a *WebSocket* or *Server-Sent Events (SSE)* system to broadcast live updates to connected clients.

---

## Flow of Execution

1. User Action: A user completes an action on the frontend, triggering an API request to update their score.
2. API Call: The frontend makes a POST /scores/update request with the user's ID and the score increase.
3. Authentication & Authorization: The API checks the JWT token provided in the request to authenticate the user.
4. Score Update: If the user is valid, the backend updates the user's score in the database.
5. Live Update: The system broadcasts the updated scoreboard to all connected clients (e.g., using WebSockets).
6. Fetch Top Scores: Users can view the top 10 scores by calling the GET /scores/top endpoint.

## Diagram of Execution Flow
Here is a simplified diagram illustrating the flow of the system:

  ```pgsql
  Frontend <--- POST /scores/update ---> Backend (Express)
                     |
                     v
              Authentication
                     |
                     v
                Update Score
                     |
                     v
            Broadcast to Clients (WebSockets)
                     |
                     v
            Fetch Top 10 Scores (GET /scores/top)
  ```
---

## Additional Comments for Improvement

- *Scalability:*
  - In a production environment, using Redis for caching the top 10 scores could improve performance by reducing database load.
  - If the user base grows significantly, consider separating score updates and leaderboard queries into separate services to ensure scalability.

- *Error Handling:*
 - Ensure proper error handling is in place, such as handling invalid tokens, failed score updates, and database connection issues.
 - Provide meaningful error messages with status codes (e.g., `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`).

- *Testing:*
 - Implement unit and integration tests using tools like *Jest* or *Mocha* to ensure the functionality is working correctly and securely.
 - Test scenarios like invalid user attempts to update scores, valid/invalid JWT tokens, and live updates to the scoreboard.

---

## Conclusion
This specification provides a clear outline for implementing a secure and scalable scoreboard system with live updates. By following these guidelines, the backend engineering team can ensure that the system meets the functional and security requirements, while also supporting real-time updates for a smooth user experience.