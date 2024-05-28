export const IsObjectIDNotNull = (id: string | undefined): boolean => {
  if (!id) return false;
  return id !== '000000000000000000000000';
};

export const isZeroDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const zeroDate = new Date('0001-01-01T00:00:00.000Z');
  return date.getTime() === zeroDate.getTime();
};
