package service

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

type AudioWaveformServicer interface {
	GenerateWaveform(audio_file_url, data_file_url string) error
}

type AudioWaveformService struct {
}

func NewAudioWaveformService() AudioWaveformServicer {
	return &AudioWaveformService{}
}

func (wfs AudioWaveformService) GenerateWaveform(audio_file_url, data_file_url string) error {
	// Check where the executable is located
	cmdPath := exec.Command("which", "audiowaveform")
	out, _ := cmdPath.Output()
	fmt.Printf("audiowaveform path: %s\n", string(out))

	// Ensure tmp directories exist
	err := os.MkdirAll(filepath.Dir(data_file_url), 0755)
	if err != nil {
		return fmt.Errorf("failed to create directories: %v", err)
	}

	cmd := exec.Command("audiowaveform", "-i", audio_file_url, "-o", data_file_url, "-z", "256", "-b", "8")
	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to generate waveform: %v", err)
	}

	return nil
}
