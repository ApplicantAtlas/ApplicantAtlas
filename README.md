# ApplicantAtlas
A platform made for managing Hackathon applicants &amp; RSVPs and other communications.


**DOCS: WIP**

These are the steps to get the entire project up and running.
First, spin up all the docker images.
```sudo docker compose up kafka mongo zookeeper```

To set up the api service, open up a sepearte terminal, cd into backend/api and run the following command.
```
MONGO_URL=localhost:27017 MONGO_USER=admin MONGO_PASSWORD=admin MONGO_DB=app MONGO_AUTH_SOURCE=admin CORS_ALLOW_ORIGINS="*" JWT_SECRET_TOKEN="testtesttesttest" KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go
```

To set up the kafka event listener service, go to a seperate terminal, cd into backend/event-listener, and run the following command.
```KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go```
If this doesn't work, then run the same command from the api service.

For the frontend, make sure that you have Node version >= 21, otherwise Next.JS may run into issues.
All you need to do is cd into the frontend directory, make sure everything is installed with `npm i`, and start up the dev server using `npm run dev`.
```cd frontend && npm i && npm run dev```
