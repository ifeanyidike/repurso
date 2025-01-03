package service

import (
	"fmt"
	"io"
	"net/http"
)

func fetchBlobFromURL(blobURL string) ([]byte, error) {
	// Implement logic to fetch blob data from blob URL
	resp, err := http.Get(blobURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch blob data from URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch blob data from URL. Status code: %d", resp.StatusCode)
	}
	return io.ReadAll(resp.Body)
}
