import { useEffect, useRef, useState } from "react";

// Define the image layers
const imageLayers = [
  {
    name: "Background",
    images: [
      "https://placehold.co/400x400/e6f7ff/cccccc?text=Background+1",
      "https://placehold.co/400x400/e6ffe6/cccccc?text=Background+2",
      "https://placehold.co/400x400/fff5e6/cccccc?text=Background+3",
      "https://placehold.co/400x400/f7e6ff/cccccc?text=Background+4",
      "https://placehold.co/400x400/e6fffa/cccccc?text=Background+5",
      "https://placehold.co/400x400/f5f5f5/cccccc?text=Background+6",
      "https://placehold.co/400x400/ffe6e6/cccccc?text=Background+7",
      "https://placehold.co/400x400/fffde6/cccccc?text=Background+8",
      "https://placehold.co/400x400/e6f0ff/cccccc?text=Background+9",
      "https://placehold.co/400x400/f2e6ff/cccccc?text=Background+10"
    ]
  },
  {
    name: "Pose",
    images: [
      "https://placehold.co/300x300/00000000/3F51B5?text=Pose+1",
      "https://placehold.co/320x320/00000000/3F51B5?text=Pose+2",
      "https://placehold.co/310x310/00000000/3F51B5?text=Pose+3",
      "https://placehold.co/300x300/00000000/3F51B5?text=Pose+4",
      "https://placehold.co/290x290/00000000/3F51B5?text=Pose+5",
      "https://placehold.co/310x310/00000000/3F51B5?text=Pose+6",
      "https://placehold.co/300x300/00000000/3F51B5?text=Pose+7",
      "https://placehold.co/320x320/00000000/3F51B5?text=Pose+8",
      "https://placehold.co/290x290/00000000/3F51B5?text=Pose+9",
      "https://placehold.co/310x310/00000000/3F51B5?text=Pose+10"
    ]
  },
  {
    name: "Accessory",
    images: [
      "https://placehold.co/200x100/00000000/FF4081?text=Acc+1",
      "https://placehold.co/180x90/00000000/FF4081?text=Acc+2",
      "https://placehold.co/220x110/00000000/FF4081?text=Acc+3",
      "https://placehold.co/190x95/00000000/FF4081?text=Acc+4",
      "https://placehold.co/210x105/00000000/FF4081?text=Acc+5",
      "https://placehold.co/200x100/00000000/FF4081?text=Acc+6",
      "https://placehold.co/180x90/00000000/FF4081?text=Acc+7",
      "https://placehold.co/220x110/00000000/FF4081?text=Acc+8",
      "https://placehold.co/190x95/00000000/FF4081?text=Acc+9",
      "https://placehold.co/210x105/00000000/FF4081?text=Acc+10"
    ]
  }
];

export function LayeredImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Initialize selected images
  useEffect(() => {
    const initialSelected: Record<string, number> = {};
    imageLayers.forEach(layer => {
      initialSelected[layer.name] = 0;
    });
    setSelectedImages(initialSelected);
  }, []);

  // Preload all images
  useEffect(() => {
    const preloadedImages: Record<string, HTMLImageElement[]> = {};
    let loadPromises: Promise<void>[] = [];

    imageLayers.forEach(layer => {
      preloadedImages[layer.name] = [];
      
      layer.images.forEach((url, index) => {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
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
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'layered-image.png';
    link.click();
  };

  return (
    <div className="layered-image-generator mx-auto p-4 max-w-7xl">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">Layered Image Generator</h1>
        <p className="text-neutral-600">Create custom images by selecting elements from each layer category</p>
      </header>

      <div className="lg:flex lg:space-x-8 space-y-6 lg:space-y-0">
        {/* Layer Selection Panel */}
        <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-primary-dark border-b border-neutral-200 pb-2">Layer Selection</h2>
          
          {/* Layer Selection Controls */}
          <div className="space-y-8">
            {imageLayers.map((layer) => (
              <div key={layer.name} className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-neutral-800">{layer.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {layer.images.map((imageUrl, imageIndex) => (
                    <label key={imageIndex} className="cursor-pointer layer-option">
                      <input 
                        type="radio" 
                        name={layer.name} 
                        value={imageIndex} 
                        className="sr-only" 
                        checked={selectedImages[layer.name] === imageIndex}
                        onChange={() => handleSelectionChange(layer.name, imageIndex)}
                      />
                      <div className="border-2 border-transparent hover:border-primary-light rounded-md overflow-hidden transition-all p-1">
                        <div className="aspect-square bg-neutral-200 rounded flex items-center justify-center">
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
            ))}
          </div>
        </div>
        
        {/* Canvas Display Panel */}
        <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-primary-dark border-b border-neutral-200 pb-2">Preview</h2>
          
          <div className="flex flex-col items-center">
            <div className="canvas-container mb-6">
              <canvas 
                ref={canvasRef}
                width="400" 
                height="400" 
                className={`max-w-full h-auto ${isLoading ? 'opacity-50' : 'opacity-100'}`}
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
              className="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
