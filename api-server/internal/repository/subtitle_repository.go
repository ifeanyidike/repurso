package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

func (repo *repo) getFabricSubtitle(ctx context.Context, video_id string) (*types.FabricSubtitle, error) {
	query := `SELECT id, time, duration, locked, hidden, track, properties, created_at, updated_at FROM fabric_subtitles WHERE parent_video_id = $1`

	t := &types.FabricSubtitle{}
	var subtitleProperties []byte

	err := repo.db.QueryRowContext(ctx, query, video_id).Scan(
		&t.ID,
		&t.Time,
		&t.Duration,
		&t.Locked,
		&t.Hidden,
		&t.Track,
		&subtitleProperties,
		&t.CreatedAt,
		&t.CreatedAt,
		&t.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(subtitleProperties, &t.Properties); err != nil {
		return nil, fmt.Errorf("failed to unmarshal fabric text properties: %v", err)
	}

	return t, nil
}

func SaveSubtitle(ctx context.Context, tx *sql.Tx, subtitle types.FabricSubtitle) error {
	fabricSubtitle := `
		INSERT INTO fabric_subtitles (id, parent_video_id, time, duration, locked, hidden, track, properties, updated_at, created_at) 
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

	_, err := tx.ExecContext(ctx, fabricSubtitle,
		subtitle.ID, subtitle.ParentVideoID, subtitle.Time, subtitle.Duration,
		subtitle.Locked, subtitle.Hidden, subtitle.Track,
		subtitle.Properties, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update fabric subtitle: %w", err)
	}
	return nil
}
