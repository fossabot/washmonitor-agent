FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

WORKDIR /app/cmd/agent
RUN CGO_ENABLED=0 GOOS=linux go build -o /agent

# Stage 2: imagen final
FROM scratch

COPY --from=builder /agent /agent

EXPOSE 8001

ENTRYPOINT ["/agent"]