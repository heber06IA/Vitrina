/* DOM helpers for the marketplace views. Text always goes through textContent, never innerHTML. */

export const el = (tag, className = '', text = '') => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

/* Writes a message in the form's status region; `error` switches it to the danger color. */
export const notice = (form, message, error = false) => {
  const target = form.querySelector('[data-auth-notice], [data-product-notice]');
  if (target) {
    target.textContent = message;
    target.classList.toggle('text-danger', error);
  }
};
