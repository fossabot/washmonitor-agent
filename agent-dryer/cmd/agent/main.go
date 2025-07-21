package main

import (
	"os"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}

	app := fiber.New()
	app.Use(cors.New())

	app.Get("/status", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Scheduled tasks
	c := cron.New()
	c.AddFunc("@every 5m", func() {
		// Example: Access env var
		// myVar := os.Getenv("MY_ENV_VAR")
		// _ = myVar // use as needed
	})
	c.Start()

	app.Listen(":3000")
}
