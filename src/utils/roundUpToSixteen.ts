/** Since RAF does things in increments of 16 this function provides a shortcut to nearest divisible by 16 number */
const roundUpToSixteen = (num: number) => {
  const remainder = num % 16;
  if (remainder === 0) {
    return num;
  }

  return num + 16 - remainder;
};

export { roundUpToSixteen };
