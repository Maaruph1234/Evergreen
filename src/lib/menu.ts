/** Mobile nav toggle. Exposed on window since the markup calls it via
 * inline onclick="toggleMenu()" handlers. */
export function initMobileMenu(): void {
  const menu = document.getElementById('mobileMenu');

  (window as unknown as { toggleMenu: () => void }).toggleMenu = () => {
    menu?.classList.toggle('open');
  };
}
