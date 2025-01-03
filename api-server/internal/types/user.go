package types

import "time"

type User struct {
	ID            int       `json:"id"`
	Auth0ID       string    `json:"auth0_id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Picture       string    `json:"picture"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
}

type ProjectInsertParams struct {
	UserID      string
	Title       string
	Description string
}

type ProjectGetParams struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
