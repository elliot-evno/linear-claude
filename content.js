// Simple Linear to Claude Code converter - Styled with CSS

class LinearToClaudeConverter {
  constructor() {
    this.init();
  }

  init() {
    setTimeout(() => this.injectButton(), 2000);
    setTimeout(() => this.injectButton(), 5000);
  }

  injectButton() {
    if (document.querySelector('#copy-to-claude-btn')) return;

    const button = document.createElement('button');
    button.id = 'copy-to-claude-btn';
    button.className = 'claude-copy-button';
    button.innerHTML = `
      <img src="${chrome.runtime.getURL('claude.svg')}" width="18" height="18" class="claude" />
      <span>Copy to Claude</span>
    `;

    button.addEventListener('click', () => this.copyToClaudeCode());

    document.body.appendChild(button);
    console.log('✅ Copy to Claude button injected');
  }

  async copyToClaudeCode() {
    const button = document.querySelector('#copy-to-claude-btn');
    const originalHTML = button.innerHTML;

    try {
      // Loading state
      button.classList.add('loading');
      button.innerHTML = '<span>⏳ Extracting...</span>';
      button.disabled = true;

      const ticketData = this.extractTicketData();
      const claudePrompt = this.formatForClaude(ticketData);

      await this.copyToClipboard(claudePrompt);

      // Success state
      button.classList.remove('loading');
      button.classList.add('success');
      button.innerHTML = '<span>Copied!</span>';
      
      this.showNotification('Copied to clipboard! Paste into Claude Code terminal.');

      setTimeout(() => {
        button.classList.remove('success');
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Copy failed:', error);
      
      // Error state
      button.classList.remove('loading');
      button.classList.add('error');
      button.innerHTML = '<span>Failed</span>';
      
      setTimeout(() => {
        button.classList.remove('error');
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 2000);
    }
  }

  extractTicketData() {
    // Get ticket ID from URL
    const urlMatch = window.location.pathname.match(/\/issue\/([^\/]+)/);
    const ticketId = urlMatch ? urlMatch[1] : 'Unknown';

    let title = '';
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 4) {
      title = pathParts.slice(4).join('/').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    let description = this.getDescription()


    return {
      id: ticketId,
      title: title || 'Implementation Task',
      description: description,
      url: window.location.href
    };
  }

  getDescription() {
    let description = ''
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
      description += p.textContent + '\n\n';
    });
    return description
  }

  formatForClaude(ticket) {
    return `Implement this Linear ticket:

**${ticket.id}: ${ticket.title}**

**Description:**
${ticket.description}

**Requirements:**
- Analyze the requirements and implement the necessary code changes
- Create appropriate files, tests, and documentation as needed
- Follow existing code style and patterns
- Ensure the implementation is clean, maintainable, and well-documented

**Ticket URL:** ${ticket.url}`;
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position: fixed; opacity: 0; pointer-events: none;';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'claude-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize
new LinearToClaudeConverter();