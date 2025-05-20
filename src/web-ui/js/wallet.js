document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("#connect-wallet");
  if (!btn) return console.error("#connect-wallet button missing");
  
  // Only show in development mode, hide in production
  if (process.env.NODE_ENV === 'production') {
    btn.style.display = 'none';
    return;
  }
  
  btn.addEventListener("click", async () => {
    // Show a more informative message
    alert("Wallet connect functionality is not implemented yet. This button is only visible in development mode.");
  });
});
