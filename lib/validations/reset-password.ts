import * as Yup from 'yup';

export const resetPasswordSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, 'Verification code must be 6 digits')
    .required('Verification code is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')

    .required('Please confirm your password'),
});
