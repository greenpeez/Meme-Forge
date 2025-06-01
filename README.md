# Bani Meme Generator

An interactive web application for creating custom layered images and memes. Mix and match backgrounds, poses, and charms to build unique profile pictures with customizable text captions.

## Features

- **Layered Image Composition**: Combine different image layers (backgrounds, poses, charms)
- **Randomizer**: Generate random combinations with a single click
- **Text Captions**: Add custom top and bottom text with professional styling
- **High-Quality Downloads**: Export images as transparent PNGs at full resolution
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Web Component**: Embeddable component for integration into other websites

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Image Processing**: HTML5 Canvas API
- **Backend**: Express.js, Node.js
- **Build Tool**: Vite
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bani-meme-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

### Basic Usage

1. **Select Layers**: Choose from dropdown menus:
   - Background: Various scenic and thematic backgrounds
   - Pose: Different character poses and costumes
   - Charm: Decorative accessories and elements

2. **Add Text**: 
   - Enter top and bottom text captions
   - Text automatically converts to uppercase with impact font styling

3. **Randomize**: Click the Randomizer button to generate random combinations

4. **Download**: Export your creation as a high-quality PNG file

### Web Component Integration

The meme generator can be embedded in any website using the provided web component:

```html
<script src="meme-generator.js"></script>
<bani-meme-generator></bani-meme-generator>
```

See `embedding-example.html` for complete integration examples.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
│       ├── backgrounds/   # Background images
│       ├── poses/         # Character pose images
│       └── accessories/   # Charm and accessory images
├── server/                # Backend Express server
├── shared/                # Shared type definitions
├── meme-generator.js      # Standalone web component
└── embedding-example.html # Integration examples
```

## Image Assets

The application includes curated collections of:

- **Backgrounds**: Landscapes, cityscapes, abstract designs
- **Poses**: Character costumes and expressions
- **Charms**: Decorative elements and accessories

All images are optimized for web delivery and support transparency.

## Development

### Adding New Images

1. Add image files to the appropriate directory:
   - `client/public/backgrounds/` for backgrounds
   - `client/public/poses/` for character poses
   - `client/public/accessories/` for charms

2. Update the image arrays in `client/src/components/LayeredImageGenerator.tsx`

### Building for Production

```bash
npm run build
```

### Deployment

The application is designed to run on any modern web hosting platform. The Express server handles both API routes and static file serving.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Responsive design principles for cross-device compatibility
- Canvas-based rendering for high-quality image output
