import { makeAutoObservable, runInAction } from "mobx";
import axios, {
  AxiosRequestConfig,
  CancelTokenSource,
  AxiosProgressEvent,
} from "axios";

interface UploadResult {
  success?: string;
  error?: string;
}

class Files {
  private SERVER: string;
  private currentUploadSource: CancelTokenSource | null = null;

  constructor() {
    // Use type assertion to handle any environment variable parsing
    const env = (import.meta as any).env as any;
    this.SERVER = env.VITE_SERVER_ADDRESS;
    makeAutoObservable(this);
  }

  // Cancel any ongoing upload before starting a new one
  private cancelPreviousUpload() {
    if (this.currentUploadSource) {
      this.currentUploadSource.cancel("New upload started");
      this.currentUploadSource = null;
    }
  }

  public async uploadVideo(
    file: File,
    onUploadProgress?: (loaded: number, total: number) => void
  ): Promise<UploadResult> {
    // Cancel any previous ongoing upload
    this.cancelPreviousUpload();

    // Create a new cancel token source
    const cancelTokenSource = axios.CancelToken.source();
    this.currentUploadSource = cancelTokenSource;

    console.log("Uploading video file:", file.name, this.SERVER);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        cancelToken: cancelTokenSource.token,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          // Call the progress callback if provided
          if (onUploadProgress && progressEvent.total) {
            onUploadProgress(progressEvent.loaded, progressEvent.total);
          }
        },
      };

      const response = await axios.post(
        `${this.SERVER}/v1/upload`,
        formData,
        config
      );

      // Reset the current upload reference
      runInAction(() => {
        this.currentUploadSource = null;
      });

      return {
        success: `${file.name} uploaded successfully.`,
      };
    } catch (error) {
      // Reset the current upload reference
      runInAction(() => {
        this.currentUploadSource = null;
      });

      // Handle axios cancel errors
      if (axios.isCancel(error)) {
        console.log("Upload cancelled");
        return { error: "Upload was cancelled" };
      }

      // Handle network or server errors
      console.error("Upload error:", error);

      if (axios.isAxiosError(error)) {
        return {
          error:
            error.response?.data?.message ||
            `${file.name} upload failed: ${error.message}`,
        };
      }

      return {
        error: `Error uploading ${file.name}`,
      };
    }
  }

  // Optional: Method to explicitly cancel an upload
  public cancelUpload() {
    if (this.currentUploadSource) {
      this.currentUploadSource.cancel("Upload cancelled by user");
      this.currentUploadSource = null;
    }
  }
}

export const files = new Files();
