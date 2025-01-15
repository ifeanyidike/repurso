package types

import (
	"time"
)

type VideoFormat string

const (
	VideoFormatMP4  VideoFormat = "mp4"
	VideoFormatWEBM VideoFormat = "webm"
	VideoFormatAVI  VideoFormat = "avi"
	VideoFormatMKV  VideoFormat = "mkv"
	VideoFormatMOV  VideoFormat = "mov"
	VideoFormat3GP  VideoFormat = "3gp"
	VideoFormatMPEG VideoFormat = "mpeg"
	VideoFormatOGV  VideoFormat = "ogv"
	VideoFormatWMV  VideoFormat = "wmv"
	VideoFormatFLV  VideoFormat = "flv"
)

type VideoInsertParams struct {
	ProjectID       string
	VideoURL        string
	AudioURL        string
	Title           string
	Description     string
	Duration        float64
	PosterURL       string
	WaveformDataURL string
	FileSize        int
	Format          VideoFormat
	Width           int
	Height          int
	Resolution      string
	FrameRate       string
	Bitrate         int
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type VideosGetParams struct {
	ID          string    `json:"id"`
	VideoURL    string    `json:"video_url"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Duration    float32   `json:"duration"`
	FileSize    int64     `json:"file_size"`
	Format      string    `json:"format"`
	Resolution  string    `json:"resolution"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Video represents the main Video entity
type VideoGetParams struct {
	ID              string         `json:"id"`
	Title           string         `json:"title"`
	Description     string         `json:"description"`
	VideoURL        string         `json:"video_url"`
	AudioURL        string         `json:"audio_url"`
	PosterURL       string         `json:"poster_url"`
	TranscriptUrl   string         `json:"transcript_url"`
	WaveformDataURL string         `json:"waveform_data_url"`
	PublishedURL    string         `json:"published_video_url"`
	Duration        float64        `json:"duration"`
	FileSize        int64          `json:"file_size"`
	Height          int            `json:"height"`
	Width           int            `json:"width"`
	Format          string         `json:"format"`
	Resolution      string         `json:"resolution"`
	FrameRate       float64        `json:"frame_rate"`
	Bitrate         int            `json:"bitrate"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	FabricVideo     FabricVideo    `json:"fabric_videos"`
	ChildAudios     []ChildAudio   `json:"child_audios"`
	ChildImages     []ChildImage   `json:"child_images"`
	ChildVideos     []ChildVideo   `json:"child_videos"`
	FabricSubtitle  FabricSubtitle `json:"fabric_subtitle"`
	LowerThird      []LowerThird   `json:"lower_third"`
}

// FabricVideo contains properties for the fabric representation of a video
type FabricVideo struct {
	ID         string                 `json:"id"`
	VideoID    string                 `json:"video_id"`
	Time       float64                `json:"time"`
	Duration   float64                `json:"duration"`
	Locked     bool                   `json:"locked"`
	Hidden     bool                   `json:"hidden"`
	Track      int                    `json:"track"`
	Properties map[string]interface{} `json:"properties"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}

// ChildVideo represents a child video
type ChildVideo struct {
	ID               string           `json:"id"`
	ParentVideoID    string           `json:"parent_video_id"`
	Title            string           `json:"title"`
	Description      string           `json:"description"`
	VideoURL         string           `json:"video_url"`
	AudioURL         string           `json:"audio_url"`
	PosterURL        string           `json:"poster_url"`
	WaveformDataURL  string           `json:"waveform_data_url"`
	Duration         float64          `json:"duration"`
	FileSize         int64            `json:"file_size"`
	Format           string           `json:"format"`
	Resolution       string           `json:"resolution"`
	FrameRate        float64          `json:"frame_rate"`
	Bitrate          int              `json:"bitrate"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`
	FabricChildVideo FabricChildVideo `json:"fabric_child_videos"`
}

// FabricChildVideo contains properties for the fabric representation of a child video
type FabricChildVideo struct {
	ID         string                 `json:"id"`
	VideoID    string                 `json:"video_id"`
	Time       float64                `json:"time"`
	Duration   float64                `json:"duration"`
	Locked     bool                   `json:"locked"`
	Hidden     bool                   `json:"hidden"`
	Track      int                    `json:"track"`
	Properties map[string]interface{} `json:"properties"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}

// ChildAudio represents the audio attached to a video
type ChildAudio struct {
	ID              string  `json:"id"`
	ParentVideoID   string  `json:"parent_video_id"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	AudioURL        string  `json:"audio_url"`
	Duration        float64 `json:"duration"`
	FileSize        int64   `json:"file_size"`
	Time            float64 `json:"time"`
	Locked          bool    `json:"locked"`
	Hidden          bool    `json:"hidden"`
	Track           int     `json:"track"`
	Format          string  `json:"format"`
	WaveformDataURL string  `json:"waveform_data_url"`
	Volume          float64 `json:"volume"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ChildImage represents images attached to a video
type ChildImage struct {
	ID            string      `json:"id"`
	ParentVideoID string      `json:"parent_video_id"`
	Title         string      `json:"title"`
	Description   string      `json:"description"`
	ImageURL      string      `json:"image_url"`
	FileSize      int64       `json:"file_size"`
	Format        string      `json:"format"`
	Width         float64     `json:"width"`
	Height        float64     `json:"height"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	FabricImage   FabricImage `json:"fabric_images"`
}

// FabricImage contains properties for the fabric representation of an image
type FabricImage struct {
	ID         string                 `json:"id"`
	ImageID    string                 `json:"image_id"`
	Time       float64                `json:"time"`
	Duration   float64                `json:"duration"`
	Locked     bool                   `json:"locked"`
	Hidden     bool                   `json:"hidden"`
	Track      int                    `json:"track"`
	Properties map[string]interface{} `json:"properties"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}

type LowerThird struct {
	ID            string                 `json:"id"`
	ParentVideoID string                 `json:"image_id"`
	Time          float64                `json:"time"`
	Duration      float64                `json:"duration"`
	Locked        bool                   `json:"locked"`
	Hidden        bool                   `json:"hidden"`
	Track         int                    `json:"track"`
	Properties    map[string]interface{} `json:"properties"`
	CreatedAt     time.Time              `json:"created_at"`
	UpdatedAt     time.Time              `json:"updated_at"`
}

type FabricSubtitle struct {
	ID            string                 `json:"id"`
	ParentVideoID string                 `json:"image_id"`
	Time          float64                `json:"time"`
	Duration      float64                `json:"duration"`
	Locked        bool                   `json:"locked"`
	Hidden        bool                   `json:"hidden"`
	Track         int                    `json:"track"`
	Properties    map[string]interface{} `json:"properties"`
	CreatedAt     time.Time              `json:"created_at"`
	UpdatedAt     time.Time              `json:"updated_at"`
}
