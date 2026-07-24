export function createManagedSpinner(spinner) {
  let active = false;

  return {
    start(message) {
      if (active) {
        if (typeof spinner.message === 'function') {
          spinner.message(message);
          return;
        }

        spinner.stop();
        active = false;
      }

      spinner.start(message);
      active = true;
    },

    stop(message, code) {
      if (!active) return;
      spinner.stop(message, code);
      active = false;
    },

    get active() {
      return active;
    },
  };
}
