/**
 * Extract the dominant color from an image using a hidden canvas.
 * Returns an HSL color that is suitable for UI accenting.
 */
export async function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // Resize to a tiny version for performance
      const size = 50
      canvas.width = size
      canvas.height = size
      
      ctx.drawImage(img, 0, 0, size, size)
      
      try {
        const imageData = ctx.getImageData(0, 0, size, size).data
        let r = 0, g = 0, b = 0
        
        // Sum colors (skip alpha)
        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i]
          g += imageData[i + 1]
          b += imageData[i + 2]
        }
        
        // Average
        const count = imageData.length / 4
        r = Math.floor(r / count)
        g = Math.floor(g / count)
        b = Math.floor(b / count)
        
        // Convert to HSL for better UI control
        const { h, s, l } = rgbToHsl(r, g, b)
        
        // Optimize for UI: Ensure it's not too dark or too light
        // Aim for S: 60-80%, L: 45-60%
        const finalS = Math.max(60, Math.min(80, s))
        const finalL = Math.max(45, Math.min(60, l))
        
        resolve(`hsl(${h}, ${finalS}%, ${finalL}%)`)
      } catch (e) {
        reject(e)
      }
    }
    
    img.onerror = (e) => reject(e)
  })
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
