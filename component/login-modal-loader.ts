// The login modal contains the login form, which pulls in the form-validation library (Zod, ~100KB
// gzipped). Every signed-out page has the modal in its header, so it is loaded as its own chunk the
// first time someone shows interest, not with every page.
//
// Call this on hover, focus or touch of anything that opens the modal, so the chunk is usually
// already in the browser by the time the click lands. Calling it again is free (same module).
export function preloadLoginModal() {
  void import('@/component/LoginModal');
}
