package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

func (repo *repo) getChildImages(ctx context.Context, video_id string) ([]types.ChildImage, error) {
	query := `SELECT i.id, i.title, i.description, i.image_url, i.file_size, i.format, 
				i.width, i.height, i.created_at, i.updated_at,
				fi.id AS fabric_image_id, fi.time, fi.duration as fabric_image_duration, fi.locked,
				fi.hidden, fi.track, fi.properties, fi.created_at AS fabric_image_created_at, 
				fi.updated_at AS fabric_image_updated_at
				FROM child_images i INNER JOIN fabric_images fv ON i.id = fi.image_id WHERE parent_video_id = $1`

	rows, err := repo.db.QueryContext(ctx, query, video_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []types.ChildImage

	for rows.Next() {
		i := &types.ChildImage{}
		var (
			fabricImageID         string
			fabricImageTime       float64
			fabricImageDuration   float64
			fabricImageLocked     bool
			fabricImageHidden     bool
			fabricImageTrack      int
			fabricImageProperties []byte //
			fabricImageCreatedAt  time.Time
			fabricImageUpdatedAt  time.Time
		)
		err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.ImageURL,
			&i.FileSize,
			&i.Format,
			&i.Width,
			&i.Height,
			&i.FileSize,
			&i.Format,
			&i.CreatedAt,
			&i.UpdatedAt,
			&fabricImageID,
			&fabricImageTime,
			&fabricImageDuration,
			&fabricImageLocked,
			&fabricImageHidden,
			&fabricImageTrack,
			&fabricImageProperties,
			&fabricImageCreatedAt,
			&fabricImageUpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Unmarshal properties into a map
		properties := make(map[string]interface{})
		if err := json.Unmarshal(fabricImageProperties, &properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal fabric child images properties: %v", err)
		}
		i.FabricImage = types.FabricImage{
			ID:         fabricImageID,
			Time:       fabricImageTime,
			Duration:   fabricImageDuration,
			Locked:     fabricImageLocked,
			Hidden:     fabricImageHidden,
			Track:      fabricImageTrack,
			Properties: properties,
			CreatedAt:  fabricImageCreatedAt,
			UpdatedAt:  fabricImageUpdatedAt,
		}

		images = append(images, *i)
	}

	return images, nil
}

func SaveChildImage(ctx context.Context, tx *sql.Tx, image types.ChildImage) error {

	imageQuery := `
             INSERT INTO child_images (id, parent_video_id, title, description, 
			 			image_url, file_size, format, width, height, updated_at, created_at) 
        	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        	ON CONFLICT (id) 
        	DO UPDATE 
        	SET 
				title = EXCLUDED.title,
    	        description = EXCLUDED.description,
				image_url = EXCLUDED.image_url,
        	    file_size = EXCLUDED.file_size,
				format = EXCLUDED.format,
				width = EXCLUDED.width,
            	height = EXCLUDED.height,
	            updated_at = EXCLUDED.updated_at;
        `
	_, err := tx.ExecContext(ctx, imageQuery,
		image.ID, image.ParentVideoID, image.Title, image.Description, image.ImageURL,
		image.FileSize, image.Format, image.Width, image.Height, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update child image: %w", err)
	}

	// TODO: Add unique constraint on the image_id
	fabricImageQuery := `
		INSERT INTO fabric_images (id, image_id, time, duration, locked, hidden, track, properties, updated_at, created_at) 
        	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        	ON CONFLICT (image_id) 
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

	_, err = tx.ExecContext(ctx, fabricImageQuery,
		image.FabricImage.ID, image.ID, image.FabricImage.Time, image.FabricImage.Duration,
		image.FabricImage.Locked, image.FabricImage.Hidden, image.FabricImage.Track,
		image.FabricImage.Properties, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update child image: %w", err)
	}
	return nil
}

func (repo *repo) CreateChildImage(ctx context.Context, image *types.ChildImage, parentVideoId string) error {
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start database transaction: %w", err)
	}
	if err = SaveChildImage(ctx, tx, *image); err != nil {
		return err
	}
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit database transaction: %w", err)
	}

	cacheKey := fmt.Sprintf("videos:%s", parentVideoId)
	data, err := fetchFromCache[types.VideoGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		return fmt.Errorf("failed to get child image from cache: %w", err)
	}
	if data.ChildImages != nil {
		data.ChildImages = append(data.ChildImages, *image)
	} else {
		data.ChildImages = []types.ChildImage{*image}
	}
	if err = storeToCache(ctx, repo.redis, *data, cacheKey); err != nil {
		return fmt.Errorf("failed to save child image to cache: %w", err)
	}
	return nil
}
