# Stage 1: build
FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .


RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

# Stage 2: imagen final
FROM scratch

COPY --from=builder /server /server

EXPOSE 8001

CMD ["/server"]