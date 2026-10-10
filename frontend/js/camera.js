/**
 * CodeAlphaSocialMedia — Camera Manager
 * Uses browser MediaDevices API with explicit user action & track lifecycle
 */

const Camera = {
  stream: null,
  facingMode: 'user', // 'user' (front) or 'environment' (back)
  videoElement: null,
  canvasElement: null,
  capturedBlob: null,

  async startCamera(videoEl, canvasEl) {
    this.videoElement = videoEl;
    this.canvasElement = canvasEl;

    // Check device support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      API.showToast('Camera API not supported on this browser or environment (requires HTTPS/localhost).', 'error');
      return false;
    }

    try {
      // Stop any existing tracks first
      this.stopCamera();

      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      this.videoElement.style.display = 'block';
      this.canvasElement.style.display = 'none';
      return true;
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      API.showToast('Camera permission denied or camera device unavailable.', 'error');
      return false;
    }
  },

  async switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    if (this.stream) {
      await this.startCamera(this.videoElement, this.canvasElement);
    }
  },

  capturePhoto() {
    if (!this.videoElement || !this.canvasElement) return null;

    const width = this.videoElement.videoWidth || 640;
    const height = this.videoElement.videoHeight || 480;

    this.canvasElement.width = width;
    this.canvasElement.height = height;

    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return null;

    // Mirror image if front camera
    if (this.facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(this.videoElement, 0, 0, width, height);

    // Stop live stream once photo is taken
    this.stopCamera();

    this.videoElement.style.display = 'none';
    this.canvasElement.style.display = 'block';

    const dataUrl = this.canvasElement.toDataURL('image/jpeg', 0.95);
    return dataUrl;
  },

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
};
