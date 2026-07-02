package ratelimit

import (
	"testing"
	"time"
)

func TestLimiter_AllowUnderLimit(t *testing.T) {
	l := New(3, time.Minute)
	for i := 0; i < 3; i++ {
		if !l.Allow("user1") {
			t.Fatalf("request %d should be allowed", i+1)
		}
	}
}

func TestLimiter_BlockOverLimit(t *testing.T) {
	l := New(2, time.Minute)
	if !l.Allow("ip") || !l.Allow("ip") {
		t.Fatal("first two should pass")
	}
	if l.Allow("ip") {
		t.Error("third request should be blocked")
	}
}

func TestLimiter_EmptyKeyRejected(t *testing.T) {
	l := New(10, time.Minute)
	if l.Allow("") {
		t.Error("empty key should not be allowed")
	}
}

func TestLimiter_IndependentKeys(t *testing.T) {
	l := New(1, time.Minute)
	if !l.Allow("a") {
		t.Fatal("a first")
	}
	if l.Allow("a") {
		t.Error("a second blocked")
	}
	if !l.Allow("b") {
		t.Error("b should have its own bucket")
	}
}

func TestLimiter_WindowExpiry(t *testing.T) {
	l := New(1, 20*time.Millisecond)
	if !l.Allow("k") {
		t.Fatal("first allow")
	}
	if l.Allow("k") {
		t.Error("should block immediately")
	}
	time.Sleep(25 * time.Millisecond)
	if !l.Allow("k") {
		t.Error("should allow after window passes")
	}
}
