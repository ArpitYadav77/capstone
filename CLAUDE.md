# NEO / DeskRobo

## Project
AI-powered smart desk companion.

## Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js
- Express
- MongoDB
- Gemini API
- Python/OpenCV/MediaPipe for computer vision
- ESP32 for hardware communication

## Frontend rules
- Preserve existing DeskRobo design.
- Do not rewrite existing architecture unnecessarily.
- Reuse existing components and services.
- Use Motion for subtle animations.
- Use Lucide React for icons.
- Keep UI responsive and accessible.
- Avoid excessive animations.

## Backend rules
- API keys stay server-side.
- Never expose Gemini or MongoDB credentials to frontend.
- Use MongoDB connection pooling/reusable client.
- Keep Gemini logic in backend.
- Do not send continuous webcam video to Gemini.

## Computer vision
- Use OpenCV + MediaPipe.
- Do not train custom CNNs.
- Do not use Kaggle datasets for V1.
- Use rule/heuristic-based attention scoring.
- Treat stress/fatigue as behavioral indicators, not medical diagnosis.

## Development
- Inspect existing code before creating new files.
- Prefer modifying/reusing existing services.
- Avoid unnecessary dependencies.
- Run build/type checks after changes.
