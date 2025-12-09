export const validateStatus = (status: unknown): boolean => {
  const valid = [1, 2, 3, 4];
  return valid.includes(Number(status));
};

export const validateLogin = (username: unknown, password: unknown): boolean => {
  return !!(
    typeof username === 'string' &&
    username.trim() &&
    typeof password === 'string' &&
    password.trim()
  );
};

