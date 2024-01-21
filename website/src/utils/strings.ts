export const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt: string) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  };
  
