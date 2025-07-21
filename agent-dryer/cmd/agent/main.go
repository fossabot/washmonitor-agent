package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
)

// StateSubmission holds a state and its timestamp
var (
	stateHistory []StateSubmission
	stateMutex   sync.Mutex
)

type StateSubmission struct {
	State     string // 'vibrating' or 'stationary'
	Timestamp time.Time
}

func main() {

	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}

	API_SERVER_URL := os.Getenv("API_SERVER_URL")
	if API_SERVER_URL == "" {
		panic("API_SERVER_URL environment variable is not set")
	}

	app := fiber.New()
	app.Use(cors.New())

	app.Get("/status", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "ok",
		})
	})

	app.Post("/submitStatus", func(c *fiber.Ctx) error {
		var req struct {
			State string `json:"state"`
		}
		if req.State != "vibrating" && req.State != "stationary" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "State must be 'vibrating' or 'stationary'"})
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
		}
		stateMutex.Lock()
		stateHistory = append(stateHistory, StateSubmission{State: req.State, Timestamp: time.Now()})
		stateMutex.Unlock()
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "State submitted"})
	})

	// Scheduled tasks
	c := cron.New()
	c.AddFunc("@every 5s", func() {
		// Get agent status from API server

		resp, err := http.Get(API_SERVER_URL + "/dryer/getAgentStatus")
		if err != nil {
			log.Printf("Failed to get agent status: %v", err)
			return
		}
		defer resp.Body.Close()
		// You can process resp.Body here if needed

		// Read agent status from response
		var agentStatus struct {
			Status string `json:"status"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&agentStatus); err != nil {
			log.Printf("Failed to decode agent status response: %v", err)
			return
		}

		stateMutex.Lock()
		cutoff := time.Now().Add(-5 * time.Minute)
		var recent []StateSubmission
		for _, s := range stateHistory {
			if s.Timestamp.After(cutoff) {
				recent = append(recent, s)
			}
		}
		stateMutex.Unlock()
		if len(recent) > 0 {
			// Check if the earliest submission in recent is at least 5 minutes old
			if recent[0].Timestamp.After(cutoff) {
				log.Println("Insufficient data: state submissions do not cover the last 5 minutes.")
				return
			}
			// Check for gaps between submissions (greater than 15 seconds)
			gapFound := false
			for i := 1; i < len(recent); i++ {
				if recent[i].Timestamp.Sub(recent[i-1].Timestamp) > 15*time.Second {
					gapFound = true
					break
				}
			}
			if gapFound {
				log.Println("Gap detected: state submissions are not consistent within 15 seconds intervals in the last 5 minutes.")
				return
			}
			allStationary := true
			for _, s := range recent {
				if s.State != "stationary" {
					allStationary = false
					break
				}
			}
			if allStationary {
				log.Println("State has remained 'stationary' for the last 5 minutes.")
				// TODO - Notify the user and set the agent status to "idle"
			} else {
				log.Println("State has changed in the last 5 minutes.")
			}
		} else {
			log.Println("No state submissions in the last 5 minutes.")

			// Notify the user that the connection with the submitting device is lost
			// TODO - Notify the user and set the agent status to "idle"
		}
	})
	// Prune old state submissions every 10 minutes
	c.AddFunc("@every 10m", func() {
		stateMutex.Lock()
		cutoff := time.Now().Add(-5 * time.Minute)
		var pruned []StateSubmission
		for _, s := range stateHistory {
			if s.Timestamp.After(cutoff) {
				pruned = append(pruned, s)
			}
		}
		stateHistory = pruned
		stateMutex.Unlock()
		log.Println("Pruned old state submissions, kept:", len(stateHistory))
	})
	c.Start()
	app.Listen(":3000")
}
