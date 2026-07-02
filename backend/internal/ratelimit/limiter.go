package ratelimit

import (
	"sync"
	"time"
)

// Limiter tracks request counts per key within a sliding time window.
type Limiter struct {
	mu      sync.Mutex
	buckets map[string][]time.Time
	max     int
	window  time.Duration
}

func New(max int, window time.Duration) *Limiter {
	return &Limiter{
		buckets: make(map[string][]time.Time),
		max:     max,
		window:  window,
	}
}

// Allow reports whether the key is under the rate limit and records the hit.
func (l *Limiter) Allow(key string) bool {
	if key == "" {
		return false
	}

	now := time.Now()
	cutoff := now.Add(-l.window)

	l.mu.Lock()
	defer l.mu.Unlock()

	times := l.buckets[key]
	filtered := times[:0]
	for _, t := range times {
		if t.After(cutoff) {
			filtered = append(filtered, t)
		}
	}
	if len(filtered) >= l.max {
		l.buckets[key] = filtered
		return false
	}
	filtered = append(filtered, now)
	l.buckets[key] = filtered
	return true
}
