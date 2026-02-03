#!/bin/bash

# Generate a 5-second test video using FFmpeg
# This creates a simple colored video with a moving pattern

OUTPUT_DIR="$(dirname "$0")"
OUTPUT_FILE="$OUTPUT_DIR/sample.mp4"

echo "Generating test video..."

ffmpeg -f lavfi -i testsrc=duration=5:size=640x480:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=5 \
  -c:v libx264 -pix_fmt yuv420p -crf 23 \
  -c:a aac -b:a 128k \
  -y "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo "Test video created successfully: $OUTPUT_FILE"
  ls -lh "$OUTPUT_FILE"
else
  echo "Failed to generate test video"
  exit 1
fi
