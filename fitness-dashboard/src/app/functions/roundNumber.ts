export function roundNumber(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
