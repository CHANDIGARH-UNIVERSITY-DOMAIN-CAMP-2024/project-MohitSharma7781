import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { MovieData } from '../types';

const ffmpeg = new FFmpeg();

export async function processVideo(
  video: File,
  metadata: { title: string; genre: string; targetDuration: number },
  onProgress: (progress: number) => void
): Promise<MovieData> {
  await ffmpeg.load();
  
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(Math.round(progress * 100));
  });

  const videoData = await fetchFile(video);
  await ffmpeg.writeFile('input.mp4', videoData);

  // Extract scenes
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vf', 'select=gt(scene\\,0.3)',
    '-vsync', 'vfr',
    'scenes/%d.jpg'
  ]);

  // Generate trailer
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-t', metadata.targetDuration.toString(),
    '-filter_complex', '[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]',
    '-map', '[v]',
    '-map', '[a]',
    'output.mp4'
  ]);

  const outputData = await ffmpeg.readFile('output.mp4');
  const outputBlob = new Blob([outputData], { type: 'video/mp4' });
  const outputUrl = URL.createObjectURL(outputBlob);

  return {
    title: metadata.title,
    genre: metadata.genre,
    duration: metadata.targetDuration,
    trailerUrl: outputUrl,
    timestamp: new Date().toISOString()
  };
}