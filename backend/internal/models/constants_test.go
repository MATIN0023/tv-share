package models

import "testing"

func TestIsAdminRole(t *testing.T) {
	admins := []string{RoleAdmin, RoleSuperAdmin}
	for _, r := range admins {
		if !IsAdminRole(r) {
			t.Errorf("IsAdminRole(%q) = false", r)
		}
	}
	nonAdmins := []string{RoleUser, "", "moderator", "ADMIN"}
	for _, r := range nonAdmins {
		if IsAdminRole(r) {
			t.Errorf("IsAdminRole(%q) = true, want false", r)
		}
	}
}
