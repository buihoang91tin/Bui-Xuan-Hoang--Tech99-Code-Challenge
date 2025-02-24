# Express TypeScript CRUD API with SQLite and Swagger

This project implements a backend server using ExpressJS with TypeScript. It provides a set of CRUD endpoints to interact with a resource (named "Item") and uses an SQLite database for data persistence. Swagger is integrated to document and visualize the API.

## Features

- **CRUD Operations:**  
  - **Create:** `POST /items`  
  - **List:** `GET /items` (supports filtering by name)  
  - **Read:** `GET /items/:id`  
  - **Update:** `PUT /items/:id`  
  - **Delete:** `DELETE /items/:id`
- **Database:** SQLite for data persistence.
- **API Documentation:** Swagger UI available at `/api-docs`.
- **Unit Testing:** Jest and Supertest are used to verify endpoint functionality.


## Prerequisites

- Node.js (v14 or higher)
- npm

## Project Structure
project-root/ 
  ├── package.json 
  ├── tsconfig.json 
  ├── jest.config.js 
  ├── README.md 
  └── src/ 
    ├── database.ts // Database handling
    └── app.ts // Express application (exported for testing) 
    └── app.test.ts // Unit tests for CRUD endpoints

## Installation

1. Clone the repository:

  ```bash
   git clone <repository-url>
   cd express-typescript-crud-sqlite-swagger
  ```

2. Install dependencies:

  ```bash
   npm install
  ```

3. Build the TypeScript code:

  ```bash
   npm run build
  ```

## Running the Application

**In Development Mode**

Use ts-node-dev for automatic restarts during development:
  ```bash
    npm run dev
  ```

**In Production  Mode**
1. Build the project:

  ```bash
    npm run dev
  ```

2. Start the application:

  ```bash
    npm start
  ```

The server will start on port 3000 (or the port specified in your environment). You can access the Swagger documentation at:

http://localhost:3000/api-docs

## API Endpoints ##

- **Create Item:**
  POST /items
  Request Body Example:
    ```bash
    {
      "name": "Item Name",
      "description": "Item Description"
    }
    ```
- **List Items:**
  GET /items
  Optional Query Parameter: name (to filter items by name)

- **Get Item Details:**
  GET /items/:id

- **Update Item:**
  PUT /items/:id
  Request Body Example
    ```bash
    {
      "name": "Updated Name",
      "description": "Updated Description"
    }
    ```
  - **Get Item Details:**
  GET /items/:id

## Swagger Document tation ##
Swagger is used to document the API. After starting the server, visit:
http://localhost:3000/api-docs to view the API documentation and test the endpoints interactively.

## Running Unit Test ##
This project uses Jest for unit testing. To run the tests, execute:

  ```bash
  npm test
  ```

The tests are located in the src/app.test.ts file and use Supertest to verify the CRUD endpoints.

## License ##

This project is licensed under the MIT License.
