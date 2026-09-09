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



///

document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-chat');
  const closeBtn = document.getElementById('close-chat');
  const chatWindow = document.getElementById('ai-chat');
  
  const loadingContainer = document.getElementById('loading-container');
  const progressBar = document.getElementById('loading-bar');
  const statusEl = document.getElementById('chat-status');
  const chatInput = document.getElementById('chat-input');
  const historyEl = document.getElementById('chat-history');

  // Ouvrir le chat et charger le modèle
  openBtn.addEventListener('click', async () => {
    openBtn.style.display = 'none';
    chatWindow.style.display = 'block';
    
    // Si le modèle est déjà en cache/chargé, on réactive direct
    if (window.aiEngine) {
      loadingContainer.style.display = 'none';
      chatInput.disabled = false;
      chatInput.style.opacity = '1';
      chatInput.placeholder = "Posez une question...";
      return; 
    }
    
    try {
      const { CreateMLCEngine } = await import("https://esm.run/@mlc-ai/web-llm");
      
      window.aiEngine = await CreateMLCEngine(
        "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC", 
        {
          initProgressCallback: (progress) => {
            // progress.progress est un chiffre entre 0 et 1
            const percent = Math.round(progress.progress * 100);
            progressBar.style.width = percent + '%';
            // Affiche le texte exact renvoyé par WebLLM (ex: "Fetching params... 45%")
            statusEl.innerText = progress.text; 
          }
        }
      );
      
      // Une fois le chargement terminé
      statusEl.innerText = "✅ IA prête et connectée !";
      setTimeout(() => { loadingContainer.style.display = 'none'; }, 2000);
      
      // On débloque l'input
      chatInput.disabled = false;
      chatInput.style.opacity = '1';
      chatInput.placeholder = "Posez une question...";
      chatInput.focus();

    } catch (err) {
      statusEl.innerText = "❌ Erreur : WebGPU n'est pas supporté sur ce navigateur.";
      progressBar.style.backgroundColor = "#ef4444"; // Rouge
      console.error(err);
    }
  });

  // Fermer le chat (sans décharger le modèle)
  closeBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    openBtn.style.display = 'block';
  });

  // Envoi des messages
  chatInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && window.aiEngine && e.target.value.trim() !== '') {
      const userText = e.target.value;
      e.target.value = '';
      
      // Afficher le message utilisateur
      historyEl.innerHTML += `<div style="text-align: right; color: var(--accent); margin-bottom: 10px;">${userText}</div>`;
      historyEl.innerHTML += `<div id="ai-loading" style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 10px;"><i>Génération en cours...</i></div>`;
      historyEl.scrollTop = historyEl.scrollHeight;

      // Désactiver l'input pendant la génération
      chatInput.disabled = true;

      try {
        const reply = await window.aiEngine.chat.completions.create({
          messages: [{ role: "user", content: userText }]
        });

        document.getElementById('ai-loading').remove();
        
        // Nettoyer les balises <think> typiques de DeepSeek R1
        const cleanReply = reply.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        
        historyEl.innerHTML += `<div style="text-align: left; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-bottom: 10px;">${cleanReply}</div>`;
      } catch (err) {
        document.getElementById('ai-loading').innerText = "❌ Erreur de génération.";
      }

      chatInput.disabled = false;
      chatInput.focus();
      historyEl.scrollTop = historyEl.scrollHeight;
    }
  });
});