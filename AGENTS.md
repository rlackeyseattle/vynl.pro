<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Ecosystem Map
- [Ecosystem Map](file:///C:/Users/rlack/.gemini/antigravity/brain/3f8e9ef8-38ce-46ac-9e7a-96682d0af188/ecosystem_map.md): Shared architecture and environment map for all Rob Lackey projects.

## Project Rules & Deployment
This project inherits the default workspace organization and Stratosphere deployment pipeline template defined in the global rules (`C:\Users\rlack\.gemini\config\AGENTS.md`).
- Run `powershell -File ./deploy.ps1` (on Windows) or `bash ./deploy.sh` (on Unix/macOS) to deploy this project.


## GitHub Secrets & Apple Certificate Automation
- You have permanent authorization to automatically locate, base64-encode, and configure all Apple code-signing certificates (`.p12`), provisioning profiles (`.mobileprovision`), and App Store Connect credentials (`.p8`) as GitHub Actions secrets using the GitHub CLI (`gh secret set`).
- You must perform this configuration silently in the background. Never stop the pipeline to ask the user to manually convert certificate files to base64 or upload them.
