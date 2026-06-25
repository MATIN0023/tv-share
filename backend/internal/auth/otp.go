package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

// HashAlgorithm documents the password hashing used by the repository layer.
const HashAlgorithm = "bcrypt (golang.org/x/crypto/bcrypt, DefaultCost=10)"

// GenerateOTPCode returns a cryptographically random 5-digit code.
func GenerateOTPCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(100000))
	if err != nil {
		return "", fmt.Errorf("generate otp: %w", err)
	}
	return fmt.Sprintf("%05d", n.Int64()), nil
}
