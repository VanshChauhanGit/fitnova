export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
};

export const validatePassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return strongPasswordRegex.test(password);
};

export const validateName = (name) => {
  return name.trim().length >= 3;
};

export const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]+$/;

  return regex.test(username) && username.length >= 3;
};

export const validateAge = (age) => {
  const num = Number(age);

  return num >= 13 && num <= 100;
};

export const validateHeight = (height) => {
  const num = Number(height);

  return num >= 100 && num <= 250;
};

export const validateWeight = (weight) => {
  const num = Number(weight);

  return num >= 30 && num <= 250;
};