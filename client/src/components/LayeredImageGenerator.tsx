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
        url: "/backgrounds/wre.jpg",
        label: "Mountain Peak"
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
        url: "https://placehold.co/300x300/00000000/3F51B5?text=Pose+1",
        label: "Standard Pose"
      },
      {
        url: "https://placehold.co/320x320/00000000/3F51B5?text=Pose+2",
        label: "Action Pose"
      },
      {
        url: "https://placehold.co/310x310/00000000/3F51B5?text=Pose+3",
        label: "Sitting Pose"
      },
      {
        url: "https://placehold.co/300x300/00000000/3F51B5?text=Pose+4",
        label: "Jumping Pose"
      },
      {
        url: "https://placehold.co/290x290/00000000/3F51B5?text=Pose+5",
        label: "Running Pose"
      }
    ]
  },
  {
    name: "Accessory",
    images: [
      {
        url: "https://placehold.co/200x100/00000000/FF4081?text=Acc+1",
        label: "Hat"
      },
      {
        url: "https://placehold.co/180x90/00000000/FF4081?text=Acc+2",
        label: "Glasses"
      },
      {
        url: "https://placehold.co/220x110/00000000/FF4081?text=Acc+3",
        label: "Bowtie"
      },
      {
        url: "https://placehold.co/190x95/00000000/FF4081?text=Acc+4",
        label: "Necklace"
      },
      {
        url: "https://placehold.co/210x105/00000000/FF4081?text=Acc+5",
        label: "Crown"
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
        
        // Use full canvas dimensions (with just a small margin)
        const maxWidth = canvas.width * 0.98;  // 98% of canvas width
        const maxHeight = canvas.height * 0.98; // 98% of canvas height
        
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
    const ctx = canvas.getContext('2d');
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
  }, [layerObjects]);

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

  // Handle download
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'bani-meme.png';
    link.click();
  };

  return (
    <div className="layered-image-generator mx-auto p-4 max-w-7xl">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-secondary mb-2">Bani Meme Generator</h1>
        <p className="text-neutral-700 text-lg">Mix-n-match layers to build your custom Bani PFP!</p>
      </header>

      <div className="flex flex-col space-y-6">
        {/* Canvas Display Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-secondary border-b border-neutral-200 pb-2">Preview</h2>
          
          <div className="flex flex-col items-center">
            {/* Canvas Preview Area */}
            <div className="canvas-container mb-8 border-4 border-primary/20 rounded-lg overflow-hidden">
              <canvas 
                ref={canvasRef}
                width="600" 
                height="600" 
                className={`max-w-full h-auto ${isLoading ? 'opacity-50' : 'opacity-100'} bg-white`}
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
            
            {/* Spacer div to create separation between canvas and button */}
            <div className="h-8"></div>
            
            {/* Download button */}
            <div className="flex justify-center mt-4 mb-6">
              <button 
                onClick={handleDownload}
                disabled={isLoading || Object.keys(layerObjects).length === 0}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-md font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
        <div className="bg-white p-6 rounded-lg shadow-md">
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
                      'bg-primary text-primary-foreground' : 
                      'bg-primary/20 text-secondary border-2 border-dashed border-primary/30'
                    } rounded-md shadow hover:bg-primary/90 hover:text-primary-foreground transition-colors`}
                  >
                    <span className="font-medium">{layer.name}</span>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Dropdown content */}
                  <div 
                    id={`dropdown-${layer.name}`} 
                    className={`${openDropdown === layer.name ? 'block' : 'hidden'} absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-neutral-200`}
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
                            <div className="border-2 border-transparent hover:border-primary rounded-md overflow-hidden transition-all p-1">
                              <div className="aspect-square bg-neutral-100 rounded flex items-center justify-center">
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
                <div className="mt-2 p-2 flex justify-center border border-primary/20 rounded-md bg-primary/5">
                  <div className="w-16 h-16 bg-white rounded shadow-sm flex items-center justify-center">
                    {selectedIndexes[layer.name] !== undefined ? (
                      <img 
                        src={layer.images[selectedIndexes[layer.name]]?.url}
                        alt={`Selected ${layer.name}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-neutral-300 text-xs text-center">
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