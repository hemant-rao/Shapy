import type { ShapyOptions } from 'shapy-bg';

export type ShapyRenderFormat = 'mp4' | 'webm' | 'png';

export interface ShapyRenderOptions {
  /** Destination file for video, or directory for a PNG sequence. */
  output: string;
  /** Output format. Inferred from the output extension when omitted. */
  format?: ShapyRenderFormat;
  /** Capture width in CSS pixels. Defaults to 1080. */
  width?: number;
  /** Capture height in CSS pixels. Defaults to 1920. */
  height?: number;
  /** Frames per second. Defaults to 30. */
  fps?: number;
  /** Clip duration in seconds. Defaults to 8. */
  duration?: number;
  /** Device pixel ratio for the capture. Defaults to 1. */
  dpr?: number;
  /** Keep the background transparent. Not supported for MP4. */
  alpha?: boolean;
  /** Shapy element options passed through to setOptions(). */
  options?: ShapyOptions;
  /** Optional still frame path (.png, .jpg, or .jpeg). */
  poster?: string;
  /** Timeline position for the poster frame in seconds. Defaults to 0. */
  posterTime?: number;
  /** H.264 CRF for MP4 (0–51) or mapped VP9 quality for WebM. Defaults to 20. */
  crf?: number;
  /** Loop period passed to the element in seconds. */
  loop?: number;
  /** Use a specific ffmpeg executable. */
  ffmpeg?: string;
  /** Keep captured PNG frames after encoding. */
  keepFrames?: boolean;
  /** Progress callback for frame capture and encoding. */
  onProgress?: (progress: ShapyRenderProgress) => void;
}

export interface ShapyRenderProgress {
  phase: 'frames' | 'encode' | 'poster';
  frame?: number;
  total?: number;
  time?: number;
  message?: string;
}

export interface ShapyRenderResult {
  output: string;
  format: ShapyRenderFormat;
  seed: string;
  /** SHAPY_ENGINE_VERSION used for the capture. */
  engineVersion: number;
  width: number;
  height: number;
  fps: number;
  duration: number;
  frames: number;
  poster?: string;
  ffmpeg?: string;
  framesDir?: string;
}

/** Render a Shapy background to MP4, WebM, or a PNG sequence. */
export function render(options: ShapyRenderOptions): Promise<ShapyRenderResult>;
