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