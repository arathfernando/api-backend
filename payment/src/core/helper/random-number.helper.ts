import * as generator from 'generate-password';

export const generateRandomNumber = async (length, isNumbers) => {
  return generator.generate({
    length,
    numbers: isNumbers,
  });
};
