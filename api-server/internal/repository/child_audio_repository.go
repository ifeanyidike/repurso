package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

func (repo *repo) getChildAudio(ctx context.Context, video_id string) ([]types.ChildAudio, error) {
	query := `
	    SELECT id, title, description, audio_url, duration, file_size, time, locked, hidden, 
		track, format, waveform_data_url, volume, created_at, updated_at FROM child_audios WHERE parent_video_id = $1`

	rows, err := repo.db.QueryContext(ctx, query, video_id)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var childAudios []types.ChildAudio
	for rows.Next() {
		a := &types.ChildAudio{}
		err := rows.Scan(&a.ID, &a.Title, &a.Description, &a.AudioURL, &a.Duration, &a.FileSize, &a.Time, &a.Locked, &a.Hidden,
			&a.Track, &a.Format, &a.WaveformDataURL, &a.Volume, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}
		childAudios = append(childAudios, *a)
	}

	return childAudios, nil
}

func SaveChildAudio(ctx context.Context, tx *sql.Tx, audio types.ChildAudio) error {
	// TODO: Check if  audio file is blob. If so, save to s3 and generate url then insert the url to db

	audioQuery := `
             INSERT INTO child_audios (id, parent_video_id, title, description, audio_url, duration, 
                                  file_size, time, locked, hidden, track, 
                                  format, waveform_data_url, volume, updated_at, created_at) 
        	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        	ON CONFLICT (id) 
        	DO UPDATE 
        	SET 
				title = EXCLUDED.title,
    	        description = EXCLUDED.description,
        	    audio_url = EXCLUDED.audio_url,
            	duration = EXCLUDED.duration,
	            file_size = EXCLUDED.file_size,
    	        time = EXCLUDED.time,
        	    locked = EXCLUDED.locked,
            	hidden = EXCLUDED.hidden,
	            track = EXCLUDED.track,
    	        format = EXCLUDED.format,
        	    waveform_data_url = EXCLUDED.waveform_data_url,
            	volume = EXCLUDED.volume,
            	updated_at = EXCLUDED.updated_at;
        `
	_, err := tx.ExecContext(ctx, audioQuery,
		audio.ID, audio.ParentVideoID, audio.Title, audio.Description, audio.AudioURL, audio.Duration,
		audio.FileSize, audio.Time, audio.Locked, audio.Hidden, audio.Track,
		audio.Format, audio.WaveformDataURL, audio.Volume, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update child audio: %w", err)
	}
	return nil
}

func (repo *repo) CreateChildAudio(ctx context.Context, audio *types.ChildAudio, parentVideoId string) error {
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start database transaction: %w", err)
	}
	if err = SaveChildAudio(ctx, tx, *audio); err != nil {
		return err
	}
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit database transaction: %w", err)
	}

	// Add to video redis cache
	cacheKey := fmt.Sprintf("videos:%s", parentVideoId)
	data, err := fetchFromCache[types.VideoGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		return fmt.Errorf("failed to get child audio from cache: %w", err)
	}
	if data.ChildAudios != nil {
		data.ChildAudios = append(data.ChildAudios, *audio)
	} else {
		data.ChildAudios = []types.ChildAudio{*audio}
	}
	if err = storeToCache(ctx, repo.redis, *data, cacheKey); err != nil {
		return fmt.Errorf("failed to save child audio to cache: %w", err)
	}

	return nil
}
