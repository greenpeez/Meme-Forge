import { useEffect, useRef, useState } from "react";

// Define the image layers
const imageLayers = [
  {
    name: "Background",
    images: [
      "https://via.placeholder.com/400/fbd743/FFFFFF?text=Background+1",
      "https://via.placeholder.com/400/ef6a43/FFFFFF?text=Background+2",
      "https://via.placeholder.com/400/e6ffe6/FFFFFF?text=Background+3",
      "https://via.placeholder.com/400/f7e6ff/FFFFFF?text=Background+4",
      "https://via.placeholder.com/400/e6fffa/FFFFFF?text=Background+5",
      "https://via.placeholder.com/400/f5f5f5/FFFFFF?text=Background+6",
      "https://via.placeholder.com/400/ffe6e6/FFFFFF?text=Background+7",
      "https://via.placeholder.com/400/fffde6/FFFFFF?text=Background+8",
      "https://via.placeholder.com/400/e6f0ff/FFFFFF?text=Background+9",
      "https://via.placeholder.com/400/f2e6ff/FFFFFF?text=Background+10"
    ]
  },
  {
    name: "Pose",
    images: [
      "https://via.placeholder.com/300/00000000/3F51B5?text=Pose+1",
      "https://via.placeholder.com/320/00000000/3F51B5?text=Pose+2",
      "https://via.placeholder.com/310/00000000/3F51B5?text=Pose+3",
      "https://via.placeholder.com/300/00000000/3F51B5?text=Pose+4",
      "https://via.placeholder.com/290/00000000/3F51B5?text=Pose+5",
      "https://via.placeholder.com/310/00000000/3F51B5?text=Pose+6",
      "https://via.placeholder.com/300/00000000/3F51B5?text=Pose+7",
      "https://via.placeholder.com/320/00000000/3F51B5?text=Pose+8",
      "https://via.placeholder.com/290/00000000/3F51B5?text=Pose+9",
      "https://via.placeholder.com/310/00000000/3F51B5?text=Pose+10"
    ]
  },
  {
    name: "Accessory",
    images: [
      "https://via.placeholder.com/200x100/00000000/FF4081?text=Acc+1",
      "https://via.placeholder.com/180x90/00000000/FF4081?text=Acc+2",
      "https://via.placeholder.com/220x110/00000000/FF4081?text=Acc+3",
      "https://via.placeholder.com/190x95/00000000/FF4081?text=Acc+4",
      "https://via.placeholder.com/210x105/00000000/FF4081?text=Acc+5",
      "https://via.placeholder.com/200x100/00000000/FF4081?text=Acc+6",
      "https://via.placeholder.com/180x90/00000000/FF4081?text=Acc+7",
      "https://via.placeholder.com/220x110/00000000/FF4081?text=Acc+8",
      "https://via.placeholder.com/190x95/00000000/FF4081?text=Acc+9",
      "https://via.placeholder.com/210x105/00000000/FF4081?text=Acc+10"
    ]
  }
];

export function LayeredImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // State for tracking open dropdowns
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Initialize selected images
  useEffect(() => {
    const initialSelected: Record<string, number> = {};
    imageLayers.forEach(layer => {
      initialSelected[layer.name] = 0;
    });
    setSelectedImages(initialSelected);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdownEl = document.getElementById(`dropdown-${openDropdown}`);
        const buttonEl = document.getElementById(`button-${openDropdown}`);
        
        if (dropdownEl && 
            !dropdownEl.contains(event.target as Node) && 
            buttonEl && 
            !buttonEl.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Preload all images
  useEffect(() => {
    const preloadedImages: Record<string, HTMLImageElement[]> = {};
    let loadPromises: Promise<void>[] = [];

    imageLayers.forEach(layer => {
      preloadedImages[layer.name] = [];
      
      layer.images.forEach((url, index) => {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          // Add crossOrigin attribute to prevent canvas tainting
          img.crossOrigin = "anonymous";
          img.src = url;
          
          img.onload = () => {
            preloadedImages[layer.name][index] = img;
            resolve();
          };
          
          img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            reject(new Error(`Failed to load image: ${url}`));
          };
        });
        
        loadPromises.push(promise);
      });
    });

    Promise.all(loadPromises)
      .then(() => {
        setLoadedImages(preloadedImages);
        setIsLoading(false);
        setHasError(false);
      })
      .catch(error => {
        console.error('Error preloading images:', error);
        setIsLoading(false);
        setHasError(true);
      });
  }, []);

  // Draw canvas when selected images or loaded images change
  useEffect(() => {
    if (isLoading || hasError || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each selected layer image in order
    imageLayers.forEach(layer => {
      const selectedIndex = selectedImages[layer.name];
      const image = loadedImages[layer.name]?.[selectedIndex];
      
      if (image) {
        // Calculate position to center the image
        const x = (canvas.width - image.width) / 2;
        const y = (canvas.height - image.height) / 2;
        
        // Draw the image centered on canvas
        ctx.drawImage(image, x, y);
      }
    });
  }, [selectedImages, loadedImages, isLoading, hasError]);

  // Handle layer selection change
  const handleSelectionChange = (layerName: string, imageIndex: number) => {
    setSelectedImages(prev => ({
      ...prev,
      [layerName]: imageIndex
    }));
  };

  // Handle download click
  const handleDownload = () => {
    if (isLoading || hasError || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'bani-meme.png';
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Could not download the image. This may be due to cross-origin restrictions with the image sources.');
    }
  };

  return (
    <div className="layered-image-generator mx-auto p-4 max-w-7xl">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-secondary mb-2">Bani Meme Generator</h1>
        <p className="text-neutral-700 text-lg">Mix-n-match layers to build your custom Bani PFP!</p>
      </header>

      <div className="flex flex-col space-y-6">
        {/* Canvas Display Panel - Moved to top */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-secondary border-b border-neutral-200 pb-2">Preview</h2>
          
          <div className="flex flex-col items-center">
            <div className="canvas-container mb-6 border-4 border-primary/20 rounded-lg overflow-hidden">
              <canvas 
                ref={canvasRef}
                width="400" 
                height="400" 
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
            {hasError && (
              <div className="mb-4 text-error flex items-center">
                <svg className="h-5 w-5 text-error mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Failed to load one or more images. Please try again.</span>
              </div>
            )}
            
            {/* Download button */}
            <button 
              onClick={handleDownload}
              disabled={isLoading || hasError}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-md font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </button>
          </div>
        </div>
        
        {/* Layer Selection Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-secondary border-b border-neutral-200 pb-2">Layer Selection</h2>
          
          {/* Layer Selection Controls - Now using popover/dropdown UI */}
          <div className="grid gap-4 md:grid-cols-3">
            {imageLayers.map((layer) => (
              <div key={layer.name} className="mb-4">
                <div className="relative" key={layer.name}>
                  <button 
                    id={`button-${layer.name}`}
                    type="button"
                    onClick={() => {
                      // Toggle dropdown state
                      setOpenDropdown(prev => prev === layer.name ? null : layer.name);
                    }}
                    className="flex justify-between items-center w-full px-4 py-3 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors"
                  >
                    <span className="font-medium">{layer.name}</span>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Dropdown content */}
                  <div id={`dropdown-${layer.name}`} className={`${openDropdown === layer.name ? 'block' : 'hidden'} absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-neutral-200`}>
                    <div className="max-h-60 overflow-y-auto p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {layer.images.map((imageUrl, imageIndex) => (
                          <label key={imageIndex} className="cursor-pointer layer-option">
                            <input 
                              type="radio" 
                              name={layer.name} 
                              value={imageIndex} 
                              className="sr-only" 
                              checked={selectedImages[layer.name] === imageIndex}
                              onChange={() => {
                                handleSelectionChange(layer.name, imageIndex);
                                // Close dropdown when selection made
                                setOpenDropdown(null);
                              }}
                            />
                            <div className="border-2 border-transparent hover:border-primary rounded-md overflow-hidden transition-all p-1">
                              <div className="aspect-square bg-neutral-100 rounded flex items-center justify-center">
                                <img 
                                  src={imageUrl} 
                                  alt={`${layer.name} option ${imageIndex + 1}`}
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
                
                {/* Show the currently selected image for this layer */}
                <div className="mt-2 p-2 flex justify-center border border-primary/20 rounded-md bg-primary/5">
                  <div className="w-16 h-16 bg-white rounded shadow-sm">
                    {loadedImages[layer.name] && selectedImages[layer.name] !== undefined && (
                      <img 
                        src={layer.images[selectedImages[layer.name]]}
                        alt={`Selected ${layer.name}`}
                        className="w-full h-full object-contain"
                      />
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
