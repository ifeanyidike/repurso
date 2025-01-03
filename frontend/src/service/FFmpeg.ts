import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { stores } from "../store/Stores";
import { AudioFormats } from "../types/editor";

class FFmpeg {
  // private ffmpegBaseUrl = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"; - Doesnt work for vite
  private ffmpegBaseUrl = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"; // works for vite
  public async load() {
    const ffmpeg = stores.ffmpegRef;
    console.log("ffmpeg loading", ffmpeg);
    ffmpeg.on("log", ({ message }) => {
      console.log("ffmpeg has loaded", message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${this.ffmpegBaseUrl}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${this.ffmpegBaseUrl}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    stores.ffmpegLoaded = true;
  }

  async split(
    source: string,
    splitTime: number,
    input = "input.mp4",
    output1 = "part1.mp4",
    output2 = "part2.mp4",
    format = "video/mp4"
  ) {
    if (
      !stores.ffmpegLoaded ||
      !stores.ffmpegRef ||
      !stores.editorStore!.videoPlayer
    )
      return;

    const ffmpeg = stores.ffmpegRef;

    // Load the video file into FFmpeg
    await ffmpeg.writeFile(input, await fetchFile(source));

    await ffmpeg.exec([
      "-i",
      input,
      "-t",
      `${splitTime}`,
      "-c",
      "copy",
      output1,
    ]);

    await ffmpeg.exec([
      "-i",
      input,
      "-ss",
      `${splitTime}`,
      "-c",
      "copy",
      output2,
    ]);

    // Read the trimmed output and create a URL to display it
    // const data = await ffmpeg.readFile('output.mp4');
    const part1Data = (await ffmpeg.readFile(output1)) as any;
    const part2Data = (await ffmpeg.readFile(output2)) as any;

    const part1_blob = new Blob([part1Data.buffer], { type: format });
    const part2_blob = new Blob([part2Data.buffer], { type: format });
    const part1_url = URL.createObjectURL(
      new Blob([part1Data.buffer], { type: format })
    );
    const part2_url = URL.createObjectURL(
      new Blob([part2Data.buffer], { type: format })
    );
    console.log("part1Data", part1Data);
    console.log("part2Data", part2Data);
    console.log("part1 blob", part1_blob);

    return {
      part1: {
        url: part1_url,
        blob: part1_blob,
      },
      part2: {
        url: part2_url,
        blob: part2_blob,
      },
    };
  }

  async splitVideo(source: string, splitTime: number) {
    return this.split(source, splitTime);
  }

  async splitAudio(source: string, _format: AudioFormats, splitTime: number) {
    let input = "input.mp3";
    let part1 = "part1.mp3";
    let part2 = "part2.mp3";
    let format = "audio/mpeg";

    switch (_format) {
      case "mp3":
        input = "input.mp3";
        part1 = "part1.mp3";
        part2 = "part2.mp3";
        format = "audio/mpeg";
        break;
      case "wav":
        input = "input.wav";
        part1 = "part1.wav";
        part2 = "part2.wav";
        format = "audio/wav";
        break;
      case "ogg":
        input = "input.ogg";
        part1 = "part1.ogg";
        part2 = "part2.ogg";
        format = "audio/ogg";
        break;
    }
    return this.split(source, splitTime, input, part1, part2, format);
  }

  async trimVideo(startTime: number, endTime: number) {
    if (
      !stores.ffmpegLoaded ||
      !stores.ffmpegRef ||
      !stores.editorStore!.videoPlayer
    )
      return;

    const ffmpeg = stores.ffmpegRef;

    // Load the video file into FFmpeg
    await ffmpeg.writeFile(
      "input.mp4",
      await fetchFile(stores.editorStore!.videoPlayer.src)
    );

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-ss",
      `${startTime}`, // Start time
      "-to",
      `${endTime}`, // End time
      "-c",
      "copy", // Copy codec to prevent re-encoding
      "output.mp4", // Output file
    ]);

    const data = (await ffmpeg.readFile("output.mp4")) as any;
    return URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
  }

  async extractAudio(inputVideo: string) {
    const ffmpeg = stores.ffmpegRef;
    await ffmpeg.writeFile("input.mp4", await fetchFile(inputVideo));
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-q:a",
      "0",
      "-map",
      "a",
      "output.mp3",
    ]);
    const audioData = (await ffmpeg.readFile("output.mp3")) as any;
    const blob = new Blob([audioData.buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(
      new Blob([audioData.buffer], { type: "audio/mpeg" })
    );
    return { url, blob };
  }
}

export const ffmpeg_util = new FFmpeg();
