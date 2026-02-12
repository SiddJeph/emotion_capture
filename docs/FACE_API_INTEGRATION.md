# 🎭 Face-API.js Integration Documentation

## Complete Guide to Facial Emotion Detection in the Platform

This document provides a comprehensive explanation of how **face-api.js** is integrated into the AI Emotional Intelligence Assessment Platform for real-time facial expression recognition.

---

## 📁 Related Files

```
src/
├── lib/face-api/
│   ├── loader.ts         # Model loading utilities
│   └── detector.ts       # Face detection & emotion extraction
│
├── components/
│   ├── ModelLoader.tsx        # Loading screen with progress
│   ├── CalibrationScreen.tsx  # Face calibration & detection check
│   └── AssessmentEngine.tsx   # Real-time emotion capture
│
public/
└── models/                    # Neural network model files
    ├── tiny_face_detector_model-shard1
    ├── tiny_face_detector_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_expression_model-shard1
    └── face_expression_model-weights_manifest.json
```

---

## 🧠 What is face-api.js?

**face-api.js** is a JavaScript library built on top of TensorFlow.js that provides:

- **Face Detection**: Locating faces in images/video
- **Face Landmark Detection**: Finding 68 facial keypoints
- **Face Expression Recognition**: Classifying 7 emotions
- **Face Recognition**: Identifying individuals (not used in this project)

### Why face-api.js?

| Feature | Benefit |
|---------|---------|
| **Browser-based** | No server required, runs entirely client-side |
| **Privacy-first** | Webcam data never leaves the user's device |
| **TensorFlow.js** | GPU acceleration via WebGL |
| **Pre-trained models** | Ready to use without ML expertise |
| **Real-time** | 20-30ms per detection with TinyFaceDetector |

---

## 🔧 Neural Network Models

The platform uses 3 neural network models:

### 1. TinyFaceDetector

```
Model: tiny_face_detector
Size: ~190 KB
Architecture: MobileNetV1
```

**Purpose**: Detect face bounding boxes in video frames

**Why TinyFaceDetector over SSD MobileNet?**
- **Speed**: ~20-30ms vs ~200ms per detection
- **Size**: 190KB vs 5.4MB
- **Trade-off**: Slightly less accurate, but sufficient for frontal faces

**Configuration**:
```typescript
new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,      // Input resolution (128, 160, 224, 320, 416, 512, 608)
  scoreThreshold: 0.5, // Minimum confidence to consider a detection
})
```

| Input Size | Speed | Accuracy |
|------------|-------|----------|
| 128 | Fastest | Lowest |
| 320 | **Balanced** | **Good** |
| 608 | Slowest | Highest |

### 2. FaceLandmark68Net

```
Model: face_landmark_68
Size: ~350 KB
Output: 68 facial keypoints
```

**Purpose**: Detect facial landmarks for expression analysis

**68 Landmark Points**:
```
          ┌─────────────────────────────────────┐
          │    17-21: Left Eyebrow              │
          │    22-26: Right Eyebrow             │
          │    27-35: Nose                      │
          │    36-41: Left Eye                  │
          │    42-47: Right Eye                 │
          │    48-67: Mouth (outer + inner)     │
          │    0-16:  Jaw/Face Contour          │
          └─────────────────────────────────────┘

                    17─18─19─20─21   22─23─24─25─26
                        ╲    ╱           ╲    ╱
                 ┌───────╲──╱─────────────╲──╱───────┐
           0 ────│    36-37-38-39    42-43-44-45     │──── 16
            ╲    │       40-41          46-47        │    ╱
             1 ──│           ╲            ╱          │── 15
              ╲  │            27                     │  ╱
               2 │            28                     │ 14
                ╲│        29 30 31                   │╱
                 3       32 33 34 35                13
                  ╲          │                     ╱
                   4         │                    12
                    ╲    48-49-50-51-52          ╱
                     5  60  61 62 63   53      11
                      ╲ 67 64 65 66   54     ╱
                       6  59-58-57-56-55   10
                        ╲                 ╱
                         7───8───9───────
```

### 3. FaceExpressionNet

```
Model: face_expression
Size: ~1.3 MB
Architecture: Mini-Xception
Output: 7 emotion probabilities
```

**Purpose**: Classify facial expressions into 7 emotions

**Emotion Classes**:
| Emotion | Description | Facial Features |
|---------|-------------|-----------------|
| 😊 happy | Joy, pleasure | Raised cheeks, smile, crow's feet |
| 😢 sad | Sorrow, grief | Drooping mouth, furrowed brow |
| 😠 angry | Anger, frustration | Lowered brows, tense jaw |
| 😨 fearful | Fear, anxiety | Wide eyes, raised brows |
| 🤢 disgusted | Disgust, distaste | Wrinkled nose, raised upper lip |
| 😲 surprised | Surprise, shock | Raised eyebrows, open mouth |
| 😐 neutral | No emotion | Relaxed features |

**Output Format**:
```typescript
{
  happy: 0.02,
  sad: 0.01,
  angry: 0.005,
  fearful: 0.01,
  disgusted: 0.005,
  surprised: 0.03,
  neutral: 0.92   // Sum = 1.0 (softmax)
}
```

---

## 📦 Model Loading

### File: `src/lib/face-api/loader.ts`

```typescript
import * as faceapi from 'face-api.js'

export const MODEL_URL = '/models'

export type ModelLoadingProgress = {
  tinyFaceDetector: boolean
  faceLandmark68Net: boolean
  faceExpressionNet: boolean
}

export async function loadFaceApiModels(
  onProgress?: (progress: ModelLoadingProgress) => void
): Promise<void> {
  const progress: ModelLoadingProgress = {
    tinyFaceDetector: false,
    faceLandmark68Net: false,
    faceExpressionNet: false,
  }

  // Load TinyFaceDetector (~190KB)
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
  progress.tinyFaceDetector = true
  onProgress?.(progress)

  // Load FaceLandmark68Net (~350KB)
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
  progress.faceLandmark68Net = true
  onProgress?.(progress)

  // Load FaceExpressionNet (~1.3MB)
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
```

### Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MODEL LOADING FLOW                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Component mounts (ModelLoader.tsx)                        │
│    useEffect(() => loadFaceApiModels(setProgress))          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Load TinyFaceDetector                                     │
│    GET /models/tiny_face_detector_model-weights_manifest.json│
│    GET /models/tiny_face_detector_model-shard1              │
│    ✓ Update progress: { tinyFaceDetector: true }            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Load FaceLandmark68Net                                    │
│    GET /models/face_landmark_68_model-weights_manifest.json │
│    GET /models/face_landmark_68_model-shard1                │
│    ✓ Update progress: { faceLandmark68Net: true }           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Load FaceExpressionNet                                    │
│    GET /models/face_expression_model-weights_manifest.json  │
│    GET /models/face_expression_model-shard1                 │
│    ✓ Update progress: { faceExpressionNet: true }           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Loading Complete                                          │
│    onLoaded() → Navigate to CalibrationScreen               │
└─────────────────────────────────────────────────────────────┘
```

### Browser Caching

Models are cached by the browser:
- **First visit**: ~1.8MB download
- **Subsequent visits**: Loaded from cache (~100ms)

---

## 🎥 Face Detection

### File: `src/lib/face-api/detector.ts`

```typescript
import * as faceapi from 'face-api.js'
import { EmotionType, EmotionDataPoint } from '../supabase/types'

export interface DetectionResult {
  detected: boolean
  expressions: Record<EmotionType, number> | null
  dominantEmotion: EmotionType | null
  confidence: number
  faceBox: {
    x: number
    y: number
    width: number
    height: number
  } | null
}

export async function detectFace(
  videoElement: HTMLVideoElement
): Promise<DetectionResult> {
  try {
    // Run face detection pipeline
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      }))
      .withFaceLandmarks()
      .withFaceExpressions()

    // Handle no face detected
    if (!detection) {
      return {
        detected: false,
        expressions: null,
        dominantEmotion: null,
        confidence: 0,
        faceBox: null,
      }
    }

    // Extract expression scores
    const expressions: Record<EmotionType, number> = {
      happy: detection.expressions.happy,
      sad: detection.expressions.sad,
      angry: detection.expressions.angry,
      fearful: detection.expressions.fearful,
      disgusted: detection.expressions.disgusted,
      surprised: detection.expressions.surprised,
      neutral: detection.expressions.neutral,
    }

    // Find dominant emotion (highest probability)
    let dominantEmotion: EmotionType = 'neutral'
    let maxConfidence = 0

    for (const [emotion, confidence] of Object.entries(expressions)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence
        dominantEmotion = emotion as EmotionType
      }
    }

    // Get face bounding box
    const box = detection.detection.box

    return {
      detected: true,
      expressions,
      dominantEmotion,
      confidence: maxConfidence,
      faceBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
    }
  } catch (error) {
    console.error('Face detection error:', error)
    return {
      detected: false,
      expressions: null,
      dominantEmotion: null,
      confidence: 0,
      faceBox: null,
    }
  }
}
```

### Detection Pipeline

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        FACE DETECTION PIPELINE                             │
└───────────────────────────────────────────────────────────────────────────┘

  Video Frame (HTMLVideoElement)
         │
         ▼
┌─────────────────────────┐
│   1. FACE DETECTION     │
│   ─────────────────     │
│   TinyFaceDetector      │
│                         │
│   Input: 640×480 frame  │
│   Process:              │
│   • Resize to 320×320   │
│   • Run CNN inference   │
│   • NMS filtering       │
│                         │
│   Output: Face box      │
│   { x, y, w, h, score } │
│                         │
│   Time: ~20-30ms        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  2. LANDMARK DETECTION  │
│  ─────────────────────  │
│  FaceLandmark68Net      │
│                         │
│  Input: Cropped face    │
│  Process:               │
│  • Align face region    │
│  • Extract features     │
│  • Regress 68 points    │
│                         │
│  Output: 68 landmarks   │
│  [{x, y}, {x, y}, ...]  │
│                         │
│  Time: ~10-15ms         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. EXPRESSION ANALYSIS  │
│ ─────────────────────── │
│ FaceExpressionNet       │
│                         │
│ Input: Aligned face     │
│ Process:                │
│ • Extract features      │
│ • Mini-Xception CNN     │
│ • Softmax output        │
│                         │
│ Output: 7 probabilities │
│ { happy: 0.02,          │
│   neutral: 0.92, ... }  │
│                         │
│ Time: ~15-20ms          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   4. POST-PROCESSING    │
│   ─────────────────     │
│   JavaScript            │
│                         │
│   • Find max emotion    │
│   • Package results     │
│   • Return to app       │
│                         │
│   Time: <1ms            │
└────────────┬────────────┘
             │
             ▼

  DetectionResult
  {
    detected: true,
    expressions: {
      happy: 0.02,
      neutral: 0.92,
      ...
    },
    dominantEmotion: 'neutral',
    confidence: 0.92,
    faceBox: { x, y, width, height }
  }

  Total Pipeline Time: ~50-70ms
  (Can run at ~15-20 FPS)
```

---

## 📸 Webcam Integration

### Accessing the Camera

```typescript
// Request webcam access
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user',  // Front camera
  },
})

// Attach to video element
videoRef.current.srcObject = stream

// Wait for video to be ready
await new Promise<void>((resolve) => {
  video.addEventListener('canplay', () => resolve(), { once: true })
})

// Start playback
await videoRef.current.play()
```

### Camera Error Handling

| Error Name | Cause | User Message |
|------------|-------|--------------|
| `NotAllowedError` | Permission denied | "Camera permission denied. Please allow access." |
| `NotFoundError` | No camera available | "No camera found. Please connect a camera." |
| `NotReadableError` | Camera in use | "Camera is in use by another application." |
| `OverconstrainedError` | Constraints not met | Falls back to basic constraints |
| `AbortError` | Request aborted | "Camera access was aborted." |

---

## 🎯 Calibration Screen

### Purpose

Before starting the assessment, ensure:
1. ✅ Camera permissions granted
2. ✅ Face is visible and detectable
3. ✅ Detection is stable (10 consecutive detections)

### Implementation

```typescript
// CalibrationScreen.tsx

const REQUIRED_DETECTIONS = 10  // Stability threshold

// Detection loop (runs every 100ms)
const runDetection = useCallback(async () => {
  if (!videoRef.current || !cameraReady) return

  const result = await detectFace(videoRef.current)
  setDetectionResult(result)
  setFaceDetected(result.detected)

  if (result.detected) {
    setConsecutiveDetections(prev => {
      const newCount = prev + 1
      if (newCount >= REQUIRED_DETECTIONS && !isCalibrated) {
        setIsCalibrated(true)  // Ready to proceed!
      }
      return newCount
    })
  } else {
    setConsecutiveDetections(0)  // Reset on detection loss
  }

  // Draw face overlay on canvas
  drawFaceBox(canvasRef.current, result)
}, [cameraReady, isCalibrated])

// Start loop when camera ready
useEffect(() => {
  if (cameraReady) {
    const interval = setInterval(runDetection, 100)  // 10 FPS
    return () => clearInterval(interval)
  }
}, [cameraReady, runDetection])
```

### Visual Feedback

```
┌───────────────────────────────────────────────┐
│                                               │
│   ┌───────────────────────────────────┐       │
│   │                                   │       │
│   │         Webcam Feed               │       │
│   │                                   │       │
│   │      ╭─────────────────╮          │       │
│   │      │                 │          │       │
│   │      │   Face Box      │ ← Glowing border │
│   │      │                 │   (purple → blue │
│   │      ╰─────────────────╯   when calibrated)│
│   │                                   │       │
│   │  [Detecting...] or [Calibrated]   │       │
│   └───────────────────────────────────┘       │
│                                               │
│   ────────────────────────────────────        │
│   Calibration Progress: [████████░░] 80%      │
│                                               │
│   ☑ Camera access granted                     │
│   ☑ Face detected                             │
│   ☐ Calibration complete                      │
│                                               │
│   ┌─────────────────────────────────────┐     │
│   │        Start Assessment              │    │
│   │        (disabled until calibrated)   │    │
│   └─────────────────────────────────────┘     │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 🎬 Assessment Engine (Real-time Capture)

### Purpose

Capture emotion data points every 200ms while the stimulus video plays.

### Implementation

```typescript
// AssessmentEngine.tsx

const CAPTURE_INTERVAL = 200  // 5 captures per second

// Capture emotion data point
const captureEmotion = useCallback(async () => {
  if (!webcamRef.current || !webcamReady) return

  const result = await detectFace(webcamRef.current)
  setCurrentDetection(result)

  if (result.detected && result.expressions && result.dominantEmotion) {
    const captureTime = videoRef.current?.currentTime ?? 0
    
    const dataPoint: EmotionDataPoint = {
      time: captureTime,                    // Video timestamp
      emotion: result.dominantEmotion,      // Dominant emotion
      confidence: result.confidence,        // Detection confidence
      allEmotions: result.expressions,      // All 7 emotion scores
    }
    
    console.log('Captured:', dataPoint.emotion, 'at', captureTime.toFixed(2))
    setTimeline(prev => [...prev, dataPoint])
  }
}, [webcamReady])

// Capture loop (runs while video is playing)
useEffect(() => {
  if (isPlaying && webcamReady && !isAssessmentComplete) {
    const interval = setInterval(captureEmotion, CAPTURE_INTERVAL)
    return () => clearInterval(interval)
  }
}, [isPlaying, webcamReady, captureEmotion, isAssessmentComplete])
```

### Data Capture Timeline

```
Video Timeline:
    0s        5s        10s       15s       20s       25s       30s
    ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
    │         │         │         │         │         │         │
    │ Scene 1 │ Scene 2 │ Scene 3 │ Scene 4 │ Scene 5 │ Scene 6 │
    │         │         │         │         │         │         │

Emotion Capture (every 200ms):
    ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●
    └─────────────────────────────────────────────────────────────────┘
                        ~150 data points over 30 seconds

Sample Data Points:
    [0.2s]  😐 neutral   (87%)
    [0.4s]  😐 neutral   (85%)
    [0.6s]  😊 happy     (72%)  ← Scene change
    [0.8s]  😊 happy     (78%)
    [1.0s]  😊 happy     (81%)
    [1.2s]  😐 neutral   (69%)
    ...
```

### Video Synchronization

The key challenge: **synchronize emotion capture with video playback**

```typescript
// Problem: closure captures stale time value
setInterval(() => {
  const time = videoRef.current.currentTime  // ❌ May be stale
  capture(time)
}, 200)

// Solution: Use ref to track current time
const currentTimeRef = useRef(0)

// Update ref on every time change
const handleTimeUpdate = () => {
  currentTimeRef.current = videoRef.current.currentTime
}

// Capture uses latest time from ref
const captureEmotion = useCallback(async () => {
  const captureTime = videoRef.current?.currentTime ?? currentTimeRef.current
  // Use captureTime...
}, [])
```

---

## 🖼️ Canvas Overlay

### Drawing Face Detection Box

```typescript
function drawFaceBox(canvas: HTMLCanvasElement, result: DetectionResult) {
  const ctx = canvas.getContext('2d')
  if (!ctx || !result.faceBox) return
  
  const { x, y, width, height } = result.faceBox
  const color = EMOTION_COLORS[result.dominantEmotion || 'neutral']
  
  // Clear previous frame
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Set glow effect
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  
  // Draw rounded rectangle
  const radius = 10
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.stroke()
  
  // Draw corner accents
  const cornerLength = 15
  ctx.lineWidth = 3
  ctx.shadowBlur = 15
  
  // Top-left corner
  ctx.beginPath()
  ctx.moveTo(x, y + cornerLength)
  ctx.lineTo(x, y)
  ctx.lineTo(x + cornerLength, y)
  ctx.stroke()
  
  // ... repeat for other corners
}
```

### Emotion-Colored Overlay

```typescript
const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#fcd34d',     // Yellow
  sad: '#60a5fa',       // Blue
  angry: '#f87171',     // Red
  fearful: '#a78bfa',   // Purple
  disgusted: '#4ade80', // Green
  surprised: '#f472b6', // Pink
  neutral: '#94a3b8',   // Gray
}
```

Visual result:
```
┌─────────────────────────────────┐
│                                 │
│   ╭───────────────────────╮     │
│   │                       │     │
│   │   User's face         │ ← Yellow glow = happy
│   │                       │     │
│   │   😊 HAPPY (78%)      │     │
│   ╰───────────────────────╯     │
│                                 │
└─────────────────────────────────┘
```

---

## 📊 Output Data Structure

### Single Data Point

```typescript
interface EmotionDataPoint {
  time: number           // Video timestamp in seconds
  emotion: EmotionType   // 'happy' | 'sad' | 'angry' | ...
  confidence: number     // 0.0 - 1.0
  allEmotions: {
    happy: number
    sad: number
    angry: number
    fearful: number
    disgusted: number
    surprised: number
    neutral: number
  }
}
```

### Example Timeline Output

```json
{
  "timeline": [
    {
      "time": 0.2,
      "emotion": "neutral",
      "confidence": 0.87,
      "allEmotions": {
        "happy": 0.05,
        "sad": 0.02,
        "angry": 0.01,
        "fearful": 0.01,
        "disgusted": 0.01,
        "surprised": 0.03,
        "neutral": 0.87
      }
    },
    {
      "time": 0.4,
      "emotion": "neutral",
      "confidence": 0.85,
      "allEmotions": { ... }
    },
    {
      "time": 0.6,
      "emotion": "happy",
      "confidence": 0.72,
      "allEmotions": {
        "happy": 0.72,
        "sad": 0.01,
        "angry": 0.02,
        "fearful": 0.01,
        "disgusted": 0.01,
        "surprised": 0.08,
        "neutral": 0.15
      }
    },
    // ... 150+ more data points
  ],
  "summary": {
    "dominantEmotion": "neutral",
    "averageConfidence": 0.78,
    "emotionDistribution": {
      "happy": 0.25,
      "neutral": 0.65,
      "surprised": 0.05,
      "sad": 0.03,
      "angry": 0.01,
      "fearful": 0.01,
      "disgusted": 0.00
    },
    "totalDataPoints": 152,
    "duration": 30.4
  }
}
```

---

## ⚡ Performance Optimization

### Detection Rate

| Setting | Detection Interval | FPS | Use Case |
|---------|-------------------|-----|----------|
| Fast | 100ms | 10 | Calibration |
| **Balanced** | **200ms** | **5** | **Assessment** |
| Slow | 500ms | 2 | Low-end devices |

### Input Size Optimization

```typescript
// TinyFaceDetector options
new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,      // Lower = faster, less accurate
  scoreThreshold: 0.5, // Higher = fewer false positives
})
```

### Webcam Resolution

```typescript
// Lower resolution for faster processing
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 320 },   // Down from 640
    height: { ideal: 240 },  // Down from 480
  },
})
```

### GPU Acceleration

face-api.js automatically uses WebGL when available:
```
TensorFlow.js Backend:
  ✓ WebGL (GPU) - Default, fastest
  ○ WASM - Fallback
  ○ CPU - Last resort
```

---

## 🔍 Debugging

### Enable Console Logging

```typescript
// detector.ts
console.log('Captured emotion:', dataPoint.emotion, 'at time:', captureTime.toFixed(2))

// Output:
// Captured emotion: neutral at time: 0.20
// Captured emotion: neutral at time: 0.40
// Captured emotion: happy at time: 0.60
```

### Check Model Loading

```typescript
import * as faceapi from 'face-api.js'

console.log('Models loaded:', {
  tinyFaceDetector: faceapi.nets.tinyFaceDetector.isLoaded,
  faceLandmark68Net: faceapi.nets.faceLandmark68Net.isLoaded,
  faceExpressionNet: faceapi.nets.faceExpressionNet.isLoaded,
})
```

### Network Tab Verification

```
Chrome DevTools → Network → Filter: "model"

Requests:
  ✓ tiny_face_detector_model-weights_manifest.json (200)
  ✓ tiny_face_detector_model-shard1 (200)
  ✓ face_landmark_68_model-weights_manifest.json (200)
  ✓ face_landmark_68_model-shard1 (200)
  ✓ face_expression_model-weights_manifest.json (200)
  ✓ face_expression_model-shard1 (200)
```

---

## 🛡️ Privacy & Security

### Data Stays Local

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │  Webcam  │───▶│ face-api │───▶│  React   │               │
│  │  Stream  │    │   (ML)   │    │   State  │               │
│  └──────────┘    └──────────┘    └──────────┘               │
│                                        │                     │
│                                        ▼                     │
│                               ┌──────────────┐              │
│                               │ Emotion Data │              │
│                               │   (JSON)     │              │
│                               └──────────────┘              │
│                                        │                     │
│                                        │ Only JSON sent      │
│                                        ▼ (no video/images)   │
└────────────────────────────────────────┼────────────────────┘
                                         │
                                         ▼
                                    ┌─────────┐
                                    │ Server  │
                                    │  API    │
                                    └─────────┘

✓ Video frames are NEVER transmitted
✓ ML inference runs ENTIRELY in browser
✓ Only emotion scores are saved
✓ No facial images stored
```

### Webcam Cleanup

```typescript
// Always stop webcam tracks on unmount
useEffect(() => {
  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }
}, [])
```

---

## 📚 References

- **face-api.js**: https://github.com/justadudewhohacks/face-api.js
- **TensorFlow.js**: https://www.tensorflow.org/js
- **Paper - MobileNets**: https://arxiv.org/abs/1704.04861
- **Paper - Mini-Xception**: https://arxiv.org/abs/1710.07557
- **Ekman's Basic Emotions**: https://www.paulekman.com/universal-emotions/

---

## Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| **loader.ts** | face-api.js | Load neural network models from /models |
| **detector.ts** | face-api.js | Run face detection + emotion classification |
| **ModelLoader.tsx** | React | Display loading progress UI |
| **CalibrationScreen.tsx** | React + Canvas | Face calibration & detection check |
| **AssessmentEngine.tsx** | React + Canvas | Real-time emotion capture during video |

The entire face detection pipeline runs **client-side** using GPU-accelerated TensorFlow.js, ensuring privacy while providing real-time emotion analysis at **5 captures per second**.

