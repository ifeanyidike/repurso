import React from "react";
import FileUploadArea from "./components/FileUploadArea";
import ParallaxBackground from "./components/ParallaxBackground";
import { cn } from "../../utils";
import axios from "axios";

const Upload: React.FC = () => {
  // SSE connection
  function connectSSE() {
    const eventSource = new EventSource(
      `http://localhost:8080/v1/notifications/sse?client_id=project123`
    );

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      console.log("notification events", notification);
    };

    eventSource.onerror = (error) => {
      eventSource.close();
      // Implement reconnection logic
      console.log("error", error);
    };

    return eventSource;
  }

  //Make get request to v1/video/samplejob using axios
  async function getSampleJob() {
    try {
      const response = await axios.get(
        "http://localhost:8080/v1/video/samplejob"
      );
      console.log("sample job response", response);
    } catch (error) {
      console.error("error", error);
    }
  }

  function connectWSS() {
    const ws = new WebSocket(
      "ws://localhost:8080/v1/notifications/websocket?client_id=project123"
    );
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      console.log("notification events", notification);
    };
  }

  return (
    <div className="app-container relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-purple-900">
      {/* <ParallaxBackground /> */}
      <div className="content-wrapper flex flex-col items-center z-10">
        <h1 className={cn("text-white text-4xl font-extrabold mb-8")}>
          Upload Your Files in Style
        </h1>
        <FileUploadArea />
      </div>
      <button
        className="border border-red-500 text-white z-[99999] p-5 rounded"
        onClick={connectSSE}
      >
        Connect to server for SSE
      </button>

      <button
        className="border border-blue-500 text-white z-[99999] p-5 rounded"
        onClick={connectWSS}
      >
        Connect to server for WSS
      </button>
      <button
        className="border border-green-500 text-white z-[99999] p-5 rounded"
        onClick={getSampleJob}
      >
        Get sample job
      </button>
    </div>
  );
};

export default Upload;
