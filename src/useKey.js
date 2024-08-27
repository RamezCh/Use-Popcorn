import { useEffect } from 'react';

export function useKey(key, action) {
  useEffect(
    function () {
      // Function for event
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      // Add event listener
      document.addEventListener('keydown', callback);
      // Cleanup event listener
      return function () {
        // Function must be same as one above
        document.removeEventListener('keydown', callback);
      };
    },
    [action, key]
  );
}
