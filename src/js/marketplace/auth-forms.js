/* Sign-in, sign-up and sign-out for the demo accounts (account.html and the header). */
import { KEYS, read, write } from '../lib/storage.js';
import { notice } from './dom.js';
import { hashPassword, signIn, signOut } from './session.js';

function initLogin() {
  const login = document.querySelector('[data-auth-login]');
  if (!login) return;
  login.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = login.querySelector('#login-email').value.trim().toLowerCase();
    const password = login.querySelector('#login-password').value;
    const user = read(KEYS.users).find((item) => item.email === email);
    try {
      if (!user || user.passwordHash !== (await hashPassword(user.salt, password))) {
        notice(login, 'No encontramos esa combinación de correo y contraseña.', true);
        return;
      }
    } catch (error) {
      notice(login, error.message || 'No fue posible iniciar sesión.', true);
      return;
    }
    signIn(user);
  });
}

function initRegister() {
  const register = document.querySelector('[data-auth-register]');
  if (!register) return;
  register.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = register.querySelector('#signup-name').value.trim();
    const email = register.querySelector('#signup-email').value.trim().toLowerCase();
    const password = register.querySelector('#signup-password').value;
    const role = register.querySelector('[name="role"]:checked').value;
    const users = read(KEYS.users);
    if (users.some((user) => user.email === email)) {
      notice(register, 'Ya existe una cuenta con ese correo. Inicia sesión.', true);
      return;
    }
    try {
      const salt = crypto.randomUUID();
      const user = { name, email, role, salt, passwordHash: await hashPassword(salt, password) };
      write(KEYS.users, [...users, user]);
      signIn(user);
    } catch (error) {
      notice(register, error.message || 'No fue posible crear la cuenta.', true);
    }
  });
}

export function initAuthForms() {
  initLogin();
  initRegister();
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', signOut));
}
