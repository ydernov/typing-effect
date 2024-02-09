/**
 * A setInterval analog built around RAF
 * @param callback - A function to be called repeatedly with certain `interval`
 * @param interval
 * @returns { rafId: number } - Object containing requestAnimationFrame id to cancel the loop with `cancelAnimationFrame`
 */

export function setIntervalRAF(
  callback: (timestamp: number) => void,
  interval: number = 0
) {
  let start = performance.now();
  let handle: { rafId: number } = { rafId: 0 };

  function loop(timestamp: number) {
    let elapsed = timestamp - start;
    elapsed = elapsed >= 0 ? elapsed : 0;

    if (elapsed > interval) {
      start = timestamp;
      callback(timestamp);
    }
    handle.rafId = requestAnimationFrame(loop);
  }

  handle.rafId = requestAnimationFrame(loop);
  return handle;
}
