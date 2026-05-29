package repository

import (
	"watch-party/internal/models"
	"watch-party/internal/util"

	"golang.org/x/crypto/bcrypt"
)

func (r *Repository) ListUsers() ([]models.User, error) {
	rows, err := r.db.Query(`
		SELECT id, username, display_name, avatar_url FROM users ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Username, &u.DisplayName, &u.AvatarURL); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	if users == nil {
		users = []models.User{}
	}
	return users, nil
}

func (r *Repository) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (r *Repository) CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func (r *Repository) CreateUser(id, username, password, displayName string) error {
	hash, err := r.HashPassword(password)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(
		`INSERT INTO users (id, username, password_hash, display_name, email, family_name, birthday, gender, phone, country, city, bio)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id, username, hash, displayName, "", "", "", "", "", "", "", "",
	)
	return err
}

func (r *Repository) GetUserByUsername(username string) (*models.User, error) {
	row := r.db.QueryRow(`
		SELECT id, username, password_hash, display_name, email, family_name, birthday, gender, phone, country, city, bio,
		       COALESCE(avatar_url, '') as avatar_url,
		       created_at
		FROM users WHERE username = ?
	`, username)
	u := &models.User{}
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.DisplayName, &u.Email, &u.FamilyName, &u.Birthday, &u.Gender, &u.Phone, &u.Country, &u.City, &u.Bio, &u.AvatarURL, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *Repository) GetUserByID(id string) (*models.User, error) {
	row := r.db.QueryRow(`
		SELECT id, username, password_hash, display_name, email, family_name, birthday, gender, phone, country, city, bio,
		       COALESCE(avatar_url, '') as avatar_url,
		       created_at
		FROM users WHERE id = ?
	`, id)
	u := &models.User{}
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.DisplayName, &u.Email, &u.FamilyName, &u.Birthday, &u.Gender, &u.Phone, &u.Country, &u.City, &u.Bio, &u.AvatarURL, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *Repository) UpdateUserProfile(id, displayName, avatarURL, email, familyName, birthday, gender, phone, country, city, bio string) error {
	_, err := r.db.Exec(
		`UPDATE users SET display_name = ?, avatar_url = ?, email = ?, family_name = ?, birthday = ?, gender = ?, phone = ?, country = ?, city = ?, bio = ? WHERE id = ?`,
		displayName, avatarURL, email, familyName, birthday, gender, phone, country, city, bio, id,
	)
	return err
}

func (r *Repository) EnsureDefaultUser() error {
	if _, err := r.GetUserByUsername("admin"); err == nil {
		return nil
	}
	id := util.GenerateID()
	return r.CreateUser(id, "admin", "admin123", "Admin User")
}
