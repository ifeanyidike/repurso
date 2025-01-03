CREATE TYPE video_format AS ENUM ('mp4', 'mov', 'avi', 'mkv', 'mpeg', 'ogv', '3pg', 'webm', 'wmv', 'flv');
CREATE TYPE audio_format AS ENUM ('mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma');
CREATE TYPE image_format AS ENUM ('jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg', 'heic', 'avif');


CREATE TABLE IF NOT EXISTS "projects" (
  "id" UUID PRIMARY KEY,
  "user_id" BIGINT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "videos" (
  "id" UUID PRIMARY KEY,
  "project_id" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT,
  "description" TEXT,
  "video_url" TEXT NOT NULL,
  "audio_url" TEXT,
  "poster_url" TEXT,
  "transcript" JSONB,
  "waveform_data_url" TEXT,
  "published_video_url" TEXT,
  "duration" FLOAT,
  "file_size" BIGINT,
  "format" video_format,
  "resolution" VARCHAR(50),
  "width" INT,
  "height" INT,
  "frame_rate" FLOAT,
  "bitrate" INT,
  "is_deleted" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "child_videos" (
  "id" UUID PRIMARY KEY,
  "parent_video_id" UUID NOT NULL REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT,
  "description" TEXT,
  "video_url" TEXT NOT NULL,
  "waveform_data_url" TEXT,
  "duration" FLOAT,
  "file_size" BIGINT,
  "format" video_format,
  "resolution" VARCHAR(50),
  "frame_rate" FLOAT,
  "bitrate" INT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "child_audios" (
  "id" UUID PRIMARY KEY,
  "parent_video_id" UUID NOT NULL REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT,
  "description" TEXT,
  "audio_url" TEXT NOT NULL,
  "duration" FLOAT,
  "file_size" BIGINT,
  "time" FLOAT,
  "locked" BOOLEAN,
  "hidden" BOOLEAN DEFAULT FALSE,
  "track" INT,
  "format" audio_format,
  "waveform_data_url" TEXT,
  "volume" FLOAT DEFAULT 1,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "child_images" (
  "id" UUID PRIMARY KEY,
  "parent_video_id" UUID NOT NULL REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT,
  "description" TEXT,
  "image_url" TEXT NOT NULL,
  "file_size" BIGINT,
  "format" image_format,
  "width" FLOAT,
  "height" FLOAT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fabric_images" (
  "id" UUID PRIMARY KEY,
  "image_id" UUID NOT NULL REFERENCES "child_images" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "time" FLOAT,
  "duration" FLOAT,
  "locked" BOOLEAN,
  "hidden" BOOLEAN DEFAULT FALSE,
  "track" INT,
  "properties" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fabric_child_videos" (
  "id" UUID PRIMARY KEY,
  "video_id" UUID NOT NULL REFERENCES "child_videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "time" FLOAT,
  "duration" FLOAT,
  "locked" BOOLEAN,
  "hidden" BOOLEAN DEFAULT FALSE,
  "track" INT,
  "properties" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fabric_videos" (
  "id" UUID PRIMARY KEY,
  "video_id" UUID NOT NULL REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "time" FLOAT DEFAULT 0,
  "duration" FLOAT,
  "locked" BOOLEAN DEFAULT TRUE,
  "hidden" BOOLEAN DEFAULT FALSE,
  "track" INT,
  "properties" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fabric_texts" (
  "id" UUID PRIMARY KEY,
  "parent_video_id" UUID NOT NULL REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" JSONB,
  "time" FLOAT,
  "duration" FLOAT,
  "locked" BOOLEAN DEFAULT FALSE,
  "hidden" BOOLEAN DEFAULT FALSE,
  "track" INT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fabric_subtitles" (
  "id" UUID PRIMARY KEY,
  "parent_video_id" UUID NOT NULL REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "properties" JSONB,
  "time" FLOAT DEFAULT 0,
  "duration" FLOAT,
  "locked" BOOLEAN,
  "hidden" BOOLEAN DEFAULT FALSE,
  "track" INT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_projects_user_id" ON "projects" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_videos_project_id" ON "videos" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_child_videos_parent_video_id" ON "child_videos" ("parent_video_id");
CREATE INDEX IF NOT EXISTS "idx_child_audios_parent_video_id" ON "child_audios" ("parent_video_id");
CREATE INDEX IF NOT EXISTS "idx_child_images_parent_video_id" ON "child_images" ("parent_video_id");
CREATE INDEX IF NOT EXISTS "idx_fabric_images_image_id" ON "fabric_images" ("image_id");
CREATE INDEX IF NOT EXISTS "idx_fabric_child_videos_video_id" ON "fabric_child_videos" ("video_id");
CREATE INDEX IF NOT EXISTS "idx_fabric_videos_video_id" ON "fabric_videos" ("video_id");
CREATE INDEX IF NOT EXISTS "idx_fabric_texts_parent_video_id" ON "fabric_texts" ("parent_video_id");
CREATE INDEX IF NOT EXISTS "idx_fabric_subtitles_parent_video_id" ON "fabric_subtitles" ("parent_video_id");
