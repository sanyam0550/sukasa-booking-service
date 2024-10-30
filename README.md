# Sukasa Air Booking Service
This repository contains the booking service for Sukasa Air, built with the NestJS framework. The service supports flight management, seat reservation, and user authentication, including JWT-based security.
## Prerequisites

- **Docker** (latest version)
- **Node.js** (v22 or later)
- **npm** (latest version)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sanyam0550/sukasa-booking-service.git
    cd sukasa-booking-service
    ```

2. Install the project dependencies:

    ```bash
    npm install
    ```

3. Build the project:

    ```bash
    npm run build
    ```

## Running the Application

### Using Docker Compose and `start.sh` Script

To build and run the application along with MongoDB and Redis using Docker Compose, you can use the `start.sh` script:

1. Make the `start.sh` script executable:

    ```bash
    chmod +x start.sh
    ```

2. Run the script:

    ```bash
    ./start.sh
    ```

This script will:
- Build the Docker image with the tag `sukasa_service:latest`.
- Start the services (application, MongoDB, Redis) using `docker-compose up`.

### Directly with Docker

Alternatively, you can build and run the application directly with Docker:

1. **Build the Docker image**:

    ```bash
    docker build -t sukasa_service:latest .
    ```

2. **Run the Docker container**:

    ```bash
    docker run -p 3000:3000 --name sukasa-booking-service sukasa_service:latest
    ```

## Database Seeding

To populate the database with initial data, including admin users and sample flights:

1. Run the seed script:

    ```bash
    npm run seedDB
    ```

This will:
- Connect to MongoDB.
- Add default admin users.
- Populate sample flights and seats.

Ensure that your MongoDB connection URI in `.env` matches the running MongoDB instance (Docker or local).

## Unit Test Cases

1. Install dependencies:

    ```bash
    npm install
    ```

2. Run unit tests:

    ```bash
    npm run test
    ```

## Swagger API Documentation

The project includes Swagger for API documentation, which allows you to explore and test available endpoints easily.

- **Access the Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Environment Variables

Create a `.env` file in the root directory with the following structure:

```dotenv
MONGODB_URI=mongodb://mongo:27017/sukasa_air
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=myjwtsecretkey
REDIS_URI=redis://redis:6379