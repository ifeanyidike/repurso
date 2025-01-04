package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/ifeanyidike/improv/internal/types"
)

func (repo *repo) CreateVideo(ctx context.Context, params types.VideoInsertParams) (string, error) {
	var id string
	// Start a database transaction
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return "", err
	}

	// Insert Video
	query := `
	    INSERT INTO videos 
			(
				project_id, 
				title,
				description,
				video_url, 
				audio_url,
				duration, 
				poster_url,
				waveform_data_url, 
				file_size, 
				format, 
				resolution, 
				frame_rate, 
				bitrate
			)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
				returning id
		`
	err = tx.QueryRowContext(ctx, query,
		params.ProjectID,
		params.Title,
		params.Description,
		params.VideoURL,
		params.AudioURL,
		params.Duration,
		params.PosterURL,
		params.WaveformDataURL,
		params.FileSize,
		params.Format,
		params.Resolution,
		params.FrameRate,
		params.Bitrate,
	).Scan(&id)

	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("failed to insert video: %w", err)
	}

	// Insert into fabric_videos
	_, err = tx.ExecContext(ctx, "INSERT INTO fabric_videos(video_id, duration) VALUES ($1, $2)", id, params.Duration)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("failed to insert fabric video: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return "", fmt.Errorf("failed to commit transaction: %w", err)
	}

	cacheKey := fmt.Sprintf("video:%s", id)

	video_data := map[string]interface{}{
		"project_id":        params.ProjectID,
		"title":             params.Title,
		"description":       params.Description,
		"video_url":         params.VideoURL,
		"audio_url":         params.AudioURL,
		"duration":          params.Duration,
		"poster_url":        params.PosterURL,
		"waveform_data_url": params.WaveformDataURL,
		"file_size":         params.FileSize,
		"resolution":        params.Resolution,
		"frame_rate":        params.FrameRate,
		"bitrate":           params.Bitrate,
		"fabric_video": map[string]interface{}{
			"duration": params.Duration,
			"video_id": id,
		},
	}
	storeToCache(ctx, repo.redis, video_data, cacheKey)

	return id, nil
}

func (repo *repo) GetVideos(ctx context.Context, project_id string) (*[]types.VideosGetParams, error) {
	// `
	//     SELECT v.id, v.video_url, v.duration, v.file_size, v.format, v.resolution, v.created_at, v.updated_at,
	// 	    fv.
	// 	FROM videos v LEFT JOIN fabric_videos fv ON v.id = fv.video_id WHERE project_id = $1`

	cacheKey := fmt.Sprintf("videos:%s", project_id)
	data, err := fetchFromCache[[]types.VideosGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		return nil, err
	}
	if data != nil {
		return data, nil
	}

	query := `
	    SELECT 
			id, title, description, video_url, duration, file_size, 
			format, resolution, created_at, updated_at
		FROM videos WHERE project_id = $1`
	rows, err := repo.db.QueryContext(ctx, query, project_id)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	videos := []types.VideosGetParams{}

	for rows.Next() {
		var v types.VideosGetParams
		err := rows.Scan(&v.ID, &v.Title, &v.Description, &v.VideoURL, &v.Duration, &v.FileSize, &v.Format, &v.Resolution, &v.CreatedAt, &v.UpdatedAt)
		if err != nil {
			return nil, err
		}
		videos = append(videos, v)
	}
	storeToCache(ctx, repo.redis, videos, cacheKey)

	return &videos, nil
}

func (repo *repo) GetVideo(ctx context.Context, video_id string) (*types.VideoGetParams, error) {
	// Check autosave cache first
	autosaveKey := fmt.Sprintf("autosave:videos:%s", video_id)
	data, err := fetchFromCache[types.VideoGetParams](ctx, repo.redis, autosaveKey)
	if err == nil && data != nil {
		return data, nil
	}

	cacheKey := fmt.Sprintf("videos:%s", video_id)
	data, err = fetchFromCache[types.VideoGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		return nil, err
	}
	if data != nil {
		return data, nil
	}

	video := &types.VideoGetParams{}
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

	query := `
			SELECT 
				v.id, v.title, v.description, v.video_url, v.audio_url, 
				v.poster_url, v.transcript_url, v.waveform_data_url, 
				v.published_video_url, v.duration, v.file_size, v.format, 
				v.resolution, v.frame_rate, v.bitrate, v.created_at, 
				v.updated_at, fv.id AS fabric_video_id, fv.time, 
				fv.duration as fabric_video_duration, fv.locked, fv.hidden, 
				fv.track, fv.properties, fv.created_at AS fabric_video_created_at, 
				fv.updated_at AS fabric_video_updated_at
			FROM videos v INNER JOIN fabric_videos fv ON v.id = fv.video_id WHERE id = $1`

	err = repo.db.QueryRowContext(ctx, query, video_id).Scan(
		&video.ID,
		&video.Title,
		&video.Description,
		&video.VideoURL,
		&video.AudioURL,
		&video.PosterURL,
		&video.TranscriptUrl,
		&video.WaveformDataURL,
		&video.PublishedURL,
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
	var properties map[string]interface{}
	if err = json.Unmarshal(fabricVideoProperties, &properties); err != nil {
		return nil, fmt.Errorf("failed to unmarshal fabric video properties: %v", err)
	}

	video.FabricVideo = types.FabricVideo{
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
	video.ChildAudios, _ = repo.getChildAudio(ctx, video_id)
	video.ChildVideos, _ = repo.getChildVideo(ctx, video_id)
	video.ChildImages, _ = repo.getChildImages(ctx, video_id)
	video.LowerThird, _ = repo.getLowerThird(ctx, video_id)
	subtitle, _ := repo.getFabricSubtitle(ctx, video_id)
	video.FabricSubtitle = *subtitle

	storeToCache(ctx, repo.redis, video, cacheKey)

	return video, nil
}

func (repo *repo) GetVideoAudio(ctx context.Context, videoId string) (string, error) {
	cacheKey := fmt.Sprintf("videos:%s", videoId)
	data, err := fetchFromCache[types.VideoGetParams](ctx, repo.redis, cacheKey)
	if err == nil && data != nil {
		return data.AudioURL, nil
	}

	audio := ""
	query := `SELECT audio_url FROM videos WHERE id = $1`
	err = repo.db.QueryRowContext(ctx, query, videoId).Scan(&audio)

	if err != nil {
		return "", err
	}

	return audio, nil
}

func (repo *repo) AutoSaveVideo(ctx context.Context, video_id string, updates *types.VideoGetParams) error {
	cacheKey := fmt.Sprintf("autosave:videos:%s", video_id)
	storeToCache(ctx, repo.redis, *updates, cacheKey)
	return nil
}

func (repo *repo) SaveVideoVersion(ctx context.Context, video_id string, video_data *types.VideoGetParams) error {
	jsonData, err := json.Marshal(video_data)
	if err != nil {
		return err
	}

	// Update the published version in Redis
	cacheKey := fmt.Sprintf("videos:%s", video_id)
	if err := repo.redis.Set(ctx, cacheKey, jsonData, 0).Err(); err != nil {
		return fmt.Errorf("failed to save video version in Redis: %w", err)
	}

	// Save the previous version to version history
	versionsKey := fmt.Sprintf("videos:%s:versions", video_id)
	if err := repo.redis.LPush(ctx, versionsKey, jsonData).Err(); err != nil {
		return fmt.Errorf("failed to save video version history in Redis: %w", err)
	}
	// Keep only the last 20 versions in the history
	if err := repo.redis.LTrim(ctx, versionsKey, 0, 19).Err(); err != nil {
		return fmt.Errorf("failed to trim video version history in Redis: %w", err)
	}

	// // Delete the autosave version from Redis
	// autosaveKey := fmt.Sprintf("autosave:videos:%s", video_id)
	// if err := repo.redis.Del(ctx, autosaveKey).Err(); err != nil {
	// 	return fmt.Errorf("failed to delete autosave video version in Redis: %w", err)
	// }

	return nil

}

func (repo *repo) GetCurrentVideo(ctx context.Context, video_id string) (*types.VideoGetParams, error) {
	return fetchFromCache[types.VideoGetParams](ctx, repo.redis, fmt.Sprintf("videos:%s", video_id))
}

func (repo *repo) GetAutosaveVideo(ctx context.Context, videoID string) (*types.VideoGetParams, error) {
	return fetchFromCache[types.VideoGetParams](ctx, repo.redis, fmt.Sprintf("autosave:videos:%s", videoID))
}

func (repo *repo) GetVideoVersions(ctx context.Context, video_id string) ([]types.VideoGetParams, error) {
	cacheKey := fmt.Sprintf("videos:%s:versions", video_id)

	// Fetch the video versions from Redis
	versions, err := repo.redis.LRange(ctx, cacheKey, 0, -1).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch video versions history from Redis: %w", err)
	}

	var videoVersions []types.VideoGetParams
	for _, version := range versions {
		var v types.VideoGetParams
		if err := json.Unmarshal([]byte(version), &v); err != nil {
			return nil, fmt.Errorf("failed to unmarshal video version: %w", err)
		}
		videoVersions = append(videoVersions, v)
	}

	return videoVersions, nil
}

func (repo *repo) DiscardAutosave(ctx context.Context, videoID string) error {
	autosaveKey := fmt.Sprintf("autosave:videos:%s", videoID)
	return repo.redis.Del(ctx, autosaveKey).Err()
}

func (repo *repo) SaveVideoToDatabase(ctx context.Context, videoID string, video *types.VideoGetParams) error {
	// Fetch the entire video data from Redis

	// Start a database transaction
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start database transaction: %w", err)
	}

	// Update the main video data in the database
	videoQuery := `
        UPDATE videos 
        SET title = $1, description = $2, video_url = $3, audio_url = $4, 
            poster_url = $5, transcript_url = $6, waveform_data_url = $7, 
            published_video_url = $8, duration = $9, file_size = $10, format = $11, 
            resolution = $12, frame_rate = $13, bitrate = $14, updated_at = $15
        WHERE id = $16
    `
	_, err = tx.ExecContext(ctx, videoQuery,
		video.Title, video.Description, video.VideoURL, video.AudioURL,
		video.PosterURL, video.TranscriptUrl, video.WaveformDataURL,
		video.PublishedURL, video.Duration, video.FileSize, video.Format,
		video.Resolution, video.FrameRate, video.Bitrate, time.Now(), video.ID,
	)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update video data: %w", err)
	}

	// Update nested fields: FabricVideo, ChildAudios, ChildVideos, ChildImages, LowerThird, FabricSubtitle
	if err := updateNestedFields(ctx, tx, *video); err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func SaveFabricVideo(ctx context.Context, tx *sql.Tx, fabricVideo types.FabricVideo, videoID string) error {
	fabricQuery := `
        UPDATE fabric_videos 
        SET time = $1, duration = $2, locked = $3, hidden = $4, track = $5, 
            properties = $6, updated_at = $7
        WHERE video_id = $8
    `
	_, err := tx.ExecContext(ctx, fabricQuery,
		fabricVideo.Time, fabricVideo.Duration, fabricVideo.Locked,
		fabricVideo.Hidden, fabricVideo.Track, fabricVideo.Properties,
		time.Now(), videoID,
	)
	if err != nil {
		return fmt.Errorf("failed to update fabric video: %w", err)
	}
	return nil
}

// func updateNestedFields(ctx context.Context, tx *sql.Tx, video types.VideoGetParams) error {
// 	// Update FabricVideo
// 	if err := SaveFabricVideo(ctx, tx, video.FabricVideo, video.ID); err != nil {
// 		return err
// 	}

// 	// Update ChildAudios
// 	for _, audio := range video.ChildAudios {
// 		if err := SaveChildAudio(ctx, tx, audio); err != nil {
// 			return err
// 		}
// 	}

// 	// Update ChildVideos
// 	for _, childVideo := range video.ChildVideos {
// 		if err := SaveChildVideo(ctx, tx, childVideo); err != nil {
// 			return err
// 		}
// 	}

// 	// Update ChildImages
// 	for _, image := range video.ChildImages {
// 		if err := SaveChildImage(ctx, tx, image); err != nil {
// 			return err
// 		}
// 	}

// 	// Update LowerThird
// 	for _, lowerThird := range video.LowerThird {
// 		if err := SaveLowerThird(ctx, tx, lowerThird); err != nil {
// 			return err
// 		}
// 	}

// 	// Update FabricSubtitle
// 	if subtitle := video.FabricSubtitle; subtitle.ID != "" {
// 		if err := SaveSubtitle(ctx, tx, subtitle); err != nil {
// 			return err
// 		}
// 	}

// 	return nil
// }

func (repo *repo) SaveVideo(ctx context.Context, videoID string) error {
	// Retrieve the autosave data

	cacheKey := fmt.Sprintf("autosave:videos:%s", videoID)
	videoData, err := fetchFromCache[types.VideoGetParams](ctx, repo.redis, cacheKey)
	if err != nil {
		return err
	}

	// Save the video data to the database
	if err := repo.SaveVideoToDatabase(ctx, videoID, videoData); err != nil {
		return fmt.Errorf("failed to save video to database: %w", err)
	}

	// Save the current state as the new published version
	// // Add the previous published version to version history
	repo.SaveVideoVersion(ctx, videoID, videoData)

	return nil
}

func updateNestedFields(ctx context.Context, tx *sql.Tx, video types.VideoGetParams) error {
	var wg sync.WaitGroup

	numTasks := len(video.ChildAudios) + len(video.ChildVideos) + len(video.ChildImages) + len(video.LowerThird)
	errChan := make(chan error, numTasks) // Buffered to avoid blocking

	// Helper to handle errors from goroutines
	handleError := func(err error) {
		if err != nil {
			errChan <- err
		}
	}

	// Update FabricVideo
	wg.Add(1)
	go func() {
		defer wg.Done()
		handleError(SaveFabricVideo(ctx, tx, video.FabricVideo, video.ID))
	}()

	// Update ChildAudios
	for _, audio := range video.ChildAudios {
		wg.Add(1)
		go func(audio types.ChildAudio) {
			defer wg.Done()
			handleError(SaveChildAudio(ctx, tx, audio))
		}(audio)
	}

	// Update ChildVideos
	for _, childVideo := range video.ChildVideos {
		wg.Add(1)
		go func(childVideo types.ChildVideo) {
			defer wg.Done()
			handleError(SaveChildVideo(ctx, tx, childVideo))
		}(childVideo)
	}

	// Update ChildImages
	for _, image := range video.ChildImages {
		wg.Add(1)
		go func(image types.ChildImage) {
			defer wg.Done()
			handleError(SaveChildImage(ctx, tx, image))
		}(image)
	}

	// Update LowerThird
	for _, lowerThird := range video.LowerThird {
		wg.Add(1)
		go func(lowerThird types.LowerThird) {
			defer wg.Done()
			handleError(SaveLowerThird(ctx, tx, lowerThird))
		}(lowerThird)
	}

	// Update FabricSubtitle
	if subtitle := video.FabricSubtitle; subtitle.ID != "" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			handleError(SaveSubtitle(ctx, tx, subtitle))
		}()
	}

	// Wait for all goroutines to complete
	wg.Wait()
	close(errChan)

	// Check for errors
	for err := range errChan {
		if err != nil {
			return err
		}
	}

	return nil
}

func (repo *repo) SaveTranscript(ctx context.Context, transcriptUrl string, videoId string) error {
	subtitleQuery := `
        UPDATE videos 
        SET transcript_url = $1 
        WHERE id = $2
    `
	_, err := repo.db.ExecContext(ctx, subtitleQuery, transcriptUrl, videoId)
	if err != nil {
		return fmt.Errorf("failed to update subtitle URL: %w", err)
	}

	updateCacheFn := func(vgp *types.VideoGetParams) error {
		vgp.TranscriptUrl = transcriptUrl
		return nil
	}

	if err := updateCache(ctx, repo.redis, fmt.Sprintf("videos:%s", videoId), updateCacheFn); err != nil {
		return err
	}

	if err := updateCache(ctx, repo.redis, fmt.Sprintf("autosave:videos:%s", videoId), updateCacheFn); err != nil {
		return err
	}

	return nil
}
