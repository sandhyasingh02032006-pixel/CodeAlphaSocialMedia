/**
 * CodeAlphaSocialMedia — Photo Editor Module
 * Real canvas pipeline: brightness, contrast, saturation, filters, rotate, text overlays
 */

const PhotoEditor = {
  originalImage: null,
  canvas: null,
  ctx: null,

  // Settings
  brightness: 100, // 0 - 200%
  contrast: 100,   // 0 - 200%
  saturation: 100, // 0 - 200%
  filterPreset: 'normal', // 'normal', 'grayscale', 'sepia', 'cinematic'
  rotation: 0, // 0, 90, 180, 270

  // Text Overlay
  overlayText: '',
  overlayFont: 'Poppins',
  overlaySize: 28,
  overlayColor: '#38BDF8',
  overlayPosition: 'bottom', // 'top', 'center', 'bottom'

  init(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d');
  },

  loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.originalImage = img;
        this.resetFilters();
        this.render();
        resolve(true);
      };
      img.onerror = reject;
      img.src = source;
    });
  },

  resetFilters() {
    this.brightness = 100;
    this.contrast = 100;
    this.saturation = 100;
    this.filterPreset = 'normal';
    this.rotation = 0;
    this.overlayText = '';
  },

  setBrightness(val) {
    this.brightness = val;
    this.render();
  },

  setContrast(val) {
    this.contrast = val;
    this.render();
  },

  setSaturation(val) {
    this.saturation = val;
    this.render();
  },

  setFilter(preset) {
    this.filterPreset = preset;
    this.render();
  },

  rotate() {
    this.rotation = (this.rotation + 90) % 360;
    this.render();
  },

  setTextOverlay(text, font, size, color, position) {
    this.overlayText = text;
    if (font) this.overlayFont = font;
    if (size) this.overlaySize = size;
    if (color) this.overlayColor = color;
    if (position) this.overlayPosition = position;
    this.render();
  },

  render() {
    if (!this.originalImage || !this.canvas || !this.ctx) return;

    const img = this.originalImage;
    const isRotated90or270 = this.rotation === 90 || this.rotation === 270;

    const targetWidth = isRotated90or270 ? img.height : img.width;
    const targetHeight = isRotated90or270 ? img.width : img.height;

    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply rotation
    this.ctx.translate(targetWidth / 2, targetHeight / 2);
    this.ctx.rotate((this.rotation * Math.PI) / 180);

    // Apply CSS filters directly to canvas context
    let filterStr = `brightness(${this.brightness}%) contrast(${this.contrast}%) saturate(${this.saturation}%)`;
    if (this.filterPreset === 'grayscale') {
      filterStr += ' grayscale(100%)';
    } else if (this.filterPreset === 'sepia') {
      filterStr += ' sepia(90%) contrast(110%)';
    } else if (this.filterPreset === 'cinematic') {
      filterStr += ' contrast(125%) saturate(130%) hue-rotate(-10deg)';
    }

    this.ctx.filter = filterStr;
    this.ctx.drawImage(img, -img.width / 2, -img.height / 2);
    this.ctx.restore();

    // Text Overlay
    if (this.overlayText.trim()) {
      this.ctx.save();
      this.ctx.font = `bold ${this.overlaySize}px '${this.overlayFont}', sans-serif`;
      this.ctx.fillStyle = this.overlayColor;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;

      let yPos = this.canvas.height - 40;
      if (this.overlayPosition === 'top') yPos = 50 + this.overlaySize;
      if (this.overlayPosition === 'center') yPos = this.canvas.height / 2;

      this.ctx.fillText(this.overlayText, this.canvas.width / 2, yPos);
      this.ctx.restore();
    }
  },

  // Export edited output as Base64 for actual backend upload
  exportImageBase64() {
    if (!this.canvas) return null;
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }
};
