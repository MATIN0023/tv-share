package redis

import (
	"context"
	"log"
	"sync"

	goredis "github.com/redis/go-redis/v9"
)

var (
	client *goredis.Client
	once   sync.Once
)

// Connect initializes an optional Redis client. Returns nil when url is empty.
func Connect(url string) *goredis.Client {
	if url == "" {
		log.Println("Redis: REDIS_URL not set — using in-memory fallbacks")
		return nil
	}
	once.Do(func() {
		opts, err := goredis.ParseURL(url)
		if err != nil {
			log.Printf("Redis: invalid REDIS_URL: %v", err)
			return
		}
		client = goredis.NewClient(opts)
		if err := client.Ping(context.Background()).Err(); err != nil {
			log.Printf("Redis: ping failed: %v — continuing without Redis", err)
			client = nil
			return
		}
		log.Println("Redis: connected")
	})
	return client
}

// Client returns the shared Redis client (may be nil).
func Client() *goredis.Client {
	return client
}

// Available reports whether Redis is connected.
func Available() bool {
	return client != nil
}
