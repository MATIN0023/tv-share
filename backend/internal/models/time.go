package models

import "time"

// NowUTC returns the current time in UTC. Use when setting timestamp fields on MongoDB documents.
func NowUTC() time.Time {
	return time.Now().UTC()
}
