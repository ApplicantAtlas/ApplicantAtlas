import api from "./AxiosInterceptor";


export const getSelectorOptions = async (name: string): Promise<string[]> => {
  const response = await api.get<string[]>(`/forms/default_selector_values/${name}`);
  return response.data;
};
