import { useEffect, useRef, useState } from "react";

// Define image layer types
type ImageItem = {
  url: string;
  label: string;
};

type ImageLayer = {
  name: string;
  images: ImageItem[];
};

// Define selected layer object structure
type LayerObject = {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
};

// Define the image layers with more descriptive names
const imageLayers: ImageLayer[] = [
  {
    name: "Background",
    images: [
      {
        url: "/backgrounds/wewr.png",
        label: "Sunset Ocean"
      },
      {
        url: "/backgrounds/ere.jpg",
        label: "Future Earth"
      },
      {
        url: "/backgrounds/ewr.jpg",
        label: "Tokyo Nights"
      },
      {
        url: "/backgrounds/rwr.jpg",
        label: "Racing Circuit"
      },
      {
        url: "/backgrounds/wee.jpg",
        label: "Tropical Beach"
      },
      {
        url: "/backgrounds/weer.jpg",
        label: "Flower Meadow"
      },
      {
        url: "/backgrounds/mountain_path.jpg",
        label: "Mountain Path"
      },
      {
        url: "/backgrounds/wre.png",
        label: "Vintage War"
      },
      {
        url: "/backgrounds/wer.jpg",
        label: "Jungle Path"
      }
    ]
  },
  {
    name: "Pose",
    images: [
      {
        url: "/poses/cool_elephant.png",
        label: "Cool Elephant"
      },
      {
        url: "/poses/doritos_elephant.png",
        label: "Doritos Lover"
      },
      {
        url: "/poses/shiba_elephant.png",
        label: "Shiba Costume"
      },
      {
        url: "/poses/penguin_elephant.png",
        label: "Penguin Costume"
      },
      {
        url: "/poses/elephant_beanie.png",
        label: "Beanie Elephant"
      },
      {
        url: "/poses/super_saiyan_elephant.png",
        label: "Super Saiyan"
      },
      {
        url: "/poses/monk_elephant.png",
        label: "Monk Elephant"
      },
      {
        url: "/poses/frog_costume.png",
        label: "Frog Costume"
      },
      {
        url: "/poses/soldier_elephant.png",
        label: "Soldier Elephant"
      }
    ]
  },
  {
    name: "Charm",
    images: [
      {
        url: "/accessories/beanie_dog.png",
        label: "Beanie Dog"
      },
      {
        url: "/accessories/bitcoin.png",
        label: "Bitcoin"
      },
      {
        url: "/accessories/astro_cat.png",
        label: "Astro Cat"
      },
      {
        url: "/accessories/solana_token.png",
        label: "Solana Token"
      },
      {
        url: "/accessories/rainbow_glasses.png",
        label: "Rainbow Glasses"
      },
      {
        url: "/accessories/sports_car.png",
        label: "Sports Car"
      },
      {
        url: "/accessories/red_backpack.png",
        label: "Red Backpack"
      }
    ]
  }
];

export function LayeredImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Selected image indexes by layer name
  const [selectedIndexes, setSelectedIndexes] = useState<Record<string, number>>({});
  
  // Layer objects for positioning and sizing
  const [layerObjects, setLayerObjects] = useState<Record<string, LayerObject>>({});
  
  // Image cache
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  
  // No active manipulations - removed drag and resize functionality
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Text caption states
  const [topText, setTopText] = useState<string>('');
  const [bottomText, setBottomText] = useState<string>('');

  // Function to generate random layer selections
  const generateRandomCombination = () => {
    const newSelectedIndexes: Record<string, number> = {};
    
    // Generate random selection for each layer type
    imageLayers.forEach(layer => {
      if (layer.images.length === 0) return;
      
      // Get a random index for this layer
      const randomIndex = Math.floor(Math.random() * layer.images.length);
      newSelectedIndexes[layer.name] = randomIndex;
    });
    
    // Update selected indexes - the existing effects will handle the rest
    setSelectedIndexes(newSelectedIndexes);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.getElementById(`dropdown-${openDropdown}`);
      const button = document.getElementById(`button-${openDropdown}`);
      
      if (
        dropdown && 
        !dropdown.contains(e.target as Node) && 
        button && 
        !button.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Load images for all layers
  useEffect(() => {
    const loadAllImages = async () => {
      try {
        await Promise.all(
          imageLayers.flatMap(layer => 
            layer.images.map(async image => {
              // Skip if already loaded
              if (imageCache.current[image.url]) return;
              
              try {
                const img = new Image();
                const loadPromise = new Promise<void>((resolve, reject) => {
                  img.onload = () => resolve();
                  img.onerror = () => reject(new Error(`Failed to load ${image.url}`));
                });
                
                img.src = image.url;
                await loadPromise;
                imageCache.current[image.url] = img;
              } catch (err) {
                console.error(`Error loading image ${image.url}:`, err);
                // Create a fallback image
                const fallbackImg = new Image();
                fallbackImg.width = 300;
                fallbackImg.height = 300;
                
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                  // Use theme color for fallback
                  const color = layer.name === "Background" ? '#fbd743' :
                               (layer.name === "Pose" ? '#9F9F9F' : '#ef6a43');
                  
                  ctx.fillStyle = color;
                  ctx.fillRect(0, 0, 300, 300);
                  
                  ctx.fillStyle = '#FFFFFF';
                  ctx.font = '20px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText(image.label || image.url.split('/').pop() || 'Image', 150, 150);
                  
                  fallbackImg.src = canvas.toDataURL('image/png');
                  imageCache.current[image.url] = fallbackImg;
                }
              }
            })
          )
        );
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading images:', err);
        setLoadError(true);
        setIsLoading(false);
      }
    };
    
    loadAllImages();
  }, []);

  // Update layer objects when selection changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const updatedLayerObjects: Record<string, LayerObject> = {};
    
    Object.entries(selectedIndexes).forEach(([layerName, index]) => {
      const layer = imageLayers.find(l => l.name === layerName);
      if (!layer || index === undefined) return;
      
      const imageItem = layer.images[index];
      if (!imageItem) return;
      
      const cachedImage = imageCache.current[imageItem.url];
      if (!cachedImage) return;
      
      // Check if we already have this layer positioned
      const existingLayer = layerObjects[layerName];
      
      if (existingLayer && existingLayer.url === imageItem.url) {
        // Keep existing position and size
        updatedLayerObjects[layerName] = existingLayer;
      } else {
        // Auto-fit the image to the canvas while maintaining aspect ratio
        let width, height;
        
        // Use full canvas dimensions (with minimal margin)
        const maxWidth = canvas.width * 0.995;  // 99.5% of canvas width
        const maxHeight = canvas.height * 0.995; // 99.5% of canvas height
        
        const aspectRatio = cachedImage.width / cachedImage.height;
        
        // Calculate dimensions to maximize usage of canvas space
        // while preserving aspect ratio
        if (aspectRatio >= 1) {
          // Landscape or square image - constrain by width first
          width = maxWidth;
          height = width / aspectRatio;
          
          // If height exceeds max height, recalculate based on height
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          // Portrait image - constrain by height first
          height = maxHeight;
          width = height * aspectRatio;
          
          // If width exceeds max width, recalculate based on width
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        }
        
        console.log("Auto-fitting image with dimensions:", cachedImage.width, "x", cachedImage.height, "to", Math.round(width), "x", Math.round(height));
        
        // Center the image on canvas
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        updatedLayerObjects[layerName] = {
          url: imageItem.url,
          x,
          y,
          width: width,
          height: height,
          originalWidth: cachedImage.width,
          originalHeight: cachedImage.height
        };
      }
    });
    
    setLayerObjects(updatedLayerObjects);
  }, [selectedIndexes]);

  // Draw canvas when layer objects change
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Check if there are any layers to display
    if (Object.keys(layerObjects).length === 0) {
      // Draw empty state message
      ctx.fillStyle = '#ef6a43'; // Orange text in the app's theme
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add an image', canvas.width / 2, canvas.height / 2 - 30);
      
      // Add plus icon (in the same orange theme color)
      ctx.beginPath();
      ctx.fillStyle = '#ef6a43'; // Keep the plus sign orange as well
      const plusSize = 30;
      const plusThickness = 6;
      const plusX = canvas.width / 2;
      const plusY = canvas.height / 2 + 20;
      
      // Draw plus shape (horizontal line)
      ctx.fillRect(
        plusX - plusSize/2, 
        plusY - plusThickness/2, 
        plusSize, 
        plusThickness
      );
      
      // Draw plus shape (vertical line)
      ctx.fillRect(
        plusX - plusThickness/2, 
        plusY - plusSize/2, 
        plusThickness, 
        plusSize
      );
      
      return;
    }
    
    // Draw each layer in order
    imageLayers.forEach(layer => {
      const layerObj = layerObjects[layer.name];
      if (!layerObj) return;
      
      const img = imageCache.current[layerObj.url];
      if (!img) return;
      
      // Draw the image
      ctx.drawImage(
        img,
        layerObj.x,
        layerObj.y,
        layerObj.width,
        layerObj.height
      );
    });
    
    // Draw text captions with IMPACT font and black outline
    drawTextWithOutline(ctx, topText.toUpperCase(), canvas.width / 2, 50, 50, '#FFFFFF', '#000000', 3);
    drawTextWithOutline(ctx, bottomText.toUpperCase(), canvas.width / 2, canvas.height - 30, 50, '#FFFFFF', '#000000', 3);
  }, [layerObjects, topText, bottomText]);
  
  // Helper function to draw text with outline
  const drawTextWithOutline = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    fontSize: number, 
    fillColor: string, 
    strokeColor: string, 
    lineWidth: number
  ) => {
    if (!text) return;
    
    ctx.font = `${fontSize}px IMPACT, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw the outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    
    // Draw the text
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
  };

  // No user interactions for dragging or resizing
  // Images will be rendered at their default positions

  // Handle layer selection
  const handleSelectLayer = (layerName: string, index: number) => {
    setSelectedIndexes(prev => ({
      ...prev,
      [layerName]: index
    }));
    
    // Close dropdown
    setOpenDropdown(null);
  };

  // Handle download with high resolution and trim empty space
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // First, find the bounds of the content for cropping
    const boundingBox = findContentBoundingBox();
    if (!boundingBox) {
      // No content to download
      return;
    }
    
    // Calculate dimensions with no padding to remove borders
    const padding = 0; // No padding to eliminate borders completely
    const contentWidth = boundingBox.maxX - boundingBox.minX + (padding * 2);
    const contentHeight = boundingBox.maxY - boundingBox.minY + (padding * 2);
    
    // Create high-res dimensions while maintaining aspect ratio
    const maxDimension = 2000; // Maximum dimension
    const aspectRatio = contentWidth / contentHeight;
    
    let highResWidth, highResHeight;
    if (aspectRatio >= 1) {
      // Wider than tall
      highResWidth = maxDimension;
      highResHeight = maxDimension / aspectRatio;
    } else {
      // Taller than wide
      highResHeight = maxDimension;
      highResWidth = maxDimension * aspectRatio;
    }
    
    // Create a high-resolution canvas for the download
    const highResCanvas = document.createElement('canvas');
    highResCanvas.width = Math.round(highResWidth);
    highResCanvas.height = Math.round(highResHeight);
    
    // Ensure alpha channel is enabled for transparency
    const highResCtx = highResCanvas.getContext('2d', { 
      alpha: true,
      willReadFrequently: true,
      desynchronized: false
    });
    
    if (!highResCtx) return;
    
    // Clear the high-res canvas and ensure transparency
    highResCtx.clearRect(0, 0, highResCanvas.width, highResCanvas.height);
    
    // Set the global composite operation to maintain transparency
    highResCtx.globalCompositeOperation = 'source-over';
    
    if (Object.keys(layerObjects).length === 0) {
      // If no layers, return without downloading
      return;
    }
    
    // Calculate scale ratio based on the content area
    const scaleRatio = highResWidth / contentWidth;
    
    // Draw each layer in order, but only the content area
    imageLayers.forEach(layer => {
      const layerObj = layerObjects[layer.name];
      if (!layerObj) return;
      
      const img = imageCache.current[layerObj.url];
      if (!img) return;
      
      // Calculate the position and size adjusted for the content area
      const relativeX = layerObj.x - (boundingBox.minX - padding);
      const relativeY = layerObj.y - (boundingBox.minY - padding);
      
      // Scale to high resolution
      const scaledX = relativeX * scaleRatio;
      const scaledY = relativeY * scaleRatio;
      const scaledWidth = layerObj.width * scaleRatio;
      const scaledHeight = layerObj.height * scaleRatio;
      
      // Draw the image at high resolution
      highResCtx.drawImage(
        img,
        scaledX, 
        scaledY,
        scaledWidth,
        scaledHeight
      );
    });
    
    // Add text captions to the high-res image
    if (topText || bottomText) {
      const scaledFontSize = Math.round(50 * scaleRatio);
      highResCtx.font = `${scaledFontSize}px IMPACT, Arial, sans-serif`;
      highResCtx.textAlign = 'center';
      highResCtx.textBaseline = 'middle';
      
      // Calculate positions
      const topYPosition = 50 * scaleRatio;
      const bottomYPosition = highResCanvas.height - (30 * scaleRatio);
      
      // Draw top text
      if (topText) {
        // Draw outline
        highResCtx.strokeStyle = '#000000';
        highResCtx.lineWidth = 3 * scaleRatio;
        highResCtx.strokeText(topText.toUpperCase(), highResCanvas.width / 2, topYPosition);
        
        // Draw text
        highResCtx.fillStyle = '#FFFFFF';
        highResCtx.fillText(topText.toUpperCase(), highResCanvas.width / 2, topYPosition);
      }
      
      // Draw bottom text
      if (bottomText) {
        // Draw outline
        highResCtx.strokeStyle = '#000000';
        highResCtx.lineWidth = 3 * scaleRatio;
        highResCtx.strokeText(bottomText.toUpperCase(), highResCanvas.width / 2, bottomYPosition);
        
        // Draw text
        highResCtx.fillStyle = '#FFFFFF';
        highResCtx.fillText(bottomText.toUpperCase(), highResCanvas.width / 2, bottomYPosition);
      }
    }
    
    // Convert the high-res canvas to a data URL
    const dataUrl = highResCanvas.toDataURL('image/png', 1.0);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'bani-meme-transparent.png';
    link.click();
  };
  
  // Helper function to find the bounding box of all visible content
  const findContentBoundingBox = () => {
    if (!canvasRef.current || Object.keys(layerObjects).length === 0) {
      return null;
    }
    
    // Get the canvas current size
    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate visible content bounds
    let minX = canvasWidth; // Start with canvas edge
    let minY = canvasHeight; // Start with canvas edge
    let maxX = 0; // Start from left edge
    let maxY = 0; // Start from top edge
    
    // Find the actual content bounds by examining all layer objects
    Object.values(layerObjects).forEach(layerObj => {
      // Get image from cache
      const img = imageCache.current[layerObj.url];
      if (!img) return;
      
      // Calculate the edges of this layer
      const left = Math.max(0, layerObj.x);
      const top = Math.max(0, layerObj.y);
      const right = Math.min(canvasWidth, layerObj.x + layerObj.width);
      const bottom = Math.min(canvasHeight, layerObj.y + layerObj.height);
      
      // Only update bounds if this layer is visible
      if (right > left && bottom > top) {
        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
      }
    });
    
    // Handle edge case: no valid content found
    if (minX >= maxX || minY >= maxY) {
      return null;
    }
    
    // Return the tight bounding box
    return { minX, minY, maxX, maxY };
  };

  return (
    <div className="layered-image-generator mx-auto p-4 max-w-7xl bg-transparent">
      <div className="flex flex-col space-y-6">
        {/* Canvas Display Panel */}
        <div className="bg-transparent p-6 rounded-lg shadow-md">
          
          <div className="flex flex-col items-center">
            {/* Canvas Preview Area */}
            <div className="canvas-container mb-8 border-4 border-primary/20 rounded-lg overflow-hidden bg-transparent">
              <canvas 
                ref={canvasRef}
                width="600" 
                height="600" 
                className={`max-w-full h-auto ${isLoading ? 'opacity-50' : 'opacity-100'} bg-transparent`}
              />
            </div>
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-4 text-neutral-600 flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading images...</span>
              </div>
            )}
            
            {/* Error message */}
            {loadError && (
              <div className="mb-4 text-error flex items-center">
                <svg className="h-5 w-5 text-error mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Failed to load one or more images. Please try again.</span>
              </div>
            )}
            
            {/* Text Caption Controls */}
            <div className="w-full max-w-md mb-4 mt-8">
              <h2 className="text-lg font-medium mb-3 text-secondary text-center">Insert Caption</h2>
              
              {/* Top Text Input */}
              <div className="mb-3">
                <label htmlFor="top-text" className="block text-sm font-medium mb-1 text-neutral-700">
                  Top Text
                </label>
                <input
                  id="top-text"
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              
              {/* Bottom Text Input */}
              <div>
                <label htmlFor="bottom-text" className="block text-sm font-medium mb-1 text-neutral-700">
                  Bottom Text
                </label>
                <input
                  id="bottom-text"
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-4 mb-6">
              {/* Randomizer button */}
              <button 
                onClick={generateRandomCombination}
                disabled={isLoading}
                className="bg-secondary hover:bg-primary hover:text-black text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Randomizer
              </button>
              
              {/* Download button */}
              <button 
                onClick={handleDownload}
                disabled={isLoading || Object.keys(layerObjects).length === 0}
                className="bg-secondary hover:bg-primary hover:text-black text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
        
        {/* Layer Selection Panel */}
        <div className="bg-transparent p-6 rounded-lg shadow-md">
          {/* Layer Selection Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            {imageLayers.map((layer) => (
              <div key={layer.name} className="mb-4">
                <div className="relative">
                  <button 
                    id={`button-${layer.name}`}
                    onClick={() => setOpenDropdown(prev => prev === layer.name ? null : layer.name)}
                    className={`flex justify-between items-center w-full px-4 py-3 ${
                      selectedIndexes[layer.name] !== undefined ? 
                      'bg-secondary text-white' : 
                      'bg-secondary text-white'
                    } rounded-md shadow hover:bg-primary hover:text-black transition-colors`}
                  >
                    <span className="font-medium">{layer.name}</span>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Dropdown content */}
                  <div 
                    id={`dropdown-${layer.name}`} 
                    className={`${openDropdown === layer.name ? 'block' : 'hidden'} absolute z-20 mt-2 w-full bg-primary rounded-md shadow-lg border border-primary/50`}
                  >
                    <div className="max-h-60 overflow-y-auto p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {layer.images.map((image, index) => (
                          <label key={index} className="cursor-pointer layer-option">
                            <input 
                              type="radio" 
                              name={layer.name} 
                              value={index} 
                              className="sr-only"
                              checked={selectedIndexes[layer.name] === index}
                              onChange={() => handleSelectLayer(layer.name, index)}
                            />
                            <div className="border-2 border-transparent hover:border-yellow-400 rounded-md overflow-hidden transition-all p-1">
                              <div className="aspect-square bg-white rounded flex items-center justify-center">
                                <img 
                                  src={image.url} 
                                  alt={image.label}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Selected thumbnail */}
                <div className="mt-2 p-2 flex justify-center border border-secondary/20 rounded-md bg-secondary/20">
                  <div className="w-16 h-16 bg-secondary rounded shadow-sm flex items-center justify-center">
                    {selectedIndexes[layer.name] !== undefined ? (
                      <img 
                        src={layer.images[selectedIndexes[layer.name]]?.url}
                        alt={`Selected ${layer.name}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-white text-xs text-center">
                        No image<br/>selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}