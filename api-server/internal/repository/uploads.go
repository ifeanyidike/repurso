package repository

import (
	"context"
)

func (repo *repo) SaveUpload(ctx context.Context, uniqueID, fileURL, transcriptionURL string) error {
	_, err := repo.db.ExecContext(ctx, "INSERT INTO uploads (id, file_url, transcription_url) VALUES ($1, $2, $3)", uniqueID, fileURL, transcriptionURL)
	if err != nil {
		return err
	}
	return nil
}

func (repo *repo) GetUpload(ctx context.Context, uniqueID string) (map[string]interface{}, error) {
	var fileURL, transcriptionURL string
	err := repo.db.QueryRowContext(ctx, "SELECT file_url, transcription_url FROM uploads WHERE id = $1", uniqueID).
		Scan(&fileURL, &transcriptionURL)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"file_url":          fileURL,
		"transcription_url": transcriptionURL,
	}, nil
}
