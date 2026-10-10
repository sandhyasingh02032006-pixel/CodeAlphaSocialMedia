/**
 * CodeAlphaSocialMedia — Settings and Customization Controller
 * Manages Font Customization (Poppins, Inter, Roboto, Lato, Playfair Display) & Theme Customization
 */

const Settings = {
  currentPrefs: {
    font_family: 'Poppins',
    font_size: 15,
    accent_color: '#38BDF8',
    theme: 'sky-black',
    layout_density: 'comfortable',
    letter_spacing: 'normal',
    line_height: '1.6'
  },

  async init() {
    await this.loadPreferences();
    this.bindControls();
  },

  async loadPreferences() {
    try {
      const res = await API.request('/users/preferences');
      if (res.preferences) {
        this.currentPrefs = { ...this.currentPrefs, ...res.preferences };
        this.updateFormFields();
        API.applyPreferences(this.currentPrefs);
      }
    } catch (e) {
      console.error(e);
    }
  },

  updateFormFields() {
    const fontSelect = document.getElementById('setting-font-family');
    const sizeSlider = document.getElementById('setting-font-size');
    const sizeDisplay = document.getElementById('setting-font-size-val');
    const themeSelect = document.getElementById('setting-theme');
    const accentInput = document.getElementById('setting-accent-color');
    const spacingSelect = document.getElementById('setting-letter-spacing');

    if (fontSelect) fontSelect.value = this.currentPrefs.font_family;
    if (sizeSlider) sizeSlider.value = this.currentPrefs.font_size;
    if (sizeDisplay) sizeDisplay.textContent = `${this.currentPrefs.font_size}px`;
    if (themeSelect) themeSelect.value = this.currentPrefs.theme;
    if (accentInput) accentInput.value = this.currentPrefs.accent_color;
    if (spacingSelect) spacingSelect.value = this.currentPrefs.letter_spacing;

    this.updateLivePreview();
  },

  bindControls() {
    const fontSelect = document.getElementById('setting-font-family');
    const sizeSlider = document.getElementById('setting-font-size');
    const sizeDisplay = document.getElementById('setting-font-size-val');
    const themeSelect = document.getElementById('setting-theme');
    const accentInput = document.getElementById('setting-accent-color');
    const spacingSelect = document.getElementById('setting-letter-spacing');

    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        this.currentPrefs.font_family = e.target.value;
        this.updateLivePreview();
      });
    }

    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        this.currentPrefs.font_size = parseInt(e.target.value, 10);
        if (sizeDisplay) sizeDisplay.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.currentPrefs.theme = e.target.value;
        this.updateLivePreview();
      });
    }

    if (accentInput) {
      accentInput.addEventListener('input', (e) => {
        this.currentPrefs.accent_color = e.target.value;
        this.updateLivePreview();
      });
    }

    if (spacingSelect) {
      spacingSelect.addEventListener('change', (e) => {
        this.currentPrefs.letter_spacing = e.target.value;
        this.updateLivePreview();
      });
    }
  },

  updateLivePreview() {
    const previewBox = document.getElementById('settings-live-preview');
    if (!previewBox) return;

    previewBox.style.fontFamily = `'${this.currentPrefs.font_family}', sans-serif`;
    previewBox.style.fontSize = `${this.currentPrefs.font_size}px`;
    previewBox.style.letterSpacing = this.currentPrefs.letter_spacing;

    // Accent preview button
    const previewBtn = document.getElementById('preview-cta-btn');
    if (previewBtn) {
      previewBtn.style.backgroundColor = this.currentPrefs.accent_color;
    }
  },

  async savePreferences() {
    try {
      const res = await API.request('/users/preferences', {
        method: 'PUT',
        body: JSON.stringify(this.currentPrefs)
      });
      if (res.success) {
        API.applyPreferences(res.preferences);
        API.showToast('Preferences successfully saved to MySQL database!', 'success');
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  resetDefaults() {
    this.currentPrefs = {
      font_family: 'Poppins',
      font_size: 15,
      accent_color: '#38BDF8',
      theme: 'sky-black',
      layout_density: 'comfortable',
      letter_spacing: 'normal',
      line_height: '1.6'
    };
    this.updateFormFields();
    this.savePreferences();
  }
};
