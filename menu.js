/* ═════════════════════════════════════════════════════════════════════════════
   FAKENEWS - JAVASCRIPT MENU MOBILE
   ═════════════════════════════════════════════════════════════════════════════ */

const menuToggle = document.querySelector('.menu_toggle');
const menuLinks = document.querySelector('.menu_links');

// Toggle do menu ao clicar no hambúrguer
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuLinks.classList.toggle('active');
    });
}

// Fecha o menu ao clicar em um link
if (menuLinks) {
    menuLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuLinks.classList.remove('active');
        });
    });
}