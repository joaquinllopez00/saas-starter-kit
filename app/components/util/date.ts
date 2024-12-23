const format = Intl.DateTimeFormat();

export const formatLocalDate = (date: string | Date | number): string => {
  return format.format(new Date(date));
};
