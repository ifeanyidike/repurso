package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

func (repo *repo) getLowerThird(ctx context.Context, video_id string) ([]types.LowerThird, error) {
	query := `SELECT id, time, duration, locked, hidden, track, properties, created_at, updated_at FROM fabric_texts WHERE parent_video_id = $1`

	rows, err := repo.db.QueryContext(ctx, query, video_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var texts []types.LowerThird

	for rows.Next() {
		t := &types.LowerThird{}
		var textProperties []byte

		err := rows.Scan(
			&t.ID,
			&t.Time,
			&t.Duration,
			&t.Locked,
			&t.Hidden,
			&t.Track,
			&textProperties,
			&t.CreatedAt,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Unmarshal properties into a map
		if err := json.Unmarshal(textProperties, &t.Properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal fabric text properties: %v", err)
		}

		texts = append(texts, *t)
	}

	return texts, nil
}

func SaveLowerThird(ctx context.Context, tx *sql.Tx, lowerThird types.LowerThird) error {
	fabricText := `
		INSERT INTO fabric_texts (id, parent_video_id, time, duration, locked, hidden, track, properties, updated_at, created_at) 
        	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        	ON CONFLICT (id) 
        	DO UPDATE 
        	SET 
				time = EXCLUDED.time,
    	        duration = EXCLUDED.duration,
				locked = EXCLUDED.locked,
        	    hidden = EXCLUDED.hidden,
				track = EXCLUDED.track,
				properties = EXCLUDED.properties,
            	updated_at = EXCLUDED.updated_at;
	`

	_, err := tx.ExecContext(ctx, fabricText,
		lowerThird.ID, lowerThird.ParentVideoID, lowerThird.Time, lowerThird.Duration,
		lowerThird.Locked, lowerThird.Hidden, lowerThird.Track,
		lowerThird.Properties, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update lower third: %w", err)
	}
	return nil
}
