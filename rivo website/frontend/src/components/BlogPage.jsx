import React from 'react';
import {
  Brain,
  CheckCircle2,
  CloudDownload,
  Cpu,
  Database,
  HardDrive,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import Footer from './Footer';
import Navbar from './Navbar';

const quickFacts = [
  {
    icon: Smartphone,
    label: 'Mobile first',
    value: 'Built as a React Native app for Android and iOS screens.',
  },
  {
    icon: CloudDownload,
    label: 'Model source',
    value: 'Downloads GGUF model files from Hugging Face repositories.',
  },
  {
    icon: Brain,
    label: 'Local engine',
    value: 'Uses llama.rn to run the selected model on the phone.',
  },
  {
    icon: Lock,
    label: 'Private by design',
    value: 'Chats and model state stay in local device storage.',
  },
];

const steps = [
  {
    title: '1. App opens with the splash screen',
    text: 'When Rivo starts, App.tsx shows the splash screen once for the cold start. After that, it checks Firebase auth and local model status to decide where the user should go next.',
  },
  {
    title: '2. User signs in',
    text: 'If the user is not signed in, Rivo shows the home screen first. The get started swipe opens the login screen. Firebase Authentication then tells the app when the user is ready.',
  },
  {
    title: '3. Rivo checks the phone',
    text: 'During onboarding, the app reads the device name, total RAM, and free storage. This helps Rivo recommend a model that can actually run smoothly on that phone.',
  },
  {
    title: '4. Model list comes from Hugging Face',
    text: 'The app has a local catalog of supported GGUF models. It also calls Hugging Face model APIs to show live download counts and then builds download links for the selected model file.',
  },
  {
    title: '5. User chooses a model',
    text: 'Each model has a size, minimum RAM requirement, file name, and priority. Rivo marks models as recommended, downloadable, already downloaded, or still downloading.',
  },
  {
    title: '6. The model downloads in the background',
    text: 'Rivo uses a background downloader so the large GGUF file can keep downloading even when the app changes screens. It shows progress, speed, total size, and verification status.',
  },
  {
    title: '7. Download is verified and saved',
    text: 'After the download finishes, Rivo checks that the file exists, is readable, looks like a GGUF file, and is close to the expected size. Then it saves the selected model details in AsyncStorage.',
  },
  {
    title: '8. Chat screen warms the local engine',
    text: 'When chat opens, Rivo finds the installed model file path and passes it to llama.rn. It first tries a memory mapped load, then falls back to a safer load if needed.',
  },
  {
    title: '9. The prompt is prepared on the phone',
    text: 'Before sending text to the model, Rivo builds a system message with the assistant name, personality, local model name, recent chat context, and small local memory facts.',
  },
  {
    title: '10. The answer streams back locally',
    text: 'llama.rn generates the reply on the phone. Rivo streams tokens into the chat UI, updates the visible response quickly, and stores the thread locally for the next session.',
  },
];

const mobileFlow = [
  'Open Rivo Agent on your phone.',
  'Sign in or create an account.',
  'Let Rivo inspect RAM and free storage.',
  'Pick the recommended Hugging Face GGUF model.',
  'Wait for the model download and verification.',
  'Open chat and ask a question.',
  'The local model answers without sending the chat to a cloud model.',
];

const technicalFlow = [
  {
    title: 'The model is the brain file',
    text: 'The GGUF file is not a normal app file. It contains billions of learned numbers called weights. These weights are the compressed knowledge and language patterns the LLM learned during training.',
  },
  {
    title: 'Rivo loads that brain into phone memory',
    text: 'When chat starts, llama.rn opens the GGUF file from local storage and prepares it for inference. Rivo uses a smaller context and batch size so the model can fit inside mobile RAM.',
  },
  {
    title: 'Your message becomes tokens',
    text: 'The text you type is split into small pieces called tokens. A token can be a word, part of a word, punctuation, or code symbol. The LLM only understands these token numbers, not raw text directly.',
  },
  {
    title: 'Rivo builds the full prompt',
    text: 'Before the model answers, Rivo combines the system instructions, assistant personality, recent chat history, local memory facts, and your latest message into one prompt.',
  },
  {
    title: 'The LLM predicts one token at a time',
    text: 'The model does not search the internet or fetch a ready answer. It looks at the prompt, calculates probabilities, chooses the next likely token, adds it to the text, then repeats.',
  },
  {
    title: 'Streaming makes it feel live',
    text: 'Each generated token is sent back to the React Native chat screen quickly. That is why you see the answer typing out instead of waiting for the full reply to finish.',
  },
  {
    title: 'Temperature controls creativity',
    text: 'Rivo passes settings like temperature, top_p, top_k, and repeat penalty. These control how focused, creative, or repetitive the local model response becomes.',
  },
  {
    title: 'The context window is the working memory',
    text: 'The model can only see a limited amount of text at once. Rivo keeps recent messages and compacted memory so the chat feels continuous without overloading the phone.',
  },
  {
    title: 'Offline means no cloud handoff',
    text: 'After the model file is downloaded, generation happens on the device through llama.rn. Your chat text does not need to be sent to an external LLM server for the model to answer.',
  },
];

const BlogPage = () => {
  return (
    <div className="app-landing blog-page">
      <Navbar />

      <main>
        <section className="blog-hero-section">
          <div className="blog-container blog-hero-grid">
            <div className="blog-hero-copy">
              <div className="privacy-badge">
                <ShieldCheck size={14} strokeWidth={2.5} />
                Rivo Agent Docs
              </div>
              <h1 className="blog-title">
                How Rivo actually works on your mobile
              </h1>
              <p className="blog-lede">
                This is the easy step-by-step guide for the Rivo mobile app.
                It explains how the app starts, downloads an AI model from
                Hugging Face, saves it on your phone, and runs chat locally.
              </p>
              <div className="blog-hero-actions">
                <a href="/" className="blog-secondary-btn">Home</a>
                <a
                  href="https://huggingface.co"
                  className="blog-primary-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Sparkles size={16} strokeWidth={2.5} />
                  Hugging Face
                </a>
              </div>
            </div>

            <div className="blog-system-panel" aria-label="Rivo system overview">
              <div className="panel-header-row">
                <span className="panel-dot green-dot" />
                <span className="panel-dot blue-dot" />
                <span className="panel-dot gray-dot" />
              </div>
              <div className="system-stack">
                <div className="system-layer">
                  <Smartphone size={18} />
                  <span>React Native mobile app</span>
                </div>
                <div className="system-arrow" />
                <div className="system-layer">
                  <CloudDownload size={18} />
                  <span>Hugging Face GGUF download</span>
                </div>
                <div className="system-arrow" />
                <div className="system-layer">
                  <HardDrive size={18} />
                  <span>Local model file + AsyncStorage</span>
                </div>
                <div className="system-arrow" />
                <div className="system-layer">
                  <Cpu size={18} />
                  <span>llama.rn offline inference</span>
                </div>
                <div className="system-arrow" />
                <div className="system-layer">
                  <MessageSquareText size={18} />
                  <span>Private local chat response</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="blog-facts-section">
          <div className="blog-container">
            <div className="blog-facts-grid">
              {quickFacts.map(item => {
                const Icon = item.icon;
                return (
                  <article className="blog-fact-card" key={item.label}>
                    <div className="blog-fact-icon">
                      <Icon size={22} strokeWidth={2.4} />
                    </div>
                    <h2>{item.label}</h2>
                    <p>{item.value}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="blog-doc-section">
          <div className="blog-container blog-doc-grid">
            <aside className="blog-side-note">
              <span className="side-note-label">Simple Summary</span>
              <h2>Rivo is an offline AI setup flow.</h2>
              <p>
                The app helps the phone choose a model, downloads it once, and
                then talks to that model directly on the device.
              </p>
              <div className="side-note-divider" />
              <div className="side-note-line">
                <Database size={16} />
                <span>AsyncStorage keeps setup and chat state.</span>
              </div>
              <div className="side-note-line">
                <ShieldCheck size={16} />
                <span>Local files are checked before chat starts.</span>
              </div>
              <div className="side-note-line">
                <Brain size={16} />
                <span>llama.rn turns the GGUF file into replies.</span>
              </div>
            </aside>

            <div className="blog-steps-list">
              <div className="blog-section-heading">
                <span>Step by step</span>
                <h2>What happens inside the app</h2>
              </div>

              {steps.map(step => (
                <article className="blog-step-card" key={step.title}>
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="blog-technical-section">
          <div className="blog-container">
            <div className="blog-section-heading">
              <span>Technical, but simple</span>
              <h2>What the LLM is actually doing on your device</h2>
            </div>

            <div className="technical-intro">
              <p>
                Think of the LLM as a small language engine running inside your
                phone. Rivo gives it the model file, your prompt, and a few
                generation settings. Then the model keeps predicting the next
                tiny piece of text until the answer is finished.
              </p>
            </div>

            <div className="technical-flow-grid">
              {technicalFlow.map((item, index) => (
                <article className="technical-card" key={item.title}>
                  <span className="technical-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <div className="technical-pipeline">
              <div className="pipeline-item">
                <span>User text</span>
                <strong>tokens</strong>
              </div>
              <div className="pipeline-line" />
              <div className="pipeline-item">
                <span>GGUF weights</span>
                <strong>math</strong>
              </div>
              <div className="pipeline-line" />
              <div className="pipeline-item">
                <span>Next token</span>
                <strong>stream</strong>
              </div>
              <div className="pipeline-line" />
              <div className="pipeline-item">
                <span>Chat bubble</span>
                <strong>reply</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="blog-mobile-section">
          <div className="blog-container blog-mobile-grid">
            <div>
              <div className="blog-section-heading left-align">
                <span>User flow</span>
                <h2>How you use it on mobile</h2>
              </div>
              <p className="blog-mobile-copy">
                You do not need to understand AI model files to use Rivo. The
                app turns the hard parts into a normal mobile flow: sign in,
                choose, download, verify, chat.
              </p>
            </div>

            <div className="mobile-flow-list">
              {mobileFlow.map((item, index) => (
                <div className="mobile-flow-item" key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="blog-credit-section">
          <div className="blog-container">
            <div className="credit-card">
              <h2>Credits</h2>
              <p>
                Credit to Hugging Face for hosting the open model repositories
                and GGUF files that Rivo can download. Model weights remain the
                property of their original creators and repository owners.
              </p>
              <p className="blog-copyright">
                Docs by sanketpadhyal. Copyright 2026 Sanket Padhyal. All
                rights reserved.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
