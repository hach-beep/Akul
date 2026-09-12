import React, { useState } from "react";
import { X, Github, Copy, Check, Terminal, Globe, Code2, Sparkles } from "lucide-react";

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const gitCommands = `# 1. Initialize git and link to your GitHub repository:
git init
git add .
git commit -m "feat: AI Fridge Meal and Grocery Assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fridge-meal-ai.git
git push -u origin main

# 2. Build the production static HTML, CSS & JS bundle:
npm run build

# The output in ./dist is 100% standard static HTML, JS & CSS ready for GitHub Pages!`;

  const githubActionsYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Build static site
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div
      id="github-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-stone-900 leading-tight">
                Host on GitHub & GitHub Pages
              </h3>
              <p className="text-xs text-stone-500">
                Standard HTML, CSS & JS static bundle generation
              </p>
            </div>
          </div>

          <button
            id="close-github-modal-button"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Static Bundle Architecture Verified</span>
            </div>
            <p className="text-emerald-800">
              This app uses standard <strong>HTML, CSS (Tailwind) and TypeScript/JavaScript</strong>. Running <code>npm run build</code> generates a high-performance single-page bundle in the <code>/dist</code> folder that can be hosted for free on GitHub Pages, Cloudflare Pages, Netlify, or Vercel.
            </p>
          </div>

          {/* Step 1: Git Push */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-stone-600" />
                <span>1. Push Repository to GitHub</span>
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(gitCommands, "git")}
                className="text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                {copiedSnippet === "git" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === "git" ? "Copied!" : "Copy Commands"}</span>
              </button>
            </div>
            <pre className="bg-stone-900 text-stone-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
              {gitCommands}
            </pre>
          </div>

          {/* Step 2: Automated GitHub Pages Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-stone-600" />
                <span>2. Automated 1-Click Deploy via GitHub Actions</span>
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(githubActionsYaml, "action")}
                className="text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                {copiedSnippet === "action" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === "action" ? "Copied!" : "Copy YAML"}</span>
              </button>
            </div>
            <p className="text-stone-500">
              Save this file as <code>.github/workflows/deploy.yml</code> in your repository. GitHub will automatically compile the HTML/CSS/JS and publish your site!
            </p>
            <pre className="bg-stone-900 text-stone-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
              {githubActionsYaml}
            </pre>
          </div>

          {/* GitHub Pages Settings note */}
          <div className="p-4 bg-stone-100 rounded-xl space-y-1">
            <h5 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-stone-600" />
              <span>GitHub Pages Settings</span>
            </h5>
            <p className="text-stone-600">
              In your GitHub repository, go to <strong>Settings &gt; Pages &gt; Build and deployment</strong> and choose <strong>GitHub Actions</strong> as the source.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-xs transition cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
