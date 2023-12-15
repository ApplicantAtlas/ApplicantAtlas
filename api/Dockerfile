# Use an official Go runtime as a parent image
FROM golang:1.16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

# Download any necessary dependencies
RUN go mod download

# Build the binary
RUN go build -o myapp ./cmd/main.go

# Command to run the binary
CMD ["./myapp"]
