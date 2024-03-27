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

#### Using The Dev Container

We've created a dev container that has all the required dependencies and tools to get started with this project. This is the easiest way to get started developing on the project so this is a great place to start.

If you later on decide you want to run the project without the dev container you can do so by following the instructions in the "Running Without a Dev Container" section.

##### **With GitHub Codespaces**

The easiest way to just get set up with the project and start developing is to use a GitHub Codespace. This is a cloud based development environment so you can just create a codespace and start developing without having to install anything on your local machine.

[**Create a Codespace**](https://github.com/codespaces/new?repo=724855356) then click create, and after a few minutes of basic setup it should be ready to go.

**Note:** GitHub Codespaces does cost money to use, but you get 50 hours a month for free as of the time of writing this. So if you're just doing some light development you should be able to use it for free.

<!--
*psst: if you're new to GitHub Codespaces feel free to check out my [LinkedIn Learning course](https://www.linkedin.com/learning-login/share?forceAccount=false&redirect=https%3A%2F%2Fwww.linkedin.com%2Flearning%2Fgithub-codespaces-for-students%3Ftrk%3Dshare_ent_url%26shareId%3DTA%252FPxpwASCePFoBLiSfvWw%253D%253D) on it you should be able to get free access [through my LinkedIn post](https://www.linkedin.com/posts/davidteather_linkedinlearning-education-technology-activity-7069391759281147905-o4yZ?utm_source=share&utm_medium=member_desktop)*
-->

##### **In Visual Studio Code**

If you're using Visual Studio Code, you can use the dev container to get started with the project. To do this, follow the steps below:

1. **Install the Remote - Containers Extension**
   If you haven't already, install the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for Visual Studio Code.
2. **Open the Project in a Dev Container**
   Open the project in Visual Studio Code and click on the green "Open a Remote Window" button in the bottom left corner of the window. Then select "Reopen in Container" from the dropdown menu. This will open the project in a dev container with all the required dependencies and tools.

This should open the project in a dev container with all the required dependencies and tools to get started with the project. Although the way it handles running multiple commands is different so you might find it more convienent to development to cancel the running commands, then run them separately following the instructions below. [Here's an issue about the difference](https://github.com/microsoft/vscode-remote-release/issues/9634)

#### Running Without a Dev Container

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

## Getting Help

If you have any questions or need assistance, we have these resources available:
1. **GitHub Issues** - If you encounter any bugs or issues, please search for existing issues then open a GitHub issue on the repository if you can't find a solution.
2. **GitHub Discussions** - For general questions or discussions, you can use the GitHub Discussions feature.
3. **Discord Server** - Join our [Discord server](https://discord.gg/yyPhbfma6f) to chat with other contributors and maintainers.
4. **Email** - You can reach out to me directly through any of the contact methods on my [GitHub profile](https://github.com/davidteather)