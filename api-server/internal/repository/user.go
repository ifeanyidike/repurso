package repository

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

// type UserRepo interface {
// 	FindUserByAuth0ID(auth0ID string) (*types.User, error)
// 	CreateUser(user *types.User)  error
// }

// type userRepo struct {
//     db *sql.DB
// }

// func NewUserRepository(db *sql.DB) UserRepo {
//     return &userRepo{
// 		db: db,
// 	}
// }

func (c *repo) FindUserByAuth0ID(ctx context.Context, auth0ID string) (*types.User, error) {
	user := &types.User{}
	err := c.db.QueryRowContext(ctx, "SELECT id, auth0_id, email, name, picture, email_verified, created_at FROM users WHERE auth0_id = $1", auth0ID).
		Scan(&user.ID, &user.Auth0ID, &user.Email, &user.Name, &user.Picture, &user.EmailVerified, &user.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (c *repo) CreateUser(ctx context.Context, auth0_id, email, name, picture string, email_verified bool) error {
	user := &types.User{
		Auth0ID:       auth0_id,
		Email:         email,
		Name:          name,
		Picture:       picture,
		EmailVerified: email_verified,
		CreatedAt:     time.Now(),
	}
	_, err := c.db.ExecContext(ctx, "INSERT INTO users (auth0_id, email, name, picture, email_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
		user.Auth0ID, user.Email, user.Name, user.Picture, user.EmailVerified, user.CreatedAt)
	return err
}

func (repo *repo) CreateProject(ctx context.Context, params types.ProjectInsertParams) (string, error) {
	var id string

	user, err := repo.FindUserByAuth0ID(ctx, params.UserID)
	if err != nil {
		log.Println("error:", err)
		return "", err
	}
	if user == nil {
		return "", fmt.Errorf("user not found")
	}

	query := `
	    INSERT INTO projects (user_id, title, description, category, due_date)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`

	err = repo.db.QueryRowContext(ctx, query,
		user.ID,
		params.Title,
		params.Description,
		params.Category,
		params.DueDate).
		Scan(&id)

	if err != nil {
		return "", err
	}

	cacheKey := fmt.Sprintf("project:%s", id)
	storeToCache(ctx, repo.redis, params, cacheKey)

	return id, nil
}

func (repo *repo) GetProjects(ctx context.Context, userID string) (*[]types.ProjectGetParams, error) {
	cacheKey := fmt.Sprintf("projects:%s", userID)
	data, err := fetchFromCache[[]types.ProjectGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		log.Println("Got nil data and err,", err)
		return nil, err
	}
	if data != nil && len(*data) > 0 {
		log.Println("Got nil data", len(*data))
		return data, nil
	}

	query := `
	    SELECT 
			id, user_id, title, description, category, due_date, created_at, updated_at
		FROM projects
		WHERE user_id = (
		    SELECT id FROM users WHERE auth0_id = $1
		)	
		`

	rows, err := repo.db.QueryContext(ctx, query, userID)
	if err != nil {
		log.Println("Error fetching projects", err)
		return nil, err
	}
	defer rows.Close()

	var projects []types.ProjectGetParams
	for rows.Next() {
		var project types.ProjectGetParams
		err := rows.Scan(
			&project.ID,
			&project.UserID,
			&project.Title,
			&project.Description,
			&project.Category,
			&project.DueDate,
			&project.CreatedAt,
			&project.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}
	storeToCache(ctx, repo.redis, projects, cacheKey)
	log.Println("projects", projects)
	return &projects, nil
}
