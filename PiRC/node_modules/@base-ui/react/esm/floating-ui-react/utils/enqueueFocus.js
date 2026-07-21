import { NOOP } from '@base-ui/utils/empty';
let rafId = 0;
export function enqueueFocus(el, options = {}) {
  const {
    preventScroll = false,
    cancelPrevious = true,
    sync = false
  } = options;
  if (cancelPrevious) {
    cancelAnimationFrame(rafId);
  }
  const exec = () => el?.focus({
    preventScroll
  });
  if (sync) {
    exec();
    return NOOP;
  }
  const currentRafId = requestAnimationFrame(exec);
  rafId = currentRafId;
  return () => {
    if (rafId === currentRafId) {
      cancelAnimationFrame(currentRafId);
      rafId = 0;
    }
  };
}