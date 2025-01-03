package main

// package main

// import (
// 	"bytes"
// 	"fmt"
// 	"io"
// 	"log"
// 	"net/http"
// 	"os/exec"

// 	ffmpeg_go "github.com/u2takey/ffmpeg-go"
// )

// func main() {

// 	// input := "vid.mp4"
// 	// convertToMkv(input)
// 	// fi, _ := os.ReadFile("noir.aif")
// 	// execCommand("pixelizeVideo.mp4")
// 	// splitVideo("vid.mp4")
// 	// getAudio("out.mp4", "audio.wav")
// 	// extract_frames()
//     // addSrtSubtitles()
//     drawText()

//     //Serve the converted video file as a web server
//     http.Handle("/", http.FileServer(http.Dir("./")))
//     fmt.Println("Web server listening on :80")

//     // Start the web server
//     // go http.ListenAndServe(":80", nil)

//     // Keep the main goroutine running until the server is stopped
//     // select {}

// 	// http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
//     //     fmt.Fprintf(w, "Hello, you've requested: %s\n", r.URL.Path)
//     // })

//     http.ListenAndServe(":80", nil)

// }

// func convertToMkv(input string){
// 	// output := "out.mp4"

// 	// out, err := os.Create(output)
// 	// if err != nil {
// 	// 	log.Fatal(err)
// 	// }
// 	// defer out.Close()

// 	//Process the video file (e.g., convert mp4 to mkv)
// 	err := ffmpeg_go.Input(input).
// 	    Output("out.mkv", ffmpeg_go.KwArgs{"f": "matroska"}).
// 		OverWriteOutput().Run()
//     if err!= nil {
//         log.Fatal(err)
//     }

//     fmt.Println("Video processed successfully!")
// }

// func splitVideo(input string) {
// 	err := ffmpeg_go.Input(input, ffmpeg_go.KwArgs{"ss": 10}).
// 		Output("./out.mp4", ffmpeg_go.KwArgs{"t": 15}).
// 		OverWriteOutput().
// 		Run()

// 	if err!= nil {
//         log.Fatal(err)
//     }

//     fmt.Println("Video processed successfully!")
// }

// func addWatermark(input string) {
// 	overlay := ffmpeg_go.Input("./andreas.jpg").
// 			Filter("scale", ffmpeg_go.Args{"64:-1"})

// 	err := ffmpeg_go.Filter(
// 		[]*ffmpeg_go.Stream{
// 			ffmpeg_go.Input(input),
//             overlay,
// 		}, "overlay", ffmpeg_go.Args{"10:10"}, ffmpeg_go.KwArgs{"enable": "gte(t,1)"}).
// 		Output("./out_watermark.mp4").
// 		OverWriteOutput().
// 		ErrorToStdOut().
// 		Run()

// 	if err!= nil {
//         log.Fatal(err)
//     }

//     fmt.Println("Video processed successfully!")
// }

// func cutVideoToGif(input string) {
// 	err := ffmpeg_go.Input(input, ffmpeg_go.KwArgs{"ss": "10", "t": "15"}).
//         Output("out.gif", ffmpeg_go.KwArgs{"pix_fmt": "rgb24", "t": "3", "r": "3"}).
//         OverWriteOutput().
// 		ErrorToStdOut().
//         Run()

//     if err!= nil {
//         log.Fatal(err)
//     }

//     fmt.Println("Video processed successfully!")
// }

// func something(input string) {
// 	split := ffmpeg_go.Input(input).VFlip().Split()
// 	split0, split1 := split.Get("0"), split.Get("1")
// 	overlayFile := ffmpeg_go.Input("./andreas.jpg").Crop(10, 10, 158, 112)
// err := ffmpeg_go.Concat([]*ffmpeg_go.Stream{
//     split0.Trim(ffmpeg_go.KwArgs{"start_frame": 10, "end_frame": 20}),
//     split1.Trim(ffmpeg_go.KwArgs{"start_frame": 30, "end_frame": 40})}).
//     Overlay(overlayFile.HFlip(), "").
//     DrawBox(50, 50, 120, 120, "red", 5).
//     Output("./out1.mp4").
//     OverWriteOutput().
//     Run()

// 	if err!= nil {
//         log.Fatal(err)
//     }

//     fmt.Println("Video processed successfully!")
// }

// func combineClips(){
// 	err := ffmpeg_go.Concat([]*ffmpeg_go.Stream{
// 		ffmpeg_go.Input("./out1.mp4"),
//         ffmpeg_go.Input("./out.mp4"),
// 	}).
//         Output("./out2.mp4").
//         OverWriteOutput().
//         Run()

//     if err!= nil {
//         log.Fatal(err)
//     }

//     fmt.Println("Video processed successfully!")
// }

// func populateStdin(file []byte) func(io.WriteCloser) {
//     return func(stdin io.WriteCloser) {
//         defer stdin.Close()
//         io.Copy(stdin, bytes.NewReader(file))
//     }
// }

// func execCommand() {

// 	// ffmpeg -i inputVideo1.mp4 -i inputVideo2.mp4 -filter_complex xfade=transition=pixelize:duration=5:offset=0 pixelizeVideo.mp4
// 	// cmd := exec.Command("ffmpeg","-i","out1.mp4", "-i", "out.mp4", "-filter_complex", "xfade=transition=pixelize:duration=5:offset=0", "output%03d", "-y")
// 	cmd := exec.Command("ffmpeg",
// 		"-i", "vid.mp4",
// 		"-filter_complex", "zoompan=z='min(zoom+0.0015,1.5)':d=700:x='if(gte(zoom,1.5),x,x+1/a)':y='if(gte(zoom,1.5),y,y+1)':s=640x360",
// 		"output%03d.mp4",
// 		"-y",
// 	)

// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func processCmd(cmd *exec.Cmd) {
// 	_, err := cmd.StdoutPipe()
// 	if err!= nil {
//         log.Fatal(err)
//     }
// 	err = cmd.Start()
// 	if err!= nil {
//         log.Fatal(err)
//     }
// 	// fo, _ := os.Create(file)
// 	// io.Copy(fo, stdout)
// 	// err = cmd.Wait()
// 	// if err!= nil {
//     //     log.Fatal(err)
//     // }
// }

// func cutFileToChunksPadBlack(file string){
// 	// ffmpeg -i input.mp4 -f segment -segment_time 10 -c copy output%03d.mp4
//     cmd := exec.Command("ffmpeg","-i", file, "-f", "segment", "-segment_time", "10", "-c", "copy", "output%03d.mp4")
//     processCmd(cmd)
// }

// func cutFileToChunks(file string){

// }

// func sharpenInput(file string) {
// 	// // ffmpeg -i input.mp4 -vf "eq=brightness=1.2:saturation=1.5:contrast=1.5" output.mp4
//     cmd := exec.Command("ffmpeg","-i", file, "-vf", "eq=brightness=1.2:saturation=1.5:contrast=1.5", "output%3d.mp4")
//     processCmd(cmd)

// }

// func getAudio(file, output string){
// 	cmd := exec.Command("ffmpeg", "-i", file, output)

// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func crossfade(){
// 	cmd := exec.Command("ffmpeg",
// 		"-i", "output2.mp3",
// 		"-i", "output.mp3",
// 		"-filter_complex", "acrossfade=d=0.5:o=0:c1=exp:c2=exp",
// 		"outputcrossfade.mp3",
// 		"-y",
// 	)
// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func blendVideos(){
// 	cmd := exec.Command("ffmpeg",
// 		"-i", "out1.mp4",
// 		"-i", "out.mp4",
// 		"-filter_complex", "blend=all_expr='if(lt(N*SW+X,W),A,B)'",
// 		"blended.mp4",
// 		"-y",
// 	)
// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func crop(){
// 	cmd := exec.Command("ffmpeg",
// 		"-i", "vid.mp4",
// 		"-filter_complex", "crop=1*in_h:1*in_h",
// 		"crop.mp4",
// 		"-y",
// 	)
// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func colorAdjustment(){
// 	cmd := exec.Command("ffmpeg",
// 		"-i", "out.mp4",
// 		"-filter_complex", "curves=vintage",
// 		"color_adjustment.mp4",
// 		"-y",
// 	)
// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func extractPlane() {
// 	//ffmpeg -i video.avi -filter_complex 'extractplanes=y+u+v[y][u][v]' -map '[y]' y.avi -map '[u]' u.avi -map '[v]' v.avi

// 	cmd := exec.Command("ffmpeg",
// 		"-i", "vid.mp4",
// 		"-filter_complex", "extractplanes=y+u+v[y][u][v]",
// 		"-map", "[y]", "y.mp4",
// 		"-map", "[u]", "u.mp4",
//         "-map", "[v]", "v.mp4",
// 		"-y",
// 	)
// 	// Run the command
// 	err := cmd.Run()

// 	// Handle errors
// 	if err != nil {
// 		log.Fatalf("ffmpeg command failed: %v", err)
// 	}

// 	log.Println("ffmpeg command executed successfully.")
// }

// func fade(){
// 	cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-filter_complex", "fade=in:0:5,fade=out:duration=5:start_time=5",
//         "fade.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func padding(){
// 	cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-filter_complex", "pad=ih*16/9:ih:(ow-iw)/2:(oh-ih)/2",
//         "padded.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func palletgen(){
// 	//"ffmpeg -i input.mkv -vf palettegen palette.png"
// 	cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "palettegen",
//         "palette.png",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func paletteuse(){
// 	//"ffmpeg -i input.mkv -i palette.png -lavfi 'paletteuse=colors=16:dither=none' output.mkv"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-i", "palette.png",
//         "-lavfi", "paletteuse=colors=16:dither=none",
//         "output.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func resize(){
// 	//"ffmpeg -i input.mkv -vf scale=640x360 output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "scale=9/16*in_w:in_h",
//         "output.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func rotate(){
// 	//"ffmpeg -i input.mkv -vf transpose=2 output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "transpose=2",
//         "output.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func thumbnail(){
// 	//"ffmpeg -i input.mkv -vf thumbnail,scale=240:180 output.png"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
// 		"-ss", "30",
//         "-vf", "thumbnail=50",
//         "thumbnail.png",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func trim1(){
// 	//"ffmpeg -i input.mkv -ss 00:00:10 -to 00:00:30 output.mkv"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-ss", "10",
//         "-to", "30",
//         "output.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func trim(){
// 	//"ffmpeg -i input.mkv -ss 00:00:10 -to 00:00:30 output.mkv"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "trim=60:120",
//         "output.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func sharpen(){
// 	//"ffmpeg -i input.mkv -vf sharpen=1 output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "sharpen=1",
//         "sharpen.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func unsharpen(){
// 	//"ffmpeg -i input.mkv -vf unsharp=1 output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "senja.mp4",
//         "-vf", "unsharp=luma_msize_x=7:luma_msize_y=7:luma_amount=2.5",
//         "unsharpen_senja.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func vflip(){
// 	//"ffmpeg -i input.mkv -vf vflip output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "vflip",
//         "vflip.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func hflip(){
// 	//"ffmpeg -i input.mkv -vf hflip output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "hflip",
//         "hflip.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func loop(){
// 	//"ffmpeg -i input.mkv -vf loop=1 output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "loop=1",
//         "loop.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func reverse(){
// 	//"ffmpeg -i input.mkv -vf reverse output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "reverse",
//         "reverse.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func vstack(){
// 	//"ffmpeg -i input1.mp4 -i input2.mp4 -filter_complex vstack output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "out1.mp4",
//         "-i", "out.mp4",
//         "-filter_complex", "vstack",
//         "vstacked.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func hstack(){
// 	//"ffmpeg -i input1.mp4 -i input2.mp4 -filter_complex hstack output.mp4"
//     cmd := exec.Command("ffmpeg",
//         "-i", "out1.mp4",
//         "-i", "out.mp4",
//         "-filter_complex", "hstack",
//         "hstacked.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func extract_frames(){
// 	//ffmpeg -i input.mp4 -vf fps=1 frame_%04d.png

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "fps=1",
//         "./frames/output%d.png",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func extract_audio(){
// 	//ffmpeg -i input.mp4 -acodec copy output.aac

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-acodec", "copy",
//         "output.aac",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func extract_audio2(){
// 	//ffmpeg -i input.mp4 -q:a 0 -map a audio.mp3

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-q:a", "0",
//         "-map", "a",
//         "audio.mp3",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func addSubtitles(){
//     //ffmpeg -i input.mp4 -i subtitles.srt -scodec copy -t 0 output.mp4
//     //ffmpeg -i my_video.mp4 -vf ass=my_styled_subtitles.ass my_video_with_styled_subtitles.mp4

//     cmd := exec.Command("ffmpeg",
//         "-i", "out.mp4",
//         "-vf", "subtitles=output_subtitles_unique.ass",
//         "-c:a", "copy",
//         "ass_subtitle_vid.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func addSrtSubtitles(){
//     //ffmpeg -i input.mp4 -i subtitles.srt -i src_audio.wav -c:v copy -c:a aac -map 0:v -map 1:a -map 2:a output.mp4

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-i", "transcribed_transcription.srt",
//         "-vf", "subtitles=transcribed_transcription.srt:force_style='Fontname=Arial Serif,PrimaryColour=&HCCFF0000'",
//         "vid_with_srt_subtitle.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func addAudioToVideo(){
//     //ffmpeg -i input.mp4 -i audio.mp3 -c:v copy -c:a aac -map 0:v -map 1:a output.mp4

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-i", "borrtex-smell-of-summer.wav",
//         "-c:v", "copy",
//         "-c:a", "aac",
//         "-map", "0:v",
//         "-map", "1:a",
//         "vid_with_audio.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func addAudioToVideo2(){
//     //ffmpeg -i input.mp4 -i input.mp3 -c copy -map 0:v:0 -map 1:a:0 output.mp4

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-i", "borrtex-smell-of-summer.wav",
//         "-c", "copy",
//         "-map", "0:v:0",
//         "-map", "1:a:0",
//         "vid_with_audio2.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }

// func addAudioToVideo3(){
//     //ffmpeg -i video.mp4 -loop 1 -i audio.mp3 -lavfi "[0:a]volume=1.2[a];[1]volume=1.3[b];[a][b]amix=2:shortest" -c:v copy -c:a aac -q:a 4 out.mp4

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-i", "borrtex-smell-of-summer.wav",
//         "-filter_complex", "[0:a]volume=1.2[a];[1]volume=1.3[b];[a][b]amix=2:longest",
//         "-c:v", "copy",
//         "-c:a", "aac",
//         "-q:a", "4",
//         "vid_with_audio3.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")

// }

// func drawText(){
//     //ffmpeg -i input.mp4 -vf drawtext="text='Hello, World!':x=(w-text_w)/2:y=(h-text_h)/2:fontfile=arial.ttf:fontcolor=white:fontsize=30" output.mp4

//     cmd := exec.Command("ffmpeg",
//         "-i", "vid.mp4",
//         "-vf", "drawtext=text='Hello, World!':x=(w-text_w)/2:y=(h-text_h)/2:fontfile=proximanova_regular.ttf:fontcolor=white:fontsize=30",
//         "vid_with_text.mp4",
//         "-y",
//     )
//     // Run the command
//     err := cmd.Run()

//     // Handle errors
//     if err!= nil {
//         log.Fatalf("ffmpeg command failed: %v", err)
//     }

//     log.Println("ffmpeg command executed successfully.")
// }
