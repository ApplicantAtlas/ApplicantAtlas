# ApplicantAtlas
A platform made for managing Hackathon applicants &amp; RSVPs and other communications.


**DOCS: WIP**

backend, cd backend
```
MONGO_URL=localhost:27017 MONGO_USER=admin MONGO_PASSWORD=admin MONGO_DB=app MONGO_AUTH_SOURCE=admin CORS_ALLOW_ORIGINS="*" JWT_SECRET_TOKEN="testtesttesttest" KAFKA_BROKER_URL=localhost:9092 go run cmd/main.go
```

frontend is just
```cd frontend && npm i && npm run dev```

and also 
```docker compose up mongo```