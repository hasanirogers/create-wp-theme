const toggleButton = document.getElementById('drawer-toggle');
const drawer = document.querySelector('kemet-drawer');

if (drawer) {
  toggleButton?.addEventListener('click', () => {
    drawer.opened = !drawer.opened;
  });
}
