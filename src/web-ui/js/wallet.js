document.addEventListener("DOMContentLoaded", () => {
      const btn = document.querySelector("#connect-wallet");
        if (!btn) return console.error("#connect-wallet button missing");
          btn.addEventListener("click", async () => {
                // stubbed wallet connect logic
                    alert("Wallet connect coming soon…");
          });
});
