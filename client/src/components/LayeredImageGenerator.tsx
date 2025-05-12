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

// Define resizable image data type
type ResizableImage = {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
  isResizing: boolean;
  dragOffsetX: number;
  dragOffsetY: number;
  resizeStartX: number;
  resizeStartY: number;
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
        url: "/backgrounds/wew.jpg",
        label: "Forest Path"
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
        url: "/backgrounds/20250512_1319_Trench Soldiers_remix_01jv26wejqer1vbx83eeacfm89.png",
        label: "Trench Soldiers"
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
      },
      {
        url: "https://placehold.co/310x310/00000000/3F51B5?text=Pose+6",
        label: "Laughing Pose"
      },
      {
        url: "https://placehold.co/300x300/00000000/3F51B5?text=Pose+7",
        label: "Thinking Pose"
      },
      {
        url: "https://placehold.co/320x320/00000000/3F51B5?text=Pose+8",
        label: "Dancing Pose"
      },
      {
        url: "https://placehold.co/290x290/00000000/3F51B5?text=Pose+9",
        label: "Waving Pose"
      },
      {
        url: "https://placehold.co/310x310/00000000/3F51B5?text=Pose+10",
        label: "Flying Pose"
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
      },
      {
        url: "https://placehold.co/200x100/00000000/FF4081?text=Acc+6",
        label: "Earrings"
      },
      {
        url: "https://placehold.co/180x90/00000000/FF4081?text=Acc+7",
        label: "Bracelet"
      },
      {
        url: "https://placehold.co/220x110/00000000/FF4081?text=Acc+8",
        label: "Scarf"
      },
      {
        url: "https://placehold.co/190x95/00000000/FF4081?text=Acc+9",
        label: "Tie"
      },
      {
        url: "https://placehold.co/210x105/00000000/FF4081?text=Acc+10",
        label: "Headphones"
      }
    ]
  }
];

export function LayeredImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [resizableImages, setResizableImages] = useState<Record<string, ResizableImage>>({});
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

  // State for tracking open dropdowns
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Initialize selected images as empty
  useEffect(() => {
    const initialSelected: Record<string, number> = {};
    // Do not pre-select any images
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

  // Set up canvas event listeners for drag and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // First check if we're on a resize handle
      let foundResizeHandle = false;
      
      for (const layerName in resizableImages) {
        const img = resizableImages[layerName];
        
        // Check each corner for resize handles (using a small area around each corner)
        const handleSize = 15;
        
        // Bottom-right corner (primary resize handle)
        if (
          mouseX >= img.x + img.width - handleSize && 
          mouseX <= img.x + img.width + handleSize && 
          mouseY >= img.y + img.height - handleSize && 
          mouseY <= img.y + img.height + handleSize
        ) {
          setActiveResizeHandle(layerName);
          const updatedImages = { ...resizableImages };
          updatedImages[layerName] = {
            ...img,
            isResizing: true,
            resizeStartX: mouseX,
            resizeStartY: mouseY
          };
          setResizableImages(updatedImages);
          foundResizeHandle = true;
          break;
        }
      }
      
      // If not resizing, check if we're dragging an image
      if (!foundResizeHandle) {
        // Check if we're clicking on an image to drag
        for (const layerName in resizableImages) {
          const img = resizableImages[layerName];
          
          if (
            mouseX >= img.x && 
            mouseX <= img.x + img.width && 
            mouseY >= img.y && 
            mouseY <= img.y + img.height
          ) {
            const updatedImages = { ...resizableImages };
            updatedImages[layerName] = {
              ...img,
              isDragging: true,
              dragOffsetX: mouseX - img.x,
              dragOffsetY: mouseY - img.y
            };
            setResizableImages(updatedImages);
            break;
          }
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Update cursor based on position
      let overResizeHandle = false;
      
      for (const layerName in resizableImages) {
        const img = resizableImages[layerName];
        const handleSize = 15;
        
        if (
          mouseX >= img.x + img.width - handleSize && 
          mouseX <= img.x + img.width + handleSize && 
          mouseY >= img.y + img.height - handleSize && 
          mouseY <= img.y + img.height + handleSize
        ) {
          canvas.style.cursor = 'nwse-resize';
          overResizeHandle = true;
          break;
        }
      }
      
      if (!overResizeHandle) {
        let overDraggable = false;
        
        for (const layerName in resizableImages) {
          const img = resizableImages[layerName];
          
          if (
            mouseX >= img.x && 
            mouseX <= img.x + img.width && 
            mouseY >= img.y && 
            mouseY <= img.y + img.height
          ) {
            canvas.style.cursor = 'move';
            overDraggable = true;
            break;
          }
        }
        
        if (!overDraggable) {
          canvas.style.cursor = 'default';
        }
      }
      
      // Handle resizing
      if (activeResizeHandle) {
        const img = resizableImages[activeResizeHandle];
        if (img && img.isResizing) {
          // Calculate new width and height based on mouse movement
          let newWidth = Math.max(50, img.width + (mouseX - img.resizeStartX));
          let newHeight = Math.max(50, img.height + (mouseY - img.resizeStartY));
          
          // Maintain aspect ratio if shift key is pressed
          if (e.shiftKey) {
            const aspectRatio = img.originalWidth / img.originalHeight;
            if (newWidth / newHeight > aspectRatio) {
              newWidth = newHeight * aspectRatio;
            } else {
              newHeight = newWidth / aspectRatio;
            }
          }
          
          const updatedImages = { ...resizableImages };
          updatedImages[activeResizeHandle] = {
            ...img,
            width: newWidth,
            height: newHeight,
            resizeStartX: mouseX,
            resizeStartY: mouseY
          };
          setResizableImages(updatedImages);
          redrawCanvas();
        }
      } else {
        // Handle dragging
        let isDragging = false;
        
        for (const layerName in resizableImages) {
          const img = resizableImages[layerName];
          
          if (img.isDragging) {
            isDragging = true;
            
            // Calculate new position based on mouse movement and drag offset
            const newX = mouseX - img.dragOffsetX;
            const newY = mouseY - img.dragOffsetY;
            
            const updatedImages = { ...resizableImages };
            updatedImages[layerName] = {
              ...img,
              x: newX,
              y: newY
            };
            setResizableImages(updatedImages);
            redrawCanvas();
            break;
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      // Reset dragging and resizing states
      let needsUpdate = false;
      const updatedImages = { ...resizableImages };
      
      for (const layerName in resizableImages) {
        const img = resizableImages[layerName];
        
        if (img.isDragging || img.isResizing) {
          needsUpdate = true;
          updatedImages[layerName] = {
            ...img,
            isDragging: false,
            isResizing: false
          };
        }
      }
      
      if (needsUpdate) {
        setResizableImages(updatedImages);
      }
      
      if (activeResizeHandle) {
        setActiveResizeHandle(null);
      }
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Remove event listeners on cleanup
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizableImages, activeResizeHandle]);

  // Function to redraw the canvas
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Check if any images are selected
    const hasSelectedImages = Object.keys(resizableImages).length > 0;
    
    if (!hasSelectedImages && !isLoading) {
      // Draw prompt text when no images are selected
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Select images from the panels below', canvas.width / 2, canvas.height / 2 - 30);
      
      // Add arrow icon
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      const arrowSize = 30;
      const arrowX = canvas.width / 2;
      const arrowY = canvas.height / 2 + 20;
      
      // Draw arrow shape
      ctx.moveTo(arrowX, arrowY + arrowSize);
      ctx.lineTo(arrowX - arrowSize / 2, arrowY);
      ctx.lineTo(arrowX + arrowSize / 2, arrowY);
      ctx.closePath();
      ctx.fill();
      
      return;
    }
    
    // Draw each layer in order
    imageLayers.forEach(layer => {
      const resizableImage = resizableImages[layer.name];
      if (resizableImage) {
        ctx.drawImage(
          resizableImage.img,
          resizableImage.x,
          resizableImage.y,
          resizableImage.width,
          resizableImage.height
        );
        
        // Draw resize handle at bottom-right corner
        const handleSize = 8;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#fbd743';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.rect(
          resizableImage.x + resizableImage.width - handleSize,
          resizableImage.y + resizableImage.height - handleSize,
          handleSize,
          handleSize
        );
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  // Preload all images with better error handling
  useEffect(() => {
    const preloadedImages: Record<string, HTMLImageElement[]> = {};
    const loadPromises: Array<Promise<void>> = [];
    const failedImages: Array<string> = [];

    imageLayers.forEach(layer => {
      preloadedImages[layer.name] = [];
      
      layer.images.forEach((image, index) => {
        const imageUrl = image.url;
        const imageLabel = image.label;
        
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.src = imageUrl;
          
          img.onload = () => {
            preloadedImages[layer.name][index] = img;
            resolve();
          };
          
          img.onerror = () => {
            // Instead of rejecting, just log and resolve
            // This way, the app will still function even if some images fail
            console.error(`Failed to load image: ${imageUrl}`);
            failedImages.push(imageUrl);
            
            // Create a fallback image with a color based on the layer
            const fallbackImg = new Image();
            fallbackImg.width = 400;
            fallbackImg.height = 400;
            
            // Create a canvas to generate a fallback image
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Use theme color for fallback background
              const color = layer.name === "Background" ? '#fbd743' : 
                           (layer.name === "Pose" ? '#9F9F9F' : '#ef6a43');
              
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 400, 400);
              
              // Add label text
              ctx.fillStyle = '#FFFFFF';
              ctx.font = '20px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(imageLabel || `${layer.name} ${index + 1}`, 200, 200);
              
              fallbackImg.src = canvas.toDataURL('image/png');
              preloadedImages[layer.name][index] = fallbackImg;
            }
            
            resolve();
          };
        });
        
        loadPromises.push(promise);
      });
    });

    Promise.all(loadPromises)
      .then(() => {
        setLoadedImages(preloadedImages);
        setIsLoading(false);
        // Only set error if all images failed
        setHasError(failedImages.length === imageLayers.reduce((acc, layer) => acc + layer.images.length, 0));
      });
  }, []);

  // Update resizableImages when selectedImages or loadedImages change
  useEffect(() => {
    if (isLoading || hasError || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const newResizableImages: Record<string, ResizableImage> = {};
    
    // Initialize resizable images
    imageLayers.forEach(layer => {
      const selectedIndex = selectedImages[layer.name];
      const image = loadedImages[layer.name]?.[selectedIndex];
      
      if (image) {
        // Calculate initial position to center the image
        const initialWidth = image.width;
        const initialHeight = image.height;
        const x = (canvas.width - initialWidth) / 2;
        const y = (canvas.height - initialHeight) / 2;
        
        newResizableImages[layer.name] = {
          img: image,
          x,
          y,
          width: initialWidth,
          height: initialHeight,
          isDragging: false,
          isResizing: false,
          dragOffsetX: 0,
          dragOffsetY: 0,
          resizeStartX: 0,
          resizeStartY: 0,
          originalWidth: initialWidth,
          originalHeight: initialHeight
        };
      }
    });
    
    setResizableImages(newResizableImages);
  }, [selectedImages, loadedImages, isLoading, hasError]);

  // Draw canvas when resizableImages changes
  useEffect(() => {
    redrawCanvas();
  }, [resizableImages]);

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
    
    // Create a new canvas with the same dimensions for the download
    // This ensures we download the image as displayed (with all layers)
    const canvas = canvasRef.current;
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;
    
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;
    
    // Copy the current canvas content (with all layers and their positions/sizes)
    ctx.drawImage(canvas, 0, 0);
    
    // Generate and download the image
    const dataUrl = downloadCanvas.toDataURL('image/png');
    
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
        {/* Canvas Display Panel - Moved to top */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-secondary border-b border-neutral-200 pb-2">Preview</h2>
          
          <div className="flex flex-col items-center">
            {/* Instructions for resizing */}
            <div className="mb-4 text-sm bg-primary/10 p-3 rounded-lg max-w-lg text-center">
              <p className="font-medium text-primary mb-1">Image Editing Tips:</p>
              <ul className="text-neutral-700 list-disc list-inside space-y-1 text-left">
                <li><span className="font-medium">Drag images</span> by clicking and moving them</li>
                <li><span className="font-medium">Resize images</span> by dragging the corner handle</li>
                <li>Hold <span className="font-medium">Shift</span> while resizing to maintain aspect ratio</li>
              </ul>
            </div>
            
            <div className="canvas-container mb-6 border-4 border-primary/20 rounded-lg overflow-hidden">
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
          
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-neutral-700 text-center">
              <span className="inline-block text-secondary font-medium">👇 Select images in any order you prefer! 👇</span><br/>
              Choose from each category to build your custom Bani meme.
            </p>
          </div>
          
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
                    className={`flex justify-between items-center w-full px-4 py-3 ${
                      selectedImages[layer.name] !== undefined ? 
                      'bg-primary text-primary-foreground' : 
                      'bg-primary/20 text-secondary border-2 border-dashed border-primary/30'
                    } rounded-md shadow hover:bg-primary/90 hover:text-primary-foreground transition-colors`}
                  >
                    <span className="font-medium">{
                      selectedImages[layer.name] !== undefined ? 
                      layer.name : 
                      `Select ${layer.name}`
                    }</span>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Dropdown content */}
                  <div id={`dropdown-${layer.name}`} className={`${openDropdown === layer.name ? 'block' : 'hidden'} absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-neutral-200`}>
                    <div className="max-h-60 overflow-y-auto p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {layer.images.map((image, imageIndex) => (
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
                                  src={image.url} 
                                  alt={image.label || `${layer.name} option ${imageIndex + 1}`}
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
                  <div className="w-16 h-16 bg-white rounded shadow-sm flex items-center justify-center">
                    {loadedImages[layer.name] && selectedImages[layer.name] !== undefined ? (
                      <img 
                        src={layer.images[selectedImages[layer.name]]?.url}
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