export function formatDate(date?: Date) {
  if (!date) {
    date = new Date();
  }
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}
