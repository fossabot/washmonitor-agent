package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type AgentState struct {
	Status string `json:"status"`
	User   string `json:"user"`
}

var agentState = AgentState{
	Status: "idle",
	User:   "",
}

func main() {
	app := fiber.New()

	// Permitir CORS para todos los orígenes
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
	}))

	// Endpoint de health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "ok",
		})
	})

	app.Post("/washer/setAgentStatus", func(c *fiber.Ctx) error {
		var body AgentState
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Malformed request",
			})
		}
		if body.Status != "monitor" && body.Status != "idle" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Status must be 'monitor' or 'idle'",
			})
		}
		if body.Status == "monitor" && body.User == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User is required when status is 'monitor'",
			})
		}
		if body.Status == "idle" {
			agentState.Status = "idle"
			agentState.User = ""
		} else {
			agentState.Status = "monitor"
			agentState.User = body.User
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Agent status set successfully",
			"status":  agentState.Status,
			"user":    agentState.User,
		})
	})

	app.Get("/washer/getAgentStatus", func(c *fiber.Ctx) error {
		user := agentState.User
		if agentState.Status == "idle" {
			user = ""
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": agentState.Status,
			"user":   user,
		})
	})


	app.Post("/dryer/setAgentStatus", func(c *fiber.Ctx) error {
		var body AgentState
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Malformed request",
			})
		}
		if body.Status != "monitor" && body.Status != "idle" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Status must be 'monitor' or 'idle'",
			})
		}
		if body.Status == "monitor" && body.User == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User is required when status is 'monitor'",
			})
		}
		if body.Status == "idle" {
			agentState.Status = "idle"
			agentState.User = ""
		} else {
			agentState.Status = "monitor"
			agentState.User = body.User
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Agent status set successfully",
			"status":  agentState.Status,
			"user":    agentState.User,
		})
	})

	app.Get("/dryer/getAgentStatus", func(c *fiber.Ctx) error {
		user := agentState.User
		if agentState.Status == "idle" {
			user = ""
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": agentState.Status,
			"user":   user,
		})
	})

	app.Listen(":8001")
}
