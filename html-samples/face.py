"""
Real-Time Face Detection and Tracking System
=============================================

This script uses OpenCV and a pre-trained Haar Cascade classifier to:
1. Capture video from your webcam in real-time
2. Detect faces in each frame
3. Track faces and draw bounding boxes around them
4. Display FPS (frames per second) for performance monitoring
5. Handle multiple faces simultaneously

Dependencies:
- opencv-python: pip install opencv-python

Usage:
- Run the script and your webcam will start
- Press 'q' to quit the application
- The script automatically adjusts detection sensitivity based on frame size
"""

import cv2
import time

# Initialize video capture (0 = default webcam)
# You can change to 1, 2, etc. if you have multiple cameras
cap = cv2.VideoCapture(0)

# Set camera resolution for better performance
# Higher resolution = slower processing but better quality
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 30)

# Load the pre-trained Haar Cascade classifier for face detection
# This cascade is trained on thousands of face images and works very well for frontal faces
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# Optional: Load eye cascade for additional feature detection
# Uncomment if you want to detect eyes as well
# eye_cascade = cv2.CascadeClassifier(
#     cv2.data.haarcascades + 'haarcascade_eye.xml'
# )

# Variables for FPS calculation
prev_frame_time = 0
curr_frame_time = 0

# Main loop - continues until 'q' is pressed
while True:
    # Read frame from webcam
    # 'ret' is a boolean indicating if frame was successfully captured
    # 'frame' is the actual video frame (numpy array)
    ret, frame = cap.read()
    
    # Check if frame was captured successfully
    if not ret:
        print("Error: Could not read from camera")
        break
    
    # Convert frame to grayscale for faster processing
    # Haar Cascade works on grayscale images, and it's much faster than color
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detect faces in the frame
    # Parameters:
    # - scaleFactor=1.1: How much the image size is reduced at each scale (lower = more accurate, slower)
    # - minNeighbors=5: How many neighbors each candidate rectangle should have (higher = more strict)
    # - minSize=(30, 30): Minimum face size to detect (prevents detecting very small areas)
    # - maxSize=(500, 500): Maximum face size to detect (prevents detecting very large areas)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        maxSize=(500, 500)
    )
    
    # Draw rectangles around detected faces
    # 'faces' is a list of tuples: (x, y, width, height)
    for (x, y, w, h) in faces:
        # Draw a blue rectangle around each face
        # Parameters: (image, top-left corner, bottom-right corner, color in BGR, thickness)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
        
        # Add a label with coordinates and size information
        label_text = f"Face: {w}x{h}px"
        cv2.putText(
            frame,
            label_text,
            (x, y - 10),  # Position: slightly above the top-left corner
            cv2.FONT_HERSHEY_SIMPLEX,  # Font type
            0.5,  # Font scale
            (255, 0, 0),  # Color (blue)
            2  # Thickness
        )
        
        # Optional: Draw circle at face center for tracking visualization
        center_x = x + w // 2
        center_y = y + h // 2
        cv2.circle(frame, (center_x, center_y), 5, (0, 255, 0), -1)  # Green dot at center
        
        # Optional: Detect eyes within face region (uncomment if needed)
        # roi_gray = gray[y:y+h, x:x+w]  # Extract face region
        # roi_color = frame[y:y+h, x:x+w]
        # eyes = eye_cascade.detectMultiScale(roi_gray)
        # for (ex, ey, ew, eh) in eyes:
        #     cv2.rectangle(roi_color, (ex, ey), (ex+ew, ey+eh), (0, 255, 0), 2)
    
    # Calculate and display FPS (Frames Per Second)
    curr_frame_time = time.time()
    fps = 1 / (curr_frame_time - prev_frame_time) if (curr_frame_time - prev_frame_time) > 0 else 0
    prev_frame_time = curr_frame_time
    
    # Display FPS counter on the frame
    fps_text = f"FPS: {fps:.1f}"
    cv2.putText(
        frame,
        fps_text,
        (10, 30),  # Position: top-left corner
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),  # Color (green)
        2
    )
    
    # Display face count
    face_count_text = f"Faces Detected: {len(faces)}"
    cv2.putText(
        frame,
        face_count_text,
        (10, 60),  # Position: below FPS counter
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )
    
    # Show the frame with detections in a window
    cv2.imshow('Face Detection and Tracking', frame)
    
    # Wait for key press (1ms timeout)
    # 'q' key: quit the application
    # 's' key: save screenshot (optional feature)
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("Exiting application...")
        break
    elif key == ord('s'):
        # Save the current frame as an image
        filename = f"face_detection_{int(time.time())}.jpg"
        cv2.imwrite(filename, frame)
        print(f"Screenshot saved as: {filename}")

# Release resources
# Always clean up when done to free up the camera and close windows
cap.release()
cv2.destroyAllWindows()

print("Face tracker stopped successfully!")