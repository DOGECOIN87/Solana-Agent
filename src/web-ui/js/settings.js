document.addEventListener("DOMContentLoaded", () => {
  // Check if settings button exists
  const settingsBtn = document.querySelector("#settings-btn");
  if (!settingsBtn) return console.error("#settings-btn missing");

  // Settings modal elements
  const modal = document.querySelector("#settings-modal");
  const closeBtn = document.querySelector("#settings-close");
  const saveBtn = document.querySelector("#settings-save");
  const form = document.querySelector("#settings-form");
  
  // Open settings modal when settings button is clicked
  settingsBtn.addEventListener("click", () => {
    modal.style.display = "block";
    loadSavedSettings();
  });

  // Close modal when close button is clicked
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const settings = {};
    
    for (const [key, value] of formData.entries()) {
      settings[key] = value;
    }
    
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert("Settings saved successfully!");
        modal.style.display = "none";
      } else {
        alert(`Error: ${result.error || "Failed to save settings"}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(`Failed to save settings: ${error.message}`);
    }
  });

  // Load saved settings from the server
  async function loadSavedSettings() {
    try {
      const response = await fetch("/api/settings");
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const settings = await response.json();
      
      // Populate the form with saved settings
      Object.keys(settings).forEach(key => {
        const input = document.querySelector(`#settings-form [name="${key}"]`);
        if (input) {
          input.value = settings[key];
        }
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }
});
