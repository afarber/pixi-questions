/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

export class PromptOverlay {
  constructor(root, onAction) {
    this.root = root;
    this.onAction = onAction;
  }

  render(snapshot) {
    this.root.innerHTML = '';
    const prompt = snapshot.prompt;
    if (!prompt) {
      return;
    }

    const isToast = prompt.kind === 'playCard';
    const container = document.createElement('div');
    container.className = isToast ? 'prompt-toast-wrap' : 'prompt-backdrop';

    const box = document.createElement('div');
    box.className = isToast ? 'prompt-box prompt-box--toast' : 'prompt-box';

    const text = document.createElement('div');
    text.className = 'prompt-text';
    text.textContent = prompt.text || '';
    box.appendChild(text);

    if (prompt.subtext) {
      const sub = document.createElement('div');
      sub.className = 'prompt-subtext';
      sub.textContent = prompt.subtext;
      box.appendChild(sub);
    }

    const buttons = document.createElement('div');
    buttons.className = 'prompt-buttons';

    for (const item of prompt.options || []) {
      const btn = document.createElement('button');
      btn.className = 'prompt-btn';
      btn.textContent = item.label;
      if (item.action?.type === 'CONFIRM_SKAT_DISCARD') {
        btn.disabled = snapshot.selectedSkatDiscard.length !== 2;
      } else {
        btn.disabled = !!item.disabled;
      }
      btn.onclick = () => this.onAction(item.action);
      buttons.appendChild(btn);
    }

    box.appendChild(buttons);
    container.appendChild(box);
    this.root.appendChild(container);
  }
}
