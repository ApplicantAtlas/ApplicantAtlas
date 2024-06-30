# Use an official Go runtime as a parent image
FROM golang:1.21.5-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

# Download any necessary dependencies
RUN go mod download

# Build the binary
RUN go build -o api ./cmd/main.go

# Command to run the binary
CMD ["./api"]
