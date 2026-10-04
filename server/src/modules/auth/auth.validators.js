const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterInput = (req) => {
  const { name, email, password, role } = req.body || {};
  const errors = [];

  if (!name || String(name).trim().length < 2) {
    errors.push('Name is required');
  }

  if (!email || !EMAIL_REGEX.test(String(email).trim())) {
    errors.push('Valid email is required');
  }

  if (!password || String(password).length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!role || !['student', 'instructor'].includes(role)) {
    errors.push('Role must be student or instructor');
  }

  return errors;
};

export const validateLoginInput = (req) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || !EMAIL_REGEX.test(String(email).trim())) {
    errors.push('Valid email is required');
  }

  if (!password || String(password).length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};
