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

// Define corner positions for resizing
enum Corner {
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
  BottomLeft = 'BottomLeft',
  BottomRight = 'BottomRight',
  None = 'None'
}

// Define selected layer object structure
type LayerObject = {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  isDragging: boolean;
  isResizing: boolean;
  activeCorner: Corner;
  dragStartX: number;
  dragStartY: number;
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
  
  // Active manipulations
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
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
    
    console.log("Selection changed, updating layer objects with:", selectedIndexes);
    
    const canvas = canvasRef.current;
    const updatedLayerObjects: Record<string, LayerObject> = {};
    
    Object.entries(selectedIndexes).forEach(([layerName, index]) => {
      console.log(`Processing selection: ${layerName} index ${index}`);
      
      const layer = imageLayers.find(l => l.name === layerName);
      if (!layer || index === undefined) {
        console.log(`Could not find layer for ${layerName} or index is undefined`);
        return;
      }
      
      const imageItem = layer.images[index];
      if (!imageItem) {
        console.log(`Could not find image item for ${layerName} at index ${index}`);
        return;
      }
      
      console.log(`Found image item: ${imageItem.url}`);
      
      const cachedImage = imageCache.current[imageItem.url];
      if (!cachedImage) {
        console.log(`Could not find cached image for URL: ${imageItem.url}`);
        return;
      }
      
      console.log(`Found cached image with dimensions: ${cachedImage.width}x${cachedImage.height}`);
      
      // Check if we already have this layer positioned
      const existingLayer = layerObjects[layerName];
      
      if (existingLayer && existingLayer.url === imageItem.url) {
        // Keep existing position and size
        updatedLayerObjects[layerName] = existingLayer;
      } else {
        // Create new layer object centered on canvas
        const x = (canvas.width - cachedImage.width) / 2;
        const y = (canvas.height - cachedImage.height) / 2;
        
        updatedLayerObjects[layerName] = {
          url: imageItem.url,
          x,
          y,
          width: cachedImage.width,
          height: cachedImage.height,
          originalWidth: cachedImage.width,
          originalHeight: cachedImage.height,
          isDragging: false,
          isResizing: false,
          activeCorner: Corner.None,
          dragStartX: 0,
          dragStartY: 0
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
      
      // Draw resize handles on all four corners
      const handleSize = 15;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = '#fbd743';
      ctx.lineWidth = 2;
      
      // Top-left handle
      ctx.beginPath();
      ctx.rect(
        layerObj.x,
        layerObj.y,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
      
      // Top-right handle
      ctx.beginPath();
      ctx.rect(
        layerObj.x + layerObj.width - handleSize,
        layerObj.y,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
      
      // Bottom-left handle
      ctx.beginPath();
      ctx.rect(
        layerObj.x,
        layerObj.y + layerObj.height - handleSize,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
      
      // Bottom-right handle
      ctx.beginPath();
      ctx.rect(
        layerObj.x + layerObj.width - handleSize,
        layerObj.y + layerObj.height - handleSize,
        handleSize,
        handleSize
      );
      ctx.fill();
      ctx.stroke();
    });
  }, [layerObjects]);

  // Set up mouse and touch event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Helper to check which resize handle contains a point
    const getCornerAtPoint = (x: number, y: number, layer: LayerObject): Corner => {
      const handleSize = 40; // Much larger for easier grabbing
      
      // Debug layer bounds
      console.log("Testing point", x, y, "against layer", layer.url, "at", 
                  layer.x, layer.y, layer.width, layer.height);
      
      // Check top-left corner
      if (
        x >= layer.x &&
        x <= layer.x + handleSize &&
        y >= layer.y &&
        y <= layer.y + handleSize
      ) {
        console.log("Hit top-left corner!");
        return Corner.TopLeft;
      }
      
      // Check top-right corner
      if (
        x >= layer.x + layer.width - handleSize &&
        x <= layer.x + layer.width &&
        y >= layer.y &&
        y <= layer.y + handleSize
      ) {
        console.log("Hit top-right corner!");
        return Corner.TopRight;
      }
      
      // Check bottom-left corner
      if (
        x >= layer.x &&
        x <= layer.x + handleSize &&
        y >= layer.y + layer.height - handleSize &&
        y <= layer.y + layer.height
      ) {
        console.log("Hit bottom-left corner!");
        return Corner.BottomLeft;
      }
      
      // Check bottom-right corner
      if (
        x >= layer.x + layer.width - handleSize &&
        x <= layer.x + layer.width &&
        y >= layer.y + layer.height - handleSize &&
        y <= layer.y + layer.height
      ) {
        console.log("Hit bottom-right corner!");
        return Corner.BottomRight;
      }
      
      return Corner.None;
    };
    
    // Helper to check if a point is inside a layer
    const isInLayer = (x: number, y: number, layer: LayerObject) => {
      return (
        x >= layer.x &&
        x <= layer.x + layer.width &&
        y >= layer.y &&
        y <= layer.y + layer.height
      );
    };
    
    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      console.log("Mouse down at:", x, y);
      console.log("Current layers:", Object.keys(layerObjects));
      
      if (Object.keys(layerObjects).length === 0) {
        console.log("No layers to interact with");
        return;
      }
      
      // Process layers in reverse to handle top layers first
      const layerNames = Object.keys(layerObjects);
      
      // First check for resize handles
      for (let i = layerNames.length - 1; i >= 0; i--) {
        const layerName = layerNames[i];
        const layer = layerObjects[layerName];
        
        const corner = getCornerAtPoint(x, y, layer);
        if (corner !== Corner.None) {
          console.log("Resize handle clicked for layer:", layerName, "corner:", corner);
          
          setActiveLayer(layerName);
          setIsResizing(true);
          
          // Update layer state
          setLayerObjects(prev => ({
            ...prev,
            [layerName]: {
              ...layer,
              isResizing: true,
              activeCorner: corner,
              dragStartX: x,
              dragStartY: y
            }
          }));
          
          return;
        }
      }
      
      // If not resizing, check for dragging
      for (let i = layerNames.length - 1; i >= 0; i--) {
        const layerName = layerNames[i];
        const layer = layerObjects[layerName];
        
        if (isInLayer(x, y, layer)) {
          console.log("Layer clicked for dragging:", layerName);
          
          setActiveLayer(layerName);
          setIsDragging(true);
          
          // Update layer state
          setLayerObjects(prev => ({
            ...prev,
            [layerName]: {
              ...layer,
              isDragging: true,
              dragStartX: x - layer.x, // Store offset from layer origin
              dragStartY: y - layer.y
            }
          }));
          
          return;
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update cursor style
      let cursorSet = false;
      
      for (const layerName in layerObjects) {
        const layer = layerObjects[layerName];
        
        const corner = getCornerAtPoint(x, y, layer);
        if (corner !== Corner.None) {
          // Set appropriate cursor based on which corner
          if (corner === Corner.TopLeft || corner === Corner.BottomRight) {
            canvas.style.cursor = 'nwse-resize';
          } else {
            canvas.style.cursor = 'nesw-resize';
          }
          cursorSet = true;
          break;
        } else if (isInLayer(x, y, layer)) {
          canvas.style.cursor = 'move';
          cursorSet = true;
          break;
        }
      }
      
      if (!cursorSet) {
        canvas.style.cursor = 'default';
      }
      
      // Handle active layer operations
      if (!activeLayer) return;
      
      if (isResizing && layerObjects[activeLayer]) {
        const layer = layerObjects[activeLayer];
        
        // Get the delta movement
        const deltaX = x - layer.dragStartX;
        const deltaY = y - layer.dragStartY;
        
        // Variables to store new position and dimensions
        let newX = layer.x;
        let newY = layer.y;
        let newWidth = layer.width;
        let newHeight = layer.height;
        
        const aspectRatio = layer.originalWidth / layer.originalHeight;
        
        // Handle different corners
        switch (layer.activeCorner) {
          case Corner.TopLeft:
            // Update position and size inversely
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width - deltaX);
              newHeight = newWidth / aspectRatio;
              newX = layer.x + (layer.width - newWidth);
              newY = layer.y + (layer.height - newHeight);
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height - deltaY);
              newWidth = newHeight * aspectRatio;
              newX = layer.x + (layer.width - newWidth);
              newY = layer.y + (layer.height - newHeight);
            }
            break;
            
          case Corner.TopRight:
            // Update y-position and size
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width + deltaX);
              newHeight = newWidth / aspectRatio;
              newY = layer.y + (layer.height - newHeight);
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height - deltaY);
              newWidth = newHeight * aspectRatio;
              newY = layer.y + (layer.height - newHeight);
            }
            break;
            
          case Corner.BottomLeft:
            // Update x-position and size
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width - deltaX);
              newHeight = newWidth / aspectRatio;
              newX = layer.x + (layer.width - newWidth);
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height + deltaY);
              newWidth = newHeight * aspectRatio;
              newX = layer.x + (layer.width - newWidth);
            }
            break;
            
          case Corner.BottomRight:
            // Simple resize from bottom-right
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width + deltaX);
              newHeight = newWidth / aspectRatio;
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height + deltaY);
              newWidth = newHeight * aspectRatio;
            }
            break;
        }
        
        console.log("Resizing to:", newWidth, newHeight, "at position:", newX, newY);
        
        // Update layer dimensions and position
        setLayerObjects(prev => ({
          ...prev,
          [activeLayer]: {
            ...layer,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            dragStartX: x,
            dragStartY: y
          }
        }));
      } else if (isDragging && layerObjects[activeLayer]) {
        const layer = layerObjects[activeLayer];
        
        // Calculate new position
        const newX = x - layer.dragStartX;
        const newY = y - layer.dragStartY;
        
        // Update layer position
        setLayerObjects(prev => ({
          ...prev,
          [activeLayer]: {
            ...layer,
            x: newX,
            y: newY
          }
        }));
      }
    };
    
    const handleMouseUp = () => {
      if (!activeLayer) return;
      
      // Reset active states
      setIsResizing(false);
      setIsDragging(false);
      
      // Reset layer flags
      setLayerObjects(prev => {
        if (!prev[activeLayer]) return prev;
        
        return {
          ...prev,
          [activeLayer]: {
            ...prev[activeLayer],
            isResizing: false,
            isDragging: false
          }
        };
      });
      
      setActiveLayer(null);
    };
    
    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent default behavior
      
      if (e.touches.length !== 1) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Process layers in reverse to handle top layers first
      const layerNames = Object.keys(layerObjects);
      
      // Check for resize handles first
      for (let i = layerNames.length - 1; i >= 0; i--) {
        const layerName = layerNames[i];
        const layer = layerObjects[layerName];
        
        // Use getCornerAtPoint with a slightly larger touch area
        const corner = getCornerAtPoint(x, y, layer);
        
        if (corner !== Corner.None) {
          console.log("Touch resize handle detected for layer:", layerName, "corner:", corner);
          
          setActiveLayer(layerName);
          setIsResizing(true);
          
          setLayerObjects(prev => ({
            ...prev,
            [layerName]: {
              ...layer,
              isResizing: true,
              activeCorner: corner,
              dragStartX: x,
              dragStartY: y
            }
          }));
          
          return;
        }
      }
      
      // If not resizing, check for dragging
      for (let i = layerNames.length - 1; i >= 0; i--) {
        const layerName = layerNames[i];
        const layer = layerObjects[layerName];
        
        if (isInLayer(x, y, layer)) {
          setActiveLayer(layerName);
          setIsDragging(true);
          
          setLayerObjects(prev => ({
            ...prev,
            [layerName]: {
              ...layer,
              isDragging: true,
              dragStartX: x - layer.x,
              dragStartY: y - layer.y
            }
          }));
          
          return;
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length !== 1 || !activeLayer) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const layer = layerObjects[activeLayer];
      if (!layer) return;
      
      if (isResizing) {
        // Get the delta movement
        const deltaX = x - layer.dragStartX;
        const deltaY = y - layer.dragStartY;
        
        // Variables to store new position and dimensions
        let newX = layer.x;
        let newY = layer.y;
        let newWidth = layer.width;
        let newHeight = layer.height;
        
        const aspectRatio = layer.originalWidth / layer.originalHeight;
        
        // Handle different corners
        switch (layer.activeCorner) {
          case Corner.TopLeft:
            // Update position and size inversely
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width - deltaX);
              newHeight = newWidth / aspectRatio;
              newX = layer.x + (layer.width - newWidth);
              newY = layer.y + (layer.height - newHeight);
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height - deltaY);
              newWidth = newHeight * aspectRatio;
              newX = layer.x + (layer.width - newWidth);
              newY = layer.y + (layer.height - newHeight);
            }
            break;
            
          case Corner.TopRight:
            // Update y-position and size
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width + deltaX);
              newHeight = newWidth / aspectRatio;
              newY = layer.y + (layer.height - newHeight);
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height - deltaY);
              newWidth = newHeight * aspectRatio;
              newY = layer.y + (layer.height - newHeight);
            }
            break;
            
          case Corner.BottomLeft:
            // Update x-position and size
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width - deltaX);
              newHeight = newWidth / aspectRatio;
              newX = layer.x + (layer.width - newWidth);
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height + deltaY);
              newWidth = newHeight * aspectRatio;
              newX = layer.x + (layer.width - newWidth);
            }
            break;
            
          case Corner.BottomRight:
            // Simple resize from bottom-right
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width change is dominant
              newWidth = Math.max(50, layer.width + deltaX);
              newHeight = newWidth / aspectRatio;
            } else {
              // Height change is dominant
              newHeight = Math.max(50, layer.height + deltaY);
              newWidth = newHeight * aspectRatio;
            }
            break;
        }
        
        // Update layer dimensions and position
        setLayerObjects(prev => ({
          ...prev,
          [activeLayer]: {
            ...layer,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            dragStartX: x,
            dragStartY: y
          }
        }));
      } else if (isDragging) {
        // Calculate new position
        const newX = x - layer.dragStartX;
        const newY = y - layer.dragStartY;
        
        // Update layer position
        setLayerObjects(prev => ({
          ...prev,
          [activeLayer]: {
            ...layer,
            x: newX,
            y: newY
          }
        }));
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      
      if (!activeLayer) return;
      
      // Reset active states
      setIsResizing(false);
      setIsDragging(false);
      
      // Reset layer flags
      setLayerObjects(prev => {
        if (!prev[activeLayer]) return prev;
        
        return {
          ...prev,
          [activeLayer]: {
            ...prev[activeLayer],
            isResizing: false,
            isDragging: false
          }
        };
      });
      
      setActiveLayer(null);
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      // Remove event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [layerObjects, activeLayer, isResizing, isDragging]);

  // Handle layer selection
  const handleSelectLayer = (layerName: string, index: number) => {
    console.log(`Selecting ${layerName} index ${index}`);
    
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
            {/* Instructions for resizing */}
            <div className="mb-4 text-sm bg-primary/10 p-3 rounded-lg max-w-lg text-center">
              <p className="font-medium text-primary mb-1">Image Editing Tips:</p>
              <ul className="text-neutral-700 list-disc list-inside space-y-1 text-left">
                <li><span className="font-medium">Drag images</span> by clicking and moving them</li>
                <li><span className="font-medium">Resize images</span> by dragging the corner handle</li>
                <li><span className="font-medium">Double-tap</span> on mobile to reset image size</li>
                <li><span className="font-medium">Pinch to zoom</span> on mobile to resize images</li>
              </ul>
            </div>
            
            {/* Debugging Tools */}
            <div className="mb-4 flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
              <button
                onClick={() => {
                  handleSelectLayer("Background", 0);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Add Background
              </button>
              <button
                onClick={() => {
                  console.log("Current layers:", layerObjects);
                }}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Log Layers
              </button>
              <button
                onClick={() => {
                  if (Object.keys(layerObjects).length > 0) {
                    const layerName = Object.keys(layerObjects)[0];
                    const layerObj = layerObjects[layerName];
                    
                    // Create a copy of the layer with a modified resize flag to test
                    setLayerObjects(prev => ({
                      ...prev,
                      [layerName]: {
                        ...layerObj,
                        isResizing: true,
                        activeCorner: Corner.BottomRight
                      }
                    }));
                    
                    setIsResizing(true);
                    setActiveLayer(layerName);
                    
                    console.log("Set resize mode on", layerName);
                  }
                }}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Force Resize Mode
              </button>
              <button
                onClick={() => {
                  if (Object.keys(layerObjects).length > 0) {
                    const layerName = Object.keys(layerObjects)[0];
                    const layerObj = layerObjects[layerName];
                    
                    // Draw visible resize handles
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    
                    // Draw each layer
                    imageLayers.forEach(layer => {
                      const obj = layerObjects[layer.name];
                      if (!obj) return;
                      
                      const cachedImage = imageCache.current[obj.url];
                      if (!cachedImage) return;
                      
                      // Draw the image
                      ctx.drawImage(
                        cachedImage,
                        obj.x,
                        obj.y,
                        obj.width,
                        obj.height
                      );
                    });
                    
                    const handleSize = 40;
                    
                    // Draw VERY visible resize handles with labels
                    const handles = [
                      { corner: "TopLeft", x: layerObj.x, y: layerObj.y },
                      { corner: "TopRight", x: layerObj.x + layerObj.width - handleSize, y: layerObj.y },
                      { corner: "BottomLeft", x: layerObj.x, y: layerObj.y + layerObj.height - handleSize },
                      { corner: "BottomRight", x: layerObj.x + layerObj.width - handleSize, y: layerObj.y + layerObj.height - handleSize }
                    ];
                    
                    handles.forEach(handle => {
                      // Draw a very bright resize handle
                      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                      ctx.strokeStyle = 'white';
                      ctx.lineWidth = 2;
                      
                      ctx.beginPath();
                      ctx.rect(handle.x, handle.y, handleSize, handleSize);
                      ctx.fill();
                      ctx.stroke();
                      
                      // Add label
                      ctx.fillStyle = 'white';
                      ctx.font = 'bold 12px Arial';
                      ctx.fillText(handle.corner, handle.x + 5, handle.y + 20);
                    });
                    
                    console.log("Drew visible resize handles for", layerName);
                  }
                }}
                className="px-3 py-1 bg-purple-500 text-white rounded"
              >
                Draw BIG Handles
              </button>
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
            {loadError && (
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
              disabled={isLoading || Object.keys(layerObjects).length === 0}
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
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-neutral-700 text-center">
              <span className="inline-block text-secondary font-medium">Select images in any order you prefer!</span>
            </p>
          </div>
          
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