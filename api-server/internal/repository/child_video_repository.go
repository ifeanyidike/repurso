package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

func (repo *repo) getChildVideo(ctx context.Context, video_id string) ([]types.ChildVideo, error) {

	query := `SELECT v.id, v.title, v.description, v.video_url, v.audio_url, v.poster_url,, 
				v.waveform_data_url, v.duration, v.file_size, v.format, 
				v.resolution, v.frame_rate, v.bitrate, v.created_at, v.updated_at,
				fv.id AS fabric_child_video_id, fv.time, fv.duration as fabric_child_video_duration, fv.locked,
				fv.hidden, fv.track, fv.properties, fv.created_at AS fabric_child_video_created_at, 
				fv.updated_at AS fabric_child_video_updated_at
				FROM videos v INNER JOIN fabric_child_videos fv ON v.id = fv.video_id WHERE parent_video_id = $1`

	rows, err := repo.db.QueryContext(ctx, query, video_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []types.ChildVideo

	for rows.Next() {
		video := &types.ChildVideo{}
		var (
			fabricVideoID         string
			fabricVideoTime       float64
			fabricVideoDuration   float64
			fabricVideoLocked     bool
			fabricVideoHidden     bool
			fabricVideoTrack      int
			fabricVideoProperties []byte //
			fabricVideoCreatedAt  time.Time
			fabricVideoUpdatedAt  time.Time
		)
		err := rows.Scan(
			&video.ID,
			&video.Title,
			&video.Description,
			&video.VideoURL,
			&video.AudioURL,
			&video.PosterURL,
			&video.WaveformDataURL,
			&video.Duration,
			&video.FileSize,
			&video.Format,
			&video.Resolution,
			&video.FrameRate,
			&video.Bitrate,
			&video.CreatedAt,
			&video.UpdatedAt,
			&fabricVideoID,
			&fabricVideoTime,
			&fabricVideoDuration,
			&fabricVideoLocked,
			&fabricVideoHidden,
			&fabricVideoTrack,
			&fabricVideoProperties,
			&fabricVideoCreatedAt,
			&fabricVideoUpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Unmarshal properties into a map
		properties := make(map[string]interface{})
		if err := json.Unmarshal(fabricVideoProperties, &properties); err != nil {
			return nil, fmt.Errorf("failed to unmarshal fabric child video properties: %v", err)
		}
		video.FabricChildVideo = types.FabricChildVideo{
			ID:         fabricVideoID,
			VideoID:    video_id,
			Time:       fabricVideoTime,
			Duration:   fabricVideoDuration,
			Locked:     fabricVideoLocked,
			Hidden:     fabricVideoHidden,
			Track:      fabricVideoTrack,
			Properties: properties,
			CreatedAt:  fabricVideoCreatedAt,
			UpdatedAt:  fabricVideoUpdatedAt,
		}

		videos = append(videos, *video)
	}

	return videos, nil
}

func SaveChildVideo(ctx context.Context, tx *sql.Tx, video types.ChildVideo) error {
	// TODO: Check if  video file is blob. If so, save to s3 and generate url then insert the url to db

	videoQuery := `
             INSERT INTO child_videos (id, parent_video_id, title, description, video_url, audio_url, 
			 			poster_url, waveform_data_url, duration, file_size, format, resolution,
						frame_rate, bitrate, updated_at, created_at) 
        	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        	ON CONFLICT (id) 
        	DO UPDATE 
        	SET 
				title = EXCLUDED.title,
    	        description = EXCLUDED.description,
				video_url = EXCLUDED.video_url,
        	    audio_url = EXCLUDED.audio_url,
				poster_url = EXCLUDED.poster_url,
				waveform_data_url = EXCLUDED.waveform_data_url,
            	duration = EXCLUDED.duration,
	            file_size = EXCLUDED.file_size,
    	        format = EXCLUDED.format,
        	    resolution = EXCLUDED.resolution,
            	frame_rate = EXCLUDED.frame_rate,
				bitrate = EXCLUDED.bitrate,
            	updated_at = EXCLUDED.updated_at;
        `
	_, err := tx.ExecContext(ctx, videoQuery,
		video.ID, video.ParentVideoID, video.Title, video.Description, video.VideoURL, video.AudioURL,
		video.PosterURL, video.WaveformDataURL, video.Duration,
		video.FileSize, video.Format, video.Resolution,
		video.FrameRate, video.Bitrate, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update child video: %w", err)
	}

	// TODO: Add unique constraint on the video_id
	fabricVideoQuery := `
		INSERT INTO fabric_child_videos (id, video_id, time, duration, locked, hidden, track, properties, updated_at, created_at) 
        	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        	ON CONFLICT (video_id) 
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

	_, err = tx.ExecContext(ctx, fabricVideoQuery,
		video.FabricChildVideo.ID, video.ID, video.FabricChildVideo.Time, video.FabricChildVideo.Duration,
		video.FabricChildVideo.Locked, video.FabricChildVideo.Hidden, video.FabricChildVideo.Track,
		video.FabricChildVideo.Properties, time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update child video: %w", err)
	}
	return nil
}

func (repo *repo) CreateChildVideo(ctx context.Context, video *types.ChildVideo, parentVideoId string) error {
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start database transaction: %w", err)
	}
	if err = SaveChildVideo(ctx, tx, *video); err != nil {
		return err
	}
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit database transaction: %w", err)
	}

	cacheKey := fmt.Sprintf("videos:%s", parentVideoId)
	data, err := fetchFromCache[types.VideoGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		return fmt.Errorf("failed to get child video from cache: %w", err)
	}
	if data.ChildVideos != nil {
		data.ChildVideos = append(data.ChildVideos, *video)
	} else {
		data.ChildVideos = []types.ChildVideo{*video}
	}
	if err = storeToCache(ctx, repo.redis, *data, cacheKey); err != nil {
		return fmt.Errorf("failed to save child video to cache: %w", err)
	}
	return nil
}
