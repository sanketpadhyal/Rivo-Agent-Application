import React from 'react';
import { GitBranch, Mail, Globe } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="brand-title">Rivo Agent</span>
          <p className="brand-disclaimer">
            Rivo executes local offline models which can produce unexpected or
            incorrect outputs. Always verify critical facts. Rivo does not own
            third-party weights or Hugging Face repository files.
          </p>
        </div>
        <div className="footer-developer">
          <span className="footer-header">Developer Specs</span>
          <div className="dev-details">
            <a
              href="https://www.sanketpadhyal.in"
              className="dev-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={14} />
              <span>sanketpadhyal.in</span>
            </a>
            <a href="mailto:sanketpadhyal3@gmail.com" className="dev-link">
              <Mail size={14} />
              <span>sanketpadhyal3@gmail.com</span>
            </a>
            <a
              href="https://github.com/sanketpadhyal/Rivo-Agent"
              className="dev-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitBranch size={14} />
              <span>github.com/sanketpadhyal/Rivo-Agent</span>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="copyright-text">
          &copy; {new Date().getFullYear()} Sanket Padhyal. All rights reserved.
          Rivo App is a private proprietary project.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
