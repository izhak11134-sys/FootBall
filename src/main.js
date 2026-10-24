import './styles.css';
const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
let draft;
try { draft = JSON.parse(localStorage.getItem(`fr-draft:${path}`)); } catch { /* Storage is optional. */ }
const preview = new URLSearchParams(location.search).get('draft') === '1';
if(preview && draft?.html) document.querySelector('#app').innerHTML = draft.html;
if(preview && draft?.css) {
  const style = document.createElement('style');
  style.textContent = draft.css;
  document.head.append(style);
}
const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(expanded));
});
document.addEventListener('keydown', event => {
  if(event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
});
