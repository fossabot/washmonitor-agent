package config

import (
	"log"
	"os"
)

// SetDefaultEnv sets an environment variable to a default value if it is not already set.
func SetDefaultEnv(key, defaultValue string) {
	if os.Getenv(key) == "" {
		os.Setenv(key, defaultValue)
	}
}

// WarnIfDefaultUsed prints a warning if the environment variable is set to its default value.
func WarnIfDefaultUsed(key, defaultValue string) {
	if os.Getenv(key) == defaultValue {
		log.Printf("Warning: environment variable %s is not set. Using default value '%s'.", key, defaultValue)
	}
}
