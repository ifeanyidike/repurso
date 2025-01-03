-- -- Drop foreign keys
-- ALTER TABLE "fabric_subtitles" DROP CONSTRAINT IF EXISTS "fabric_subtitles_parent_video_id_fkey";
-- ALTER TABLE "fabric_texts" DROP CONSTRAINT IF EXISTS "fabric_texts_parent_video_id_fkey";
-- ALTER TABLE "fabric_videos" DROP CONSTRAINT IF EXISTS "fabric_videos_video_id_fkey";
-- ALTER TABLE "fabric_child_videos" DROP CONSTRAINT IF EXISTS "fabric_child_videos_video_id_fkey";
-- ALTER TABLE "fabric_images" DROP CONSTRAINT IF EXISTS "fabric_images_image_id_fkey";
-- ALTER TABLE "child_images" DROP CONSTRAINT IF EXISTS "child_images_parent_video_id_fkey";
-- ALTER TABLE "child_audios" DROP CONSTRAINT IF EXISTS "child_audios_parent_video_id_fkey";
-- ALTER TABLE "child_videos" DROP CONSTRAINT IF EXISTS "child_videos_parent_video_id_fkey";
-- ALTER TABLE "videos" DROP CONSTRAINT IF EXISTS "videos_project_id_fkey";
-- ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_user_id_fkey";



-- Drop indexes first to ensure clean removal
DROP INDEX IF EXISTS "idx_fabric_subtitles_parent_video_id";
DROP INDEX IF EXISTS "idx_fabric_texts_parent_video_id";
DROP INDEX IF EXISTS "idx_fabric_videos_video_id";
DROP INDEX IF EXISTS "idx_fabric_child_videos_video_id";
DROP INDEX IF EXISTS "idx_fabric_images_image_id";
DROP INDEX IF EXISTS "idx_child_images_parent_video_id";
DROP INDEX IF EXISTS "idx_child_audios_parent_video_id";
DROP INDEX IF EXISTS "idx_child_videos_parent_video_id";
DROP INDEX IF EXISTS "idx_videos_project_id";
DROP INDEX IF EXISTS "idx_projects_user_id";

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS "fabric_subtitles";
DROP TABLE IF EXISTS "fabric_texts";
DROP TABLE IF EXISTS "fabric_videos";
DROP TABLE IF EXISTS "fabric_child_videos";
DROP TABLE IF EXISTS "fabric_images";
DROP TABLE IF EXISTS "child_images";
DROP TABLE IF EXISTS "child_audios";
DROP TABLE IF EXISTS "child_videos";
DROP TABLE IF EXISTS "videos";
DROP TABLE IF EXISTS "projects";

DROP TYPE IF EXISTS "image_format";
DROP TYPE IF EXISTS "audio_format";
DROP TYPE IF EXISTS "video_format";

