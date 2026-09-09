document.addEventListener('DOMContentLoaded', () => {
  // Gestion du menu Hamburger
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if(hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    // Fermer le menu au clic sur un lien
    document.querySelectorAll('#nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }

  // Gestion des Popups (PDF / CV)
  const modalOverlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('close-modal');
  const modalFrame = document.getElementById('modal-frame');
  const modalTitle = document.getElementById('modal-title');

  // Boutons pour ouvrir le modal
  const openModalBtns = document.querySelectorAll('.open-modal');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fileUrl = btn.getAttribute('data-url');
      const title = btn.getAttribute('data-title') || 'Document';
      
      if (modalFrame && modalOverlay) {
        modalFrame.src = fileUrl;
        if(modalTitle) modalTitle.innerText = title;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêche le scroll
      }
    });
  });

  const closeModal = () => {
    if(modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      setTimeout(() => { if(modalFrame) modalFrame.src = ''; }, 300); // Nettoyer l'iframe
    }
  };

  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
});






document.getElementById('open-chat').addEventListener('click', async () => {
  document.getElementById('open-chat').style.display = 'none';
  document.getElementById('ai-chat').style.display = 'block';
  
  const statusEl = document.getElementById('chat-status');
  const historyEl = document.getElementById('chat-history');
  
  // Si le modèle est déjà chargé, on ne fait rien
  if (window.aiEngine) return; 
  
  try {
    // Import de la bibliothèque WebLLM
    const { CreateMLCEngine } = await import("https://esm.run/@mlc-ai/web-llm");
    
    // Chargement d'une version distillée de DeepSeek R1 (7 Milliards de paramètres)
    window.aiEngine = await CreateMLCEngine(
      "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC", 
      {
        initProgressCallback: (progress) => {
          statusEl.innerText = `Chargement du modèle en cache... ${Math.round(progress.progress * 100)}%`;
        }
      }
    );
    statusEl.innerText = "✅ Modèle prêt (exécuté sur votre GPU)";
  } catch (err) {
    statusEl.innerText = "❌ Erreur WebGPU : Navigateur non compatible.";
    console.error(err);
  }
});

// Logique d'envoi des messages
document.getElementById('chat-input').addEventListener('keypress', async (e) => {
  if (e.key === 'Enter' && window.aiEngine && e.target.value.trim() !== '') {
    const userText = e.target.value;
    e.target.value = '';
    
    historyEl.innerHTML += `<div style="text-align: right; color: var(--accent);">${userText}</div>`;
    historyEl.innerHTML += `<div id="ai-loading" style="color: var(--text-muted);"><i><think>Réflexion en cours...</think></i></div>`;
    historyEl.scrollTop = historyEl.scrollHeight;

    // Envoi de la requête au modèle local
    const reply = await window.aiEngine.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });

    document.getElementById('ai-loading').remove();
    // Affichage de la réponse (DeepSeek R1 inclut souvent ses réflexions entre balises <think>)
    const cleanReply = reply.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    historyEl.innerHTML += `<div style="text-align: left;">${cleanReply}</div>`;
    historyEl.scrollTop = historyEl.scrollHeight;
  }
});