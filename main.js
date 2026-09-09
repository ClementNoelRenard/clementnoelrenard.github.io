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
// 1. On crée le contexte secret pour l'IA (Le System Prompt)
const systemPrompt = `Tu es l'assistant virtuel du portfolio de Clément NOËL (https://clementnoelrenard.github.io/). 
Ton but est de répondre aux questions des recruteurs et visiteurs de manière professionnelle, concise et accueillante.
Voici les informations strictes sur Clément, utilise-les pour répondre :
- Âge et lieu : 23 ans (en 2025), vit à Pessac.
- Études : Bac Pro MELEC, BTS CRSA (2020-2023), BUT GEII à l'IUT de Bordeaux (Automatisme et Informatique Industrielle, 2023-2026). Prévu en apprentissage Ingénieur ESTIA (Mécatronique et Systèmes Embarqués) fin 2026. A aussi candidaté comme Officier Sous Contrat (OSC-E) dans le Génie de l'Armée de Terre.
- Expérience pro : Alternant automaticien (Equans France / Ineo Aquitaine, ISP Aquitaine, VLM Robotique, Lacosse Emballage). Compétences en rétrofit d'IHM, optimisation et supervision.
- Projets techniques : SAE Robotique (magasin industriel, bras 3 axes, TIA Portal), SAE MUGOCHAUD (régulation thermique), SAE Robot Sumo (C++, électronique).
- Compétences / Outils : Siemens TIA Portal, Schneider Unity Pro XL, OPC UA, KiCad, Fusion 360, Linux (Debian, Ubuntu), Docker, TrueNAS, Impression 3D (Elegoo Neptune 4).
- Loisirs : Ultra-trail, alpinisme (Cauterets), conception 3D, vélo gravel (Nakamura Allroad 125), photographie (Lumix S5D), Kerbal Space Program, Factorio.
- Contact : clementnoelrenard2001@ik.me.

Règle absolue : Si on te pose une question hors du contexte professionnel ou des loisirs de Clément, refuse poliment d'y répondre. Ne parle pas en anglais, réponds toujours en français.`;

// 2. On initialise l'historique de la conversation avec ce prompt
let conversationHistory = [
  { role: "system", content: systemPrompt }
];

// 3. Logique d'envoi des messages (remplace l'ancien bloc chatInput.addEventListener)
chatInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter' && window.aiEngine && e.target.value.trim() !== '') {
    const userText = e.target.value;
    e.target.value = '';
    
    // On ajoute le message du visiteur à l'historique
    conversationHistory.push({ role: "user", content: userText });
    
    // Affichage côté interface
    historyEl.innerHTML += `<div style="text-align: right; color: var(--accent); margin-bottom: 10px;">${userText}</div>`;
    historyEl.innerHTML += `<div id="ai-loading" style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 10px;"><i>Génération en cours...</i></div>`;
    historyEl.scrollTop = historyEl.scrollHeight;

    chatInput.disabled = true;

    try {
      // On envoie tout l'historique (System Prompt + questions précédentes + question actuelle)
      const reply = await window.aiEngine.chat.completions.create({
        messages: conversationHistory
      });

      document.getElementById('ai-loading').remove();
      
      const cleanReply = reply.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // On sauvegarde la réponse de l'IA dans l'historique pour qu'elle s'en souvienne pour la prochaine question
      conversationHistory.push({ role: "assistant", content: cleanReply });

      historyEl.innerHTML += `<div style="text-align: left; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-bottom: 10px;">${cleanReply}</div>`;
    } catch (err) {
      document.getElementById('ai-loading').innerText = "❌ Erreur de génération.";
    }

    chatInput.disabled = false;
    chatInput.focus();
    historyEl.scrollTop = historyEl.scrollHeight;
  }
});
