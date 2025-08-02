
export const formatDateForDisplay = (isoString: string | null): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTimeForInput = (isoString: string | null): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format for datetime-local input
};

export const convertInputToISO = (inputValue: string): string => {
  if (!inputValue) return '';
  // Input format is YYYY-MM-DDTHH:mm, convert to ISO string
  return new Date(inputValue).toISOString();
};
