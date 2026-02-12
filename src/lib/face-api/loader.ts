import * as faceapi from 'face-api.js'

export type ModelLoadingProgress = {
  tinyFaceDetector: boolean
  faceLandmark68Net: boolean
  faceExpressionNet: boolean
}

export const MODEL_URL = '/models'

export async function loadFaceApiModels(
  onProgress?: (progress: ModelLoadingProgress) => void
): Promise<void> {
  const progress: ModelLoadingProgress = {
    tinyFaceDetector: false,
    faceLandmark68Net: false,
    faceExpressionNet: false,
  }

  // Load TinyFaceDetector
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
  progress.tinyFaceDetector = true
  onProgress?.(progress)

  // Load FaceLandmark68Net
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
  progress.faceLandmark68Net = true
  onProgress?.(progress)

  // Load FaceExpressionNet
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  progress.faceExpressionNet = true
  onProgress?.(progress)
}

export function areModelsLoaded(): boolean {
  return (
    faceapi.nets.tinyFaceDetector.isLoaded &&
    faceapi.nets.faceLandmark68Net.isLoaded &&
    faceapi.nets.faceExpressionNet.isLoaded
  )
}




