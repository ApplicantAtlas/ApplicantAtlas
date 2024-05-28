export const IsObjectIDNotNull = (id: string | undefined): boolean => {
  if (!id) return false;
  return id !== '000000000000000000000000';
};
