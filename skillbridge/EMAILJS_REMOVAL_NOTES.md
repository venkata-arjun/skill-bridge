Notes to fully remove EmailJS from the project

So far:

- EmailJS usage has been removed from most components; About.jsx still uses EmailJS.
- EmailJS environment variables were removed from `.env`.

To fully remove EmailJS:

1. Replace About.jsx's email sending with the app's `showAlert` dummy flow (or implement a server-side email relay).
2. Uninstall the package:
   npm uninstall @emailjs/browser

3. Remove the alias in `vite.config.js` if present.

4. Remove any remaining `.env` references (already removed).

If you'd like, I can convert `About.jsx` to use the simulated flow and then remove the dependency and alias for you.
