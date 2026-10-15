/* Forms that cannot work without a backend never submit; they say so in the form's status region. */

const DEMO_MESSAGE = 'Esta función no está disponible en esta demostración.';

const announceDemo = (form) => {
  const notice = form.querySelector('[data-demo-notice]');
  if (!notice) return;
  // Clear first so repeated attempts are announced again by the live region.
  notice.textContent = '';
  window.setTimeout(() => {
    notice.textContent = form.dataset.demoMessage || DEMO_MESSAGE;
  }, 30);
};

export function initDemoForms() {
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      announceDemo(form);
    });
    form.querySelectorAll('[data-demo-action]').forEach((button) => {
      button.addEventListener('click', () => announceDemo(form));
    });
  });
}
