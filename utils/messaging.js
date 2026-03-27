// ── utils/messaging.js ────────────────────────────────────────────────────────
// Single source of truth for sending messages to background.js.
//
// Rejects if chrome.runtime.lastError is set (e.g. background service worker
// is temporarily inactive) so callers can catch and handle failures explicitly
// instead of silently receiving undefined.

/**
 * Send a message to background.js and return a Promise.
 *
 * @param {object} msg - message payload, must include an `action` string
 * @returns {Promise<any>} resolves with the background response
 */
export function sendMessage(msg) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}