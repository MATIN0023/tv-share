package repository

import "testing"

func TestHashPasswordAndCheck(t *testing.T) {
	r := &Repository{}
	password := "SecurePass123!"

	hash, err := r.HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}
	if hash == "" || hash == password {
		t.Error("hash should be non-empty and differ from plaintext")
	}
	if !r.CheckPassword(password, hash) {
		t.Error("CheckPassword should succeed for correct password")
	}
	if r.CheckPassword("wrong", hash) {
		t.Error("CheckPassword should fail for wrong password")
	}
}

func TestCheckPassword_EmptyHash(t *testing.T) {
	r := &Repository{}
	if r.CheckPassword("anything", "") {
		t.Error("empty hash should never match")
	}
}
