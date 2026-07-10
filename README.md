<a href="https://www.sparse.in">
  <img src="rivo website/frontend/public/logo.png" alt="Sparse logo" width="95" />
</a>

# Rivo Agent Application

Rivo Agent is a local-first mobile AI assistant built with React Native. It helps users download a compatible GGUF language model, verify the model on-device, and run private chat inference locally through `llama.rn`.

The product is designed for offline conversations, coding help, brainstorming, compact local memory, and privacy-focused AI workflows where chat content does not need to be sent to a remote inference server.

> This repository is now public. This README documents the product, architecture, setup flow, and development workflow for maintainers.

## Current Platform Status

Rivo Agent is currently focused on Android.

- Android builds are supported and include native model-file utilities.
- iOS project files exist in the repository, but the production app flow is Android-first.
- Normal chat inference runs locally after a model is installed.
- Internet access is required for authentication, model catalog metadata, and initial model download.

## Product Flow

1. The app opens with a custom splash experience.
2. The home screen introduces Rivo as a private on-device assistant.
3. Users authenticate with Firebase Auth and Google Sign-In.
4. Onboarding detects the device name, RAM, and free storage.
5. Rivo recommends compatible GGUF models from the curated catalog.
6. The selected model downloads in the background with progress, speed, and notification support.
7. The native Android file module verifies that the downloaded file is readable, complete, and starts with GGUF magic bytes.
8. The model-ready screen confirms setup.
9. The chat workspace opens with local inference, local memory, and saved local threads.

## Core Features

- On-device AI chat powered by GGUF models and `llama.rn`.
- Curated model catalog with RAM and storage compatibility checks.
- Device-aware recommendation logic for lower-end and higher-end Android devices.
- Background model downloads with progress, speed tracking, notification text, and resume handling.
- Download verification using file size, readability, and GGUF header checks.
- Model migration from legacy external storage into the app's primary internal storage path.
- Local chat history with a maximum of seven saved threads.
- Local user memory and compacted conversation memory.
- Neural Panel for assistant name, personality, emoji behavior, user name, memory, performance mode, max tokens, and active context size.
- Streaming assistant responses with stop control.
- Code block rendering with dedicated copy controls.
- Message copy and native share actions.
- Professional alert system for confirmations, limits, setup state, logout, and destructive actions.
- Full local cleanup on logout, including local caches and downloaded model files.

## Privacy Model

Rivo is built around local execution.

- Model inference runs on the device after setup.
- Chat threads, assistant settings, memory, and model metadata are stored locally with `AsyncStorage`.
- Downloaded model files are stored in the Android app file directory.
- Chat responses do not require a remote LLM server during normal use.
- Firebase Auth is used for access control, not for chat inference.
- Logging out clears local app data and removes downloaded model files.

Local AI models can still produce incorrect or incomplete answers. Users should verify important information before relying on it.

## Model Catalog

Rivo currently supports a curated list of GGUF models hosted on Hugging Face.

| Model | File | Minimum RAM | Approx. Size |
| --- | --- | ---: | ---: |
| Qwen 2.5 0.5B | `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf` | Any | 0.40 GB |
| Llama 3.2 1B | `Llama-3.2-1B-Instruct-Q4_K_M.gguf` | 2 GB | 0.81 GB |
| Qwen 2.5 1.5B | `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` | 2 GB | 0.99 GB |
| Gemma 2B | `gemma-2-2b-it-IQ3_M.gguf` | 3 GB | 1.39 GB |
| Qwen 2.5 3B | `Qwen2.5-3B-Instruct-Q4_K_M.gguf` | 4 GB | 1.93 GB |
| Llama 3.2 3B | `Llama-3.2-3B-Instruct-Q4_K_M.gguf` | 4 GB | 2.02 GB |
| Phi 3.5 Mini | `Phi-3.5-mini-instruct-Q4_K_M.gguf` | 6 GB | 2.39 GB |
| Mistral 7B | `mistral-7b-instruct-v0.2.Q3_K_L.gguf` | 6 GB | 3.82 GB |
| Llama 3 8B | `Meta-Llama-3-8B-Instruct.Q3_K_L.gguf` | 8 GB | 4.32 GB |

Model files remain subject to the licenses and hosting terms of their original creators. Rivo does not own third-party model weights.

## Chat Workspace

The chat screen is the primary workspace for the app. It includes:

- Local model identity and private status messaging.
- Side menu with recent local threads.
- Fresh-thread creation with a seven-thread limit.
- Thread loading and deletion.
- Multiline composer with send and stop states.
- Auto-scroll behavior that respects manual scrolling.
- Keyboard-safe layout on Android.
- Response truncation warning when generation stops at the active token limit.
- Account/logout confirmation with local data cleanup.

## Neural Panel

The Neural Panel lets users tune the assistant without leaving the chat workspace.

- Assistant name.
- Assistant personality.
- Emoji quantity.
- User name.
- Long-term memory text.
- Performance Mode.
- Maximum generation tokens.
- Active context history size.
- Cache and context status display.

Changes are saved automatically in real time.

## Performance Mode

Performance Mode is intended for lower-end devices or users who want faster, lighter responses. When enabled, Rivo:

- Compacts memory sooner.
- Keeps fewer active messages in context.
- Caps output more conservatively.
- Uses a smaller runtime footprint.

Recommended defaults are calculated from device RAM.

## Technical Stack

| Area | Technology |
| --- | --- |
| Mobile app | React Native `0.85.3` |
| UI framework | React `19.2.3` |
| Language | TypeScript |
| Local inference | `llama.rn` |
| Authentication | Firebase Auth, Google Sign-In |
| Downloads | `@kesha-antonov/react-native-background-downloader` |
| Local storage | `@react-native-async-storage/async-storage` |
| Device checks | `react-native-device-info` |
| Navigation/layout safety | `react-native-safe-area-context`, `react-native-screens` |
| Icons | `lucide-react-native` |
| Website | React, Create React App |

## Project Structure

```text
.
|-- App.tsx                         Main app state machine and screen routing
|-- index.js                        React Native entry point
|-- src/
|   |-- assets/                     Fonts, icons, and app images
|   |-- components/                 Shared UI components
|   |-- data/modelCatalog.ts        Curated GGUF model catalog
|   |-- screens/                    Splash, auth, onboarding, download, ready, chat
|   |-- theme/colors.ts             Shared color tokens
|   `-- utils/modelInstallStatus.ts Model verification and install-state helpers
|-- android/                        Android native project and Kotlin modules
|-- ios/                            iOS native project scaffold
|-- __tests__/                      Jest tests
`-- rivo website/frontend/          Companion marketing website
```

## Native Android Modules

Rivo includes custom Kotlin modules under `android/app/src/main/java/com/rivoapp/`.

- `ModelFileModule.kt` exposes model directory constants, file info, GGUF header validation, file copy, and file deletion.
- `ClipboardModule.kt` provides native clipboard support for chat messages and code blocks.
- `ModelFilePackage.kt` registers the native modules with React Native.

The Android build also includes bundled GGML Hexagon assets under `android/app/src/main/assets/ggml-hexagon/`.

## Configuration Notes

Before running the app on a fresh machine, configure these project-specific values:

- Copy `android/app/google-services.example.json` to `android/app/google-services.json`.
- Replace the placeholder Firebase values with the real Firebase Android app configuration.
- Replace `YOUR_WEB_OAUTH_CLIENT_ID` in `src/screens/LoginScreen.tsx` with the Google web OAuth client id used by Firebase Auth.
- Make sure the Android package name in Firebase is `com.rivoapp`.
- Use your own release keystore before shipping a production APK. The current release build type still points to the debug keystore.

Do not commit private Firebase credentials, release keystores, or signing passwords.

## Available Scripts

From the repository root:

```bash
npm install
npm start
npm run android
npm run ios
npm run lint
npm test
```

Website scripts are available inside `rivo website/frontend/`:

```bash
npm install
npm start
npm run build
npm test
```

## Release Notes

The Android app is currently documented as version `1.0` in the native Gradle config. The latest documented APK release in the previous README was:

```text
https://github.com/sanketpadhyal/Rivo-Agent/releases/download/v1.0.0/rivo-agent.apk
```

Before publishing a new public release, update:

- `android/app/build.gradle` version code and version name.
- GitHub release tag and APK link.
- Firebase/Google configuration for the release package.
- Production signing configuration.
- This README release section.

## Source Status

Rivo Agent is a private repository maintained by the developer. This README may be shared to explain the product, architecture, and setup process, but the source code, app assets, and implementation details are not licensed for copying, redistribution, or commercial reuse.

## Developer

Developer: Sanket Padhyal  
Website: `https://www.sanketpadhyal.in`  
Support: `sanketpadhyal3@gmail.com`

## Disclaimer

Rivo runs local AI models that can produce incorrect, incomplete, or unexpected responses. Users should verify critical information before relying on any answer. Rivo does not claim ownership of third-party model weights, logos, names, or provider assets referenced by the application.

All rights reserved.

## Local Development Setup

Use this section to set up the codebase on your PC.

### 1. Install prerequisites

Install:

- Node.js `22.11.0` or newer.
- npm.
- Java Development Kit compatible with the Android Gradle Plugin.
- Android Studio.
- Android SDK Platform `36`.
- Android Build Tools `36.0.0`.
- Android NDK `27.1.12297006`.
- A physical Android device or Android emulator.
- CocoaPods and Xcode only if you plan to work on the iOS scaffold.

### 2. Clone the repository

```bash
git clone <repo-url>
cd "Rivo-Agent-Application"
```

If your folder path contains spaces, keep quotes around the path when using shell commands.

### 3. Install mobile dependencies

```bash
npm install
```

### 4. Add Firebase and Google Sign-In config

```bash
cp android/app/google-services.example.json android/app/google-services.json
```

Then edit `android/app/google-services.json` with the real Firebase project values and update the Google web OAuth client id in `src/screens/LoginScreen.tsx`.

### 5. Link font assets when needed

Fonts are configured in `react-native.config.js`:

```bash
npx react-native-asset
```

Run this only if fonts are not already present in the native asset folders.

### 6. Start Metro

```bash
npm start
```

Keep Metro running in one terminal.

### 7. Run the Android app

In a second terminal:

```bash
npm run android
```

For a production-style APK build:

```bash
cd android
./gradlew assembleRelease
```

The generated APK will be under `android/app/build/outputs/apk/release/`.

### 8. Run tests and checks

```bash
npm test
npm run lint
```

### 9. Run the companion website

```bash
cd "rivo website/frontend"
npm install
npm start
```

The website runs with Create React App and opens on the local development server printed by the terminal.
