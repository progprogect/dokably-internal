export const getСontrastingСolor = (color: string) => {
  return parseInt(color.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff';
};

export const colors: string[] = [
  '#fff9b1',
  '#9FBFFF',
  '#6598FF',
  '#4A86FF',
  '#FF6CA1',
  '#FF5065',
  '#65D7A0',
  '#FF647E',
];
