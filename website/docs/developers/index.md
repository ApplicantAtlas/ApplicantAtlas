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

For ease of development, we recommend not running everything in docker since it's easier to debug and develop and restart the component you're working on without having to restart and rebuild the entire stack. So here's what we personally do:

1. **Start Docker Services**
   Spin up all the required Docker images for the project's infrastructure components.
   ```bash
   docker compose up kafka mongo zookeeper
   ```

2. **API Service Setup**
   Open a separate terminal, navigate to the `backend/api` directory, and run the following command to start the API service:
   ```bash
   MONGO_URL=localhost:27017 MONGO_USER=admin MONGO_PASSWORD=admin MONGO_DB=app MONGO_AUTH_SOURCE=admin CORS_ALLOW_ORIGINS="*" JWT_SECRET_TOKEN="testtesttesttest" KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go
   ```

3. **Kafka Event Listener Service**
   In a new terminal, go to the `backend/event-listener` folder and execute the command below to launch the Kafka event listener service:
   ```bash
   KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go
   ```
   If you encounter any issues, try running the command from the API service directory.

4. **Frontend Development**
   Ensure you have the correct Node.js version (>= 21) to avoid potential issues with Next.JS. Navigate to the `frontend` directory, install all dependencies with `npm i`, and start the development server using:
   ```bash
   cd frontend && npm i && npm run dev
   ```

## Contributing
We welcome contributions of all forms, from bug fixes to feature additions, and even documentation updates. Please refer to our contribution guidelines for more information on how to submit your contributions effectively.

If you're not sure where to start, if you go to the issues tab on the GitHub repository, you can find issues that are labeled as "good first issue" which are perfect for new contributors to get started with.

If you're looking to find something to contribute to we have a [GitHub project board](https://github.com/users/davidteather/projects/5/views/2) that lists the issues on the repository in a more organized fashion with priorities and statuses.

## Versioning
We use semantic versioning for our project releases. Ensure you check our versioning policy and the current project version before making contributions that might affect functionality or compatibility.

## Need Help?
If you have any questions or run into issues while setting up the project or during development, please reach out to our community support channels or file an issue on our GitHub repository.

Thank you for contributing to ApplicantAtlas and helping us make managing hackathon events easier and more efficient!