export type PropertyOption = {
  id: string;
  name: string;
};

export const findPropertyOption = (optionId: string, options: PropertyOption[]): PropertyOption | undefined => {
  return options.find((option) => option.id === optionId);
};
