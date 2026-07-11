import React from 'react';
import { MessageSquare, WifiOff, Settings, Database, Cpu, Lock } from 'lucide-react';

const Features = () => {
  const featureList = [
    {
      Icon: WifiOff,
      title: 'Runs 100% Offline',
      desc: 'No API keys, server delays, or network queries. Complete inference is handled directly on your local device CPU.'
    },
    {
      Icon: Lock,
      title: 'Zero Data Leaks',
      desc: 'Your chat history, preferences, and assistant memories stay strictly stored inside secure local AsyncStorage.'
    },
    {
      Icon: Settings,
      title: 'Neural Panel Tuning',
      desc: 'Customize the AI name, core personality parameters, emoji count, output limits, and sliding window context sizes.'
    },
    {
      Icon: Database,
      title: 'Storage Management',
      desc: 'Delete models and purge cache instantly with double-confirmed security safeguards, restoring storage instantly.'
    },
    {
      Icon: Cpu,
      title: 'Adaptive Performance',
      desc: 'Enables a lighter RAM footprint mode designed dynamically based on your specific phone specs to prevent crashes.'
    },
    {
      Icon: MessageSquare,
      title: 'Fluid Streaming',
      desc: 'Buttery-smooth text streaming equipped with user-aware auto-scrolling, code rendering, and message copying.'
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Engineered for On-Device Control</h2>
          <p className="section-subtitle">
            Experience advanced AI execution designed with total privacy, responsiveness, and control.
          </p>
        </div>
        <div className="features-grid">
          {featureList.map((feat, index) => {
            const Icon = feat.Icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={24} strokeWidth={2.2} className="feature-icon" />
                </div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
