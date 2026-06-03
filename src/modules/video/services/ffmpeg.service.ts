import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

let configured = false;

function configureFfmpeg(): void {
  if (configured) return;
  const binaryPath = ffmpegStatic as string | null;
  if (binaryPath) {
    ffmpeg.setFfmpegPath(binaryPath);
  }
  configured = true;
}

configureFfmpeg();

export { ffmpeg };
