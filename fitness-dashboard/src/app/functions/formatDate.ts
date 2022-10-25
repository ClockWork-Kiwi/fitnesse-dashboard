// Global function to format the given Date object into a string in the format of YYYY-MM-DD
export function formatDate(date?: Date) {
  if (!date) {
    date = new Date();
  }
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}
