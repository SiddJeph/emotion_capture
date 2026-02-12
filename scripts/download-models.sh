#!/bin/bash

# Download face-api.js models
# Run this script before starting the app

MODEL_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p $MODEL_DIR

echo "Downloading face-api.js models..."

# Tiny Face Detector
echo "-> Downloading tinyFaceDetector..."
curl -s -o "$MODEL_DIR/tiny_face_detector_model-shard1" "$BASE_URL/tiny_face_detector_model-shard1"
curl -s -o "$MODEL_DIR/tiny_face_detector_model-weights_manifest.json" "$BASE_URL/tiny_face_detector_model-weights_manifest.json"

# Face Landmark 68 Net
echo "-> Downloading faceLandmark68Net..."
curl -s -o "$MODEL_DIR/face_landmark_68_model-shard1" "$BASE_URL/face_landmark_68_model-shard1"
curl -s -o "$MODEL_DIR/face_landmark_68_model-weights_manifest.json" "$BASE_URL/face_landmark_68_model-weights_manifest.json"

# Face Expression Net
echo "-> Downloading faceExpressionNet..."
curl -s -o "$MODEL_DIR/face_expression_model-shard1" "$BASE_URL/face_expression_model-shard1"
curl -s -o "$MODEL_DIR/face_expression_model-weights_manifest.json" "$BASE_URL/face_expression_model-weights_manifest.json"

echo "✓ All models downloaded successfully!"
echo "Models saved to: $MODEL_DIR"




