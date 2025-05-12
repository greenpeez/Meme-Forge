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
      
      // Auto-fit image to canvas - calculate scaled dimensions to fit within canvas
      const maxWidth = canvas.width - 40; // Leave some padding
      const maxHeight = canvas.height - 40;
      
      // Calculate the scaling factor to fit image in canvas
      const widthRatio = maxWidth / cachedImage.width;
      const heightRatio = maxHeight / cachedImage.height;
      const scaleFactor = Math.min(widthRatio, heightRatio);
      
      // Calculate dimensions that maintain aspect ratio and fit within canvas
      const scaledWidth = cachedImage.width * scaleFactor;
      const scaledHeight = cachedImage.height * scaleFactor;
      
      // Center the image on canvas
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      
      console.log("Auto-fitting image with dimensions:", 
        cachedImage.width, "x", cachedImage.height, 
        "to", scaledWidth, "x", scaledHeight);
      
      // Create or update layer object
      updatedLayerObjects[layerName] = {
        url: imageItem.url,
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
        originalWidth: cachedImage.width,
        originalHeight: cachedImage.height
      };
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Select images from the panels below', canvas.width / 2, canvas.height / 2 - 30);
      
      // Add arrow icon
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

  // Function to download the canvas as an image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'bani-meme.png';
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to convert canvas to blob');
        return;
      }
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      link.href = url;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the object URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    });
  };

  // Handle layer selection
  const handleSelectLayer = (layerName: string, index: number) => {
    setSelectedIndexes(prev => ({
      ...prev,
      [layerName]: index
    }));
    setOpenDropdown(null);
  };

  // Toggle dropdown visibility
  const toggleDropdown = (layerName: string) => {
    if (openDropdown === layerName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(layerName);
    }
  };

  return (
    <div className="layered-image-generator">
      <div className="preview-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="preview-canvas"
        />
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading images...</p>
          </div>
        )}
        {loadError && (
          <div className="error-overlay">
            <p>Error loading some images. Please try again.</p>
          </div>
        )}
      </div>
      
      <div className="editing-tips">
        <p>Image Editing Tips:</p>
        <ul>
          <li>Select a background, pose, and accessories to create your image</li>
          <li>Images will automatically fit to the preview window</li>
          <li>Each new selection will replace the previous one in that category</li>
        </ul>
      </div>
      
      <div className="controls">
        <div className="layer-selectors">
          {imageLayers.map(layer => (
            <div key={layer.name} className="layer-select">
              <button
                id={`button-${layer.name}`}
                className={`dropdown-button ${openDropdown === layer.name ? 'active' : ''}`}
                onClick={() => toggleDropdown(layer.name)}
              >
                {layer.name} {selectedIndexes[layer.name] !== undefined ? '✓' : ''}
              </button>
              
              {openDropdown === layer.name && (
                <div id={`dropdown-${layer.name}`} className="dropdown-menu">
                  {layer.images.map((image, idx) => (
                    <div
                      key={idx}
                      className={`dropdown-item ${selectedIndexes[layer.name] === idx ? 'selected' : ''}`}
                      onClick={() => handleSelectLayer(layer.name, idx)}
                    >
                      <div className="image-preview">
                        <img src={image.url} alt={image.label} />
                      </div>
                      <span>{image.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <button className="download-button" onClick={downloadImage}>
          Download
        </button>
      </div>
    </div>
  );
}