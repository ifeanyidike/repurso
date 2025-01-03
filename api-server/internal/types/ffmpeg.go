package types

type FFProbeOutput struct {
	Format struct {
		Size     string `json:"size"`
		Duration string `json:"duration"`
		Bitrate  string `json:"bit_rate"`
		Format   string `json:"format"`
	} `json:"format"`
	Streams []struct {
		CodecType string `json:"codec_type"`
		Width     int    `json:"width"`
		Height    int    `json:"height"`
		FrameRate string `json:"avg_frame_rate"`
	} `json:"streams"`
}

type FileMetadata struct {
	Size       string `json:"size"`
	Duration   string `json:"duration"`
	Bitrate    string `json:"bit_rate"`
	Format     string `json:"format"`
	FrameRate  string `json:"frame_rate"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	CodecType  string `json:"codec_type"`
	Resolution string `json:"resolution"`
}
