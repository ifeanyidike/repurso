package service

import (
	"context"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"
)

type JobResult struct {
	JobID     string
	Status    string
	Data      interface{}
	Error     error
	Timestamp time.Time
}

type ProcessingError struct {
	JobID    string
	ClientID string
	Op       string
	Err      error
}

type JobStatus struct {
	JobID  string      `json:"job_id"`
	Status string      `json:"status"`
	Data   interface{} `json:"data,omitempty"`
	Error  error       `json:"error,omitempty"`
}

type JobProcessor interface {
	ProcessJob(ctx context.Context, job Job) error
	Start(ctx context.Context, workers int) error
	Stop()
	EnqueueJob(job Job) error
	// Status(jobID string) (*JobStatus, error)
}

type Job interface {
	GetID() string
	GetType() string
	GetData() interface{}
	GetClientID() string
}

type TranscriptionJob struct {
	ID       string
	Bucket   string
	AudioURL string
	VideoID  string
	ClientID string
}

func (j *TranscriptionJob) GetID() string {
	return j.ID
}

func (j *TranscriptionJob) GetClientID() string {
	return j.ClientID
}

func (j *TranscriptionJob) GetType() string {
	return "transcription"
}

func (j *TranscriptionJob) GetData() interface{} {
	return j
}

type BackgroundProcessor struct {
	uploadService UploadServicer
	jobQueue      chan Job
	notifier      Notifier
	wg            sync.WaitGroup
	ctx           context.Context
	cancel        context.CancelFunc
	metrics       *ProcessingMetrics
}

type ProcessingMetrics struct {
	activeJobs     int64
	completedJobs  int64
	failedJobs     int64
	processingTime time.Duration
	mu             sync.RWMutex
}

type ProcessorConfig struct {
	UploadService UploadServicer
	Notifier      Notifier
	Workers       int
	QueueSize     int
}

func NewBackgroundProcessor(cfg ProcessorConfig) (*BackgroundProcessor, error) {
	ctx, cancel := context.WithCancel(context.Background())

	p := &BackgroundProcessor{
		uploadService: cfg.UploadService,
		jobQueue:      make(chan Job, cfg.QueueSize),
		notifier:      cfg.Notifier,
		wg:            sync.WaitGroup{},
		ctx:           ctx,
		cancel:        cancel,
	}

	if err := p.Start(ctx, cfg.Workers); err != nil {
		cancel()
		return nil, err
	}

	return p, nil
}

func (e *ProcessingError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("operation %s failed for job %s: %v", e.Op, e.JobID, e.Err)
	}
	return fmt.Sprintf("operation %s failed for job %s", e.Op, e.JobID)
}

func (p *BackgroundProcessor) Start(ctx context.Context, workers int) error {
	p.metrics = &ProcessingMetrics{}
	for i := 0; i < workers; i++ {
		p.wg.Add(1)
		go p.worker(ctx, 1)
	}
	go p.collectMetrics(ctx)
	return nil
}

func (p *BackgroundProcessor) notifyWithRetry(notification Notification, maxRetries int) error {
	var lastErr error
	for i := 0; i < maxRetries; i++ {
		log.Println("notifying...", notification)
		if err := p.notifier.Notify(notification); err != nil {
			log.Printf("Failed to notify: %v", err)
			lastErr = err
			time.Sleep(time.Second * time.Duration(i+1))
			continue
		}
		return nil
	}
	return fmt.Errorf("failed to notify after %d retries: %w", maxRetries, lastErr)
}

func (p *BackgroundProcessor) collectMetrics(ctx context.Context) {}

// Graceful shutdown
func (p *BackgroundProcessor) Stop() {
	p.cancel()
	p.wg.Wait()
}

func (p *BackgroundProcessor) EnqueueJob(job Job) error {
	select {
	case p.jobQueue <- job:
		log.Printf("Enqueued job %s for processing", job.GetClientID())
		return nil
	default:
		return fmt.Errorf("job queue is full")
	}
}

func (p *BackgroundProcessor) worker(ctx context.Context, id int) {
	defer p.wg.Done()

	for {
		select {
		case <-p.ctx.Done():
			return
		case job := <-p.jobQueue:
			log.Println("worker id", id)
			p.ProcessJob(ctx, job)
		}
	}
}

func (p *BackgroundProcessor) ProcessJob(ctx context.Context, job Job) error {

	defer func() {
		if err := recover(); err != nil {
			log.Printf("Recovered from panic in processJob: %v", err)
			p.notifyWithRetry(Notification{
				Type:     TypeError,
				JobID:    job.GetID(),
				ClientID: job.GetClientID(),
				Status:   "failed",
				Time:     time.Now(),
			}, 3)
		}
	}()

	// Track active jobs and processing time
	startTime := time.Now()
	atomic.AddInt64(&p.metrics.activeJobs, 1)
	defer atomic.AddInt64(&p.metrics.activeJobs, -1)

	notification := Notification{
		Type:     TypeJobStatus,
		JobID:    job.GetID(),
		ClientID: job.GetClientID(),
		Status:   "processing",
		Time:     time.Now(),
	}

	if err := p.notifyWithRetry(notification, 3); err != nil {
		log.Printf("Failed to notify job status: %v", err)
		return &ProcessingError{
			JobID:    job.GetID(),
			ClientID: job.GetClientID(),
			Op:       "initial_notification",
			Err:      err,
		}
	}

	done := make(chan error, 1)
	result := make(chan interface{}, 1)

	go func() {
		switch j := job.(type) {
		case *TranscriptionJob:
			transcriptURL, err := p.uploadService.AutoGenerateTranscript(ctx, j.Bucket, j.AudioURL, j.VideoID)
			fmt.Println("transcriptURL: ", transcriptURL)
			if err != nil {
				done <- err
				return
			}
			result <- transcriptURL
			done <- nil
		default:
			done <- fmt.Errorf("unsupported job type: %T", j)
		}
	}()

	select {
	case <-ctx.Done():
		notification.Status = "failed"
		notification.Error = ctx.Err().Error()
		p.notifyWithRetry(notification, 3)
		return ctx.Err()
	case err := <-done:
		log.Println("err:=<-done activated")
		if err != nil {
			notification.Status = "failed"
			notification.Error = err.Error()
			p.notifyWithRetry(notification, 3)

			// update metrics
			atomic.AddInt64(&p.metrics.failedJobs, 1)
			p.metrics.mu.Lock()
			p.metrics.processingTime += time.Since(startTime)
			p.metrics.mu.Unlock()
			return &ProcessingError{
				JobID: job.GetClientID(),
				Op:    "process_job",
				Err:   err,
			}
		}
		notification.Status = "completed"
		notification.Data = <-result
		notification.Time = time.Now()

		if err := p.notifyWithRetry(notification, 3); err != nil {
			log.Printf("Failed to send completion notification for job %s: %v", job.GetClientID(), err)
		}

		// Update success metrics
		atomic.AddInt64(&p.metrics.completedJobs, 1)
		p.metrics.mu.Lock()
		p.metrics.processingTime += time.Since(startTime)
		p.metrics.mu.Unlock()

		return nil
	case <-done:
		log.Println("process completed without errors")
		notification.Status = "completed"
		notification.Data = <-result
		notification.Time = time.Now()

		if err := p.notifyWithRetry(notification, 3); err != nil {
			log.Printf("Failed to send completion notification for job %s: %v", job.GetClientID(), err)
		}

		// Update success metrics
		atomic.AddInt64(&p.metrics.completedJobs, 1)
		p.metrics.mu.Lock()
		p.metrics.processingTime += time.Since(startTime)
		p.metrics.mu.Unlock()
		log.Println("metric updated successfully")
		return nil
	}

}
