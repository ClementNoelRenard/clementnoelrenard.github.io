document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. GESTION DU MENU HAMBURGER (Ton code d'origine)
  // ==========================================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if(hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    document.querySelectorAll('#nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }

  // ==========================================
  // 2. GESTION DES POPUPS PDF / CV (Ton code d'origine)
  // ==========================================
  const modalOverlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('close-modal');
  const modalFrame = document.getElementById('modal-frame');
  const modalTitle = document.getElementById('modal-title');
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
        document.body.style.overflow = 'hidden'; 
      }
    });
  });

  const closeModal = () => {
    if(modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      setTimeout(() => { if(modalFrame) modalFrame.src = ''; }, 300); 
    }
  };

  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // ==========================================
  // 3. GESTION DE L'IA (WebLLM - DeepSeek 1.5B)
  // ==========================================
  const openChatBtn = document.getElementById('open-chat');
  const closeChatBtn = document.getElementById('close-chat');
  const chatWindow = document.getElementById('ai-chat');
  
  const loadingContainer = document.getElementById('loading-container');
  const progressBar = document.getElementById('loading-bar');
  const statusEl = document.getElementById('chat-status');
  const chatInput = document.getElementById('chat-input');
  const historyEl = document.getElementById('chat-history');

  // Contexte secret de l'IA (Ton profil)
  const systemPrompt = `Tu es l'assistant virtuel du portfolio de Clément NOËL (https://clementnoelrenard.github.io/). 
Ton but est de répondre aux questions des recruteurs et visiteurs de manière professionnelle, concise et accueillante.
Voici les informations strictes sur Clément, utilise-les pour répondre :
- Âge et lieu : 23 ans, vit à Pessac.
- Études : Bac Pro MELEC, BTS CRSA, BUT GEII à l'IUT de Bordeaux. Prévu en apprentissage Ingénieur ESTIA (Mécatronique et Systèmes Embarqués) fin 2026. A aussi candidaté comme Officier Sous Contrat (OSC-E) dans le Génie de l'Armée de Terre.
- Expérience pro : Alternant automaticien (Equans France / Ineo Aquitaine, ISP Aquitaine, VLM Robotique, Lacosse Emballage). Compétences en rétrofit d'IHM, optimisation et supervision.
- Projets techniques : SAE Robotique (magasin industriel, bras 3 axes, TIA Portal), SAE MUGOCHAUD (régulation thermique), SAE Robot Sumo.
- Compétences / Outils : Siemens TIA Portal, Schneider Unity Pro XL, OPC UA, KiCad, Fusion 360, Linux (Debian, Ubuntu), Docker, TrueNAS, Impression 3D (Elegoo Neptune 4).
- Loisirs : Ultra-trail, alpinisme (Cauterets), conception 3D, vélo gravel (Nakamura Allroad 125), photographie (Lumix S5D), Kerbal Space Program, Factorio.
- Contact : clementnoelrenard2001@ik.me.

Règle absolue : Si on te pose une question hors du contexte professionnel ou des loisirs de Clément, refuse poliment d'y répondre. Ne parle pas en anglais, réponds toujours en français.`;

  // Historique de la conversation
  let conversationHistory = [
    { role: "system", content: systemPrompt }
  ];

  // Si le bouton d'ouverture existe sur la page, on active l'IA
  if(openChatBtn && chatWindow) {
    
    // Ouverture du chat et chargement
    openChatBtn.addEventListener('click', async () => {
      openChatBtn.style.display = 'none';
      chatWindow.style.display = 'block';
      
      // On évite de recharger le modèle s'il est déjà prêt
      if (window.aiEngine) {
        loadingContainer.style.display = 'none';
        chatInput.disabled = false;
        chatInput.style.opacity = '1';
        chatInput.placeholder = "Posez une question...";
        return; 
      }
      
      try {
        const { CreateMLCEngine } = await import("https://esm.run/@mlc-ai/web-llm");
        
        // Chargement du modèle distillé (1.5B) compatible petites RAM
        window.aiEngine = await CreateMLCEngine(
          "DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC", 
          {
            initProgressCallback: (progress) => {
              const percent = Math.round(progress.progress * 100);
              progressBar.style.width = percent + '%';
              statusEl.innerText = progress.text; 
            }
          }
        );
        
        statusEl.innerText = "✅ IA prête et connectée !";
        setTimeout(() => { loadingContainer.style.display = 'none'; }, 2000);
        
        chatInput.disabled = false;
        chatInput.style.opacity = '1';
        chatInput.placeholder = "Posez une question...";
        chatInput.focus();

      } catch (err) {
        statusEl.innerText = "❌ Erreur : WebGPU n'est pas supporté.";
        progressBar.style.backgroundColor = "#ef4444";
        console.error("Erreur WebLLM:", err);
      }
    });

    // Fermeture du chat
    closeChatBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      openChatBtn.style.display = 'block';
    });

    // Envoi d'un message
    chatInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && window.aiEngine && e.target.value.trim() !== '') {
        const userText = e.target.value;
        e.target.value = '';
        
        // On sauvegarde le message utilisateur
        conversationHistory.push({ role: "user", content: userText });
        
        // On l'affiche
        historyEl.innerHTML += `<div style="text-align: right; color: var(--accent); margin-bottom: 10px;">${userText}</div>`;
        historyEl.innerHTML += `<div id="ai-loading" style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 10px;"><i>Génération en cours...</i></div>`;
        historyEl.scrollTop = historyEl.scrollHeight;

        chatInput.disabled = true;

        try {
          // On envoie tout le contexte à l'IA
          const reply = await window.aiEngine.chat.completions.create({
            messages: conversationHistory
          });

          document.getElementById('ai-loading').remove();
          
          // On nettoie la réponse des balises <think> (spécifique à DeepSeek)
          const cleanReply = reply.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          
          // On sauvegarde la réponse de l'IA
          conversationHistory.push({ role: "assistant", content: cleanReply });

          // On affiche la réponse
          historyEl.innerHTML += `<div style="text-align: left; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-bottom: 10px;">${cleanReply}</div>`;
        } catch (err) {
          document.getElementById('ai-loading').innerText = "❌ Erreur lors de la génération.";
          console.error("Erreur de génération:", err);
        }

        chatInput.disabled = false;
        chatInput.focus();
        historyEl.scrollTop = historyEl.scrollHeight;
      }
    });
  }
});
