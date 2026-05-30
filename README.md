<p align="center">
  <img src="logo.png" alt="iClora logo" width="96" />
</p>

# Rivo Agent Application

Rivo Agent is a private, local-first mobile AI assistant built to run compact language models directly on a user's device. It is designed for fast offline conversations, local memory, coding help, and private on-device reasoning without sending chat content to a remote inference server.

This repository is private. This README is public product documentation only.

## What Rivo Does

Rivo turns a phone into a small offline AI workstation. The app helps users choose a compatible GGUF model, downloads it to local device storage, verifies the model file, and then runs chat inference locally through `llama.rn`.

After setup, the main chat experience works without cloud model calls. The user can ask questions, write code, brainstorm, copy answers, share responses, and keep short local memory across sessions.

## Core Features

- On-device AI chat powered by local GGUF models.
- Offline-first conversation flow after model installation.
- Device-aware model selection based on RAM and storage.
- Background model downloads with progress, speed, and resume handling.
- Local chat history with a maximum of 7 saved threads.
- Local memory for user facts, preferences, and names.
- Neural Panel for assistant name, personality, emoji usage, token limits, context size, and performance mode.
- Automatic real-time save for Neural Panel changes.
- Context compaction for long chats to reduce memory pressure.
- Streaming replies with thinking trace and smooth auto-scroll.
- Code block rendering with copy controls.
- Message copy and share actions.
- Professional local alert system for confirmations, limits, model status, and destructive actions.
- Logout confirmation that resets local app state and requires setup again.

## Privacy Model

Rivo is built around local execution.

- Chat inference runs on the device after a model is downloaded.
- Chat history and memory are stored locally with `AsyncStorage`.
- Downloaded model metadata is stored locally.
- The app does not need a remote LLM server for normal chat replies.
- Authentication is used for app access, while the assistant conversation is handled locally.
- Logging out clears local app storage and resets the onboarding/model setup flow.

Local AI can still make mistakes. Users should verify important answers.

## Model System

Rivo currently supports a curated catalog of GGUF models hosted on Hugging Face. The app checks the device RAM and available storage before recommending or allowing downloads.

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

Model files remain subject to their original creators' licenses and Hugging Face hosting terms. Rivo is not the owner of third-party model weights.

## App Flow

1. Splash screen introduces the app.
2. Home screen presents Rivo Agent as on-device intelligence.
3. Login screen allows the user to continue into setup.
4. Onboarding detects the device name, RAM, and storage.
5. The user chooses a supported model from the catalog.
6. Download screen installs and verifies the selected model.
7. Model Ready screen confirms local setup and privacy points.
8. Chat screen opens the offline assistant experience.

## Chat Experience

The chat screen is the main workspace. It includes:

- Header with model identity and info/context controls.
- Local thread history in the side menu.
- Fresh thread creation with a 7-thread limit.
- Guest profile row with logout confirmation.
- Private offline status messaging.
- Auto-scroll behavior that respects manual scrolling.
- Android keyboard and navigation-safe composer positioning.
- Bottom composer with multiline input and stop/send control.

## Neural Panel

The Neural Panel gives users local control over assistant behavior:

- AI name.
- AI personality traits.
- Emoji quantity.
- User name.
- Long-term memory lines.
- Performance Mode.
- Maximum generation tokens.
- Active context history size.
- Cache and context size display.

Changes are saved automatically in real time. There is no manual save button.

## Performance Mode

Performance Mode is meant for lower-end devices or users who want faster responses. It compacts memory earlier, keeps fewer active messages, and limits token output for a smaller runtime footprint.

Recommended settings are calculated from the device RAM.

## Technical Stack

- React Native `0.85.3`
- React `19.2.3`
- TypeScript
- `llama.rn` for local model inference
- Firebase Auth for authentication
- Google Sign-In integration
- `@kesha-antonov/react-native-background-downloader` for model downloads
- `@react-native-async-storage/async-storage` for local persistence
- `react-native-device-info` for RAM/storage/device detection
- `react-native-safe-area-context` for layout safety
- `lucide-react-native` for icons

## Project Structure

```text
src/
  assets/                 App icons, logos, fonts, and UI images
  components/             Shared UI components such as ProfessionalAlert
  data/                   Local model catalog
  screens/                Splash, auth, onboarding, download, ready, chat
  theme/                  Shared colors
  utils/                  Model install and file status helpers
```

## Source Status

Rivo App is not open source. The GitHub repository is private and maintained by the developer. This README may be shared publicly to explain the product, architecture, and user-facing behavior, but the source code, app assets, and implementation details are not licensed for copying, redistribution, or commercial reuse.

## Developer

Developer: Sanket Padhyal  
Website: `https://www.sanketpadhyal.in`  
Support: `sanketpadhyal3@gmail.com`

## Disclaimer

Rivo runs local AI models that can produce incorrect, incomplete, or unexpected responses. Users should verify critical information before relying on it. Rivo does not claim ownership over third-party model weights, logos, or model names referenced from external providers.

All rights reserved.
