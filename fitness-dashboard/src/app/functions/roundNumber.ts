// Global function that rounds the given number to 2dp, only if necessary
export function roundNumber(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
