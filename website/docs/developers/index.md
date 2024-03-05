# Developer & Contributors Documentation

Welcome to the Developer & Contributors Documentation for ApplicantAtlas. This documentation is designed for developers and contributors who wish to contribute to the ApplicantAtlas platform, a comprehensive tool for managing hackathon applicants, RSVPs, and other communications. Whether you're looking to fix bugs, add new features, or simply understand how the platform works, this guide will help you get started.

## Who This Guide is For
- **Developers** interested in setting up the project for development or testing purposes.
- **Contributors** looking to improve the platform or add new features.
- **Technical Writers** aiming to enhance documentation or tutorials.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Docker (with compose)
- Go (version >= 1.21)
- Node.js (version >= 21 for frontend development)
- npm (Node package manager)

### Running the Project For Development
The project is composed of multiple services, including backend APIs, Kafka event listeners, and a frontend application. Follow these steps to get the project up and running:

#### Using a GitHub Codespace

The easiest way to just get set up with the project and start developing is to use a GitHub Codespace. This will automatically set up the project for you and you can start developing right away.

#### Running Locally

For ease of development, we recommend not running everything in docker since it's easier to debug and develop and restart the component you're working on without having to restart and rebuild the entire stack. So here's what we personally do:

1. **Start Docker Services**
   Spin up all the required Docker images for the project's infrastructure components.
   ```bash
   docker compose up kafka mongo zookeeper
   ```


2. **Kafka Event Listener Service**
   In a new terminal, go to the `backend/event-listener` folder and execute the command below to launch the Kafka event listener service:
   ```bash
   KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go
   ```
   If you encounter any issues, try running the command from the API service directory.

3. **API Service Setup**
   Open a separate terminal, navigate to the `backend/api` directory, and run the following command to start the API service:
   ```bash
   MONGO_URL=localhost:27017 MONGO_USER=admin MONGO_PASSWORD=admin MONGO_DB=app MONGO_AUTH_SOURCE=admin CORS_ALLOW_ORIGINS="*" JWT_SECRET_TOKEN="testtesttesttest" KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go
   ```

4. **Frontend Development**
   Ensure you have the correct Node.js version (>= 21) to avoid potential issues with Next.JS. Navigate to the `frontend` directory, install all dependencies with `npm i`, and start the development server using:
   ```bash
   cd frontend && npm i && npm run dev
   ```

## Contributing
We welcome contributions of all forms, from bug fixes to feature additions, and even documentation updates. Please refer to our contribution guidelines for more information on how to submit your contributions effectively.

If you're not sure where to start, if you go to the issues tab on the GitHub repository, you can find issues that are labeled as "good first issue" which are perfect for new contributors to get started with.

If you're looking to find something to contribute to we have a [GitHub project board](https://github.com/users/davidteather/projects/5/views/2) that lists the issues on the repository in a more organized fashion with priorities and statuses.

## Technical Onboarding Information

This section is for new developers who are looking to get started with the project. Here you will find information on the project's architecture, services, and other technical details.

### Project Services Overview

This project is a mono-repo that contains multiple services, which are listed below:
* **website** (/website) | *Nextjs, React, TypeScript*  - This is the frontend application for the project.
* **api** (/backend/api) | *Go* - This is the backend API service for the project. This manages all the data and business logic for the platform.
* **event-listener** (/backend/event-listener) | *Go* - This service listens to Kafka events and processes them accordingly. Currently events are only used for processing and executing event pipelines, ie: sending emails, allowing access to forms, etc.
* **kafka** - This is the Kafka service that is used for event processing.
* **mongo** - This is the MongoDB service that is used for data storage.

### Website Service Overview

The website service is the frontend application for the project. It is built using Next.js, React, and TypeScript. The website is responsible for providing a user interface for managing hackathon events, applicants, and other related data.

#### Important Features
* **Form Logic** - If you're looking to modify any of the form rendering or creation logic you'll want to look at the `components/Form` directory. It has `FormBuilder` which is responsible for taking in a form structure and rendering it. `components/Form/Creator/FormCreator` is responsible for creating new forms and editing existing forms.
* **Event Management Dashboard** - These are all located in the `components/Events/AdminDashboard/Tabs` directory and are responsible for creating, managing, deleting: forms, email templates, pipelines, and anything else on the side bar in the admin dashboard.
* **User Authentication** - We route all of our requests through the `services/AxiosInterceptor.ts` file through the `api` export. This manages adding our JWT token to all requests and logging the user out if the token is invalid. It also will initiate a toast message if the API request fails with the error message returned from the API.
* **Documentation** - The markdown for the documentation is located at `website/docs` and is rendered using `remark` and `rehype` to parse the markdown and render it as HTML. If you want to modify the styling of the documentation you can do so in the `components/Docs` directory. If you want to change how the markdown is rendered you can do so in the `website/lib/markdown.ts` file.

#### File Structure

```
/website
   /public
   /src
      /components
         /Events
            /AdminDashboard (Admin dashboard for managing events)
               /Tabs
                  /Forms
                  /Pipelines
                  /EmailTemplates
                  /...
         /Form (Form rendering and creation logic)
            /Creator
               /FormCreator
         /Toast (Toast messages for API requests and other user alerts)
         /User
            UserSettings.tsx (User settings page)
      /pages (Next.js pages)
         /docs (Documentation pages)
         /events (Event pages)
         /user (User pages)
         index.tsx (Homepage)
         ...
```

### Backend Services Overview

This section provides an overview of the backend services for this project.

#### API Service

The API service is the backend application for the project. It is built using Go and is responsible for managing all the data and business logic for the platform.

##### File Structure

```
/backend
   /api
      /cmd
         main.go (Main entry point for the API service)
      /internal
         /middlewares (Middleware for handling requests)
         /routes (API routes)
            /auth (Authentication logic)
            /emails (Email Tempalte logic)
            /events (Event logic)
            /forms (Form logic)
            ...
```

#### Event Listener

This service listens to Kafka events and processes them accordingly. Currently events are only used for processing and executing event pipelines, ie: sending emails, allowing access to forms, etc.

##### File Structure

```
/backend
   /event-listener
      /cmd
         main.go (Main entry point for the event listener service)
      /internal
         /handlers (Handle executing event pipelines different actions)
         ...
```

#### Shared Modules

There are some shared modules that are used by both the API and the event listener. These are located in the `/backend/shared` directory.

##### File Structure

```
/backend
   /shared
      /kafka (Kafka helper methods)
      /models (Shared models for mainly representing mongo documents)
      /mongodb (MongoDB helper methods)
      /utils (Shared utility methods)
```

### Kafka Service Overview

Kafka is used here to process events like sending emails, allowing access to forms, etc. The Kafka service is used for event processing.

### MongoDB Service Overview

MongoDB is our database of choice, and it is used for data storage.


Thank you for contributing to ApplicantAtlas and helping us make managing hackathon events easier and more efficient!