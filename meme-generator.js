/**
 * Bani Meme Generator Web Component
 * This script creates a custom HTML element that embeds the Bani Meme Generator
 * in any web page, with configurable options and event handling.
 */

class BaniMemeGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: auto;
        min-height: 600px;
      }
      
      .container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      
      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    `;
    
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'container';
    
    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('title', 'Bani Meme Generator');
    
    // Append elements
    this.container.appendChild(this.iframe);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.container);
    
    // Setup message handling from iframe
    window.addEventListener('message', this.handleMessage.bind(this));
  }
  
  connectedCallback() {
    // Get attributes
    const width = this.getAttribute('width') || '800';
    const height = this.getAttribute('height') || '900';
    const baseUrl = this.getAttribute('app-url') || 'YOUR_APP_URL';
    
    // Set dimensions
    this.style.maxWidth = `${width}px`;
    this.iframe.style.height = `${height}px`;
    
    // Set up URL with any initial configuration
    let url = new URL(baseUrl);
    
    // Add optional initial parameters
    const initialBackground = this.getAttribute('initial-background');
    const initialPose = this.getAttribute('initial-pose');
    const initialCharm = this.getAttribute('initial-charm');
    const topText = this.getAttribute('top-text');
    const bottomText = this.getAttribute('bottom-text');
    
    // Add parameters to URL if provided
    if (initialBackground) url.searchParams.append('bg', initialBackground);
    if (initialPose) url.searchParams.append('pose', initialPose);
    if (initialCharm) url.searchParams.append('charm', initialCharm);
    if (topText) url.searchParams.append('topText', topText);
    if (bottomText) url.searchParams.append('bottomText', bottomText);
    
    // Set iframe source
    this.iframe.src = url.toString();
  }
  
  // Handle messages from the iframe
  handleMessage(event) {
    // Make sure the message is from our iframe
    if (event.source !== this.iframe.contentWindow) return;
    
    // Process messages from the generator
    if (event.data && event.data.type === 'meme-generator') {
      // Handle different message types
      switch (event.data.action) {
        case 'image-generated':
          // Dispatch custom event when an image is generated
          this.dispatchEvent(new CustomEvent('image-generated', {
            bubbles: true,
            composed: true,
            detail: {
              imageUrl: event.data.imageUrl
            }
          }));
          break;
        
        case 'ready':
          // Dispatch when the generator is loaded and ready
          this.dispatchEvent(new CustomEvent('generator-ready', {
            bubbles: true,
            composed: true
          }));
          break;
      }
    }
  }
  
  // Public method to trigger download
  download() {
    this.iframe.contentWindow.postMessage({ 
      type: 'meme-generator-command',
      action: 'download'
    }, '*');
  }
  
  // Public method to set text
  setText(topText, bottomText) {
    this.iframe.contentWindow.postMessage({
      type: 'meme-generator-command',
      action: 'set-text',
      topText: topText,
      bottomText: bottomText
    }, '*');
  }
  
  // Public method to set layers
  setLayers(background, pose, charm) {
    this.iframe.contentWindow.postMessage({
      type: 'meme-generator-command',
      action: 'set-layers',
      background: background,
      pose: pose,
      charm: charm
    }, '*');
  }
}

// Register the custom element
customElements.define('bani-meme-generator', BaniMemeGenerator);

console.log('Bani Meme Generator Web Component loaded successfully!');