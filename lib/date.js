export function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function dateFromInput(value) {
  if (!value) {
    return new Date(`${toDateInputValue()}T00:00:00.000Z`);
  }

  return new Date(`${value}T00:00:00.000Z`);
}

export function addDays(inputValue, amount) {
  const date = dateFromInput(inputValue);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateInputValue(date);
}