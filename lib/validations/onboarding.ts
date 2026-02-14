import * as Yup from 'yup';

export const onboardingSchema = Yup.object().shape({
  personalInfo: Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    phone: Yup.string()
      .required('Phone number is required')
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/, 'Invalid phone number format'),
  }),
  companyInfo: Yup.object().shape({
    companyName: Yup.string().optional(),
    website: Yup.string().url('Invalid URL').optional(),
  }),
  professionalInfo: Yup.object().shape({
    jobTitle: Yup.string().required('Job title is required'),
    bio: Yup.string().min(50, 'Bio should be at least 50 characters').optional(),
    experience: Yup.string().optional(),
    skills: Yup.array().of(Yup.string()).min(3, 'Select at least 3 skills').optional(),
  }),
});
