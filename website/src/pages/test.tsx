import React from 'react';

import FormBuilder from '@/components/Form/FormBuilder';
import { FormStructure } from '@/types/models/Form';

// TODO: This is a test page for the form builder. Remove this page when done.

const Test: React.FC = () => {
  const formStructure: FormStructure = {
    attrs: [
      {
        key: 'unique_id_startTime',
        question: 'When does your event start?',
        type: 'timestamp',
        description: 'Please enter the start time of your event',
        required: false,
      },
      {
        key: 'unique_id_telephone',
        question: "What's your telephone?",
        type: 'telephone',
        description: 'Please enter your telephone',
        required: false,
      },
      {
        key: 'unique_id_email',
        question: "What's your email?",
        type: 'text',
        description: 'Please enter your email',
        additionalValidation: {
          isEmail: {
            isEmail: true,
            allowSubdomains: true,
            allowTLDs: ['edu'],
          },
        },
        required: false,
      },
      {
        key: 'unique_id_birthday',
        question: 'When is your birthday',
        type: 'customselect',
        description: 'Please enter your birthday',
        options: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        required: false,
      },
      {
        key: 'unique_id_address',
        question: "What's your address?",
        type: 'address',
        description: 'Please enter your address',
        required: false,
      },
      {
        key: 'unique_id_color',
        question: "What's your favorite color?",
        type: 'colorpicker',
        description: 'Please enter your favorite color',
        required: false,
      },
      {
        key: 'unique_id_visible',
        question: 'Is this visible?',
        type: 'checkbox',
        description: 'Please enter your favorite color',
        required: true,
      },
      {
        key: 'unique_id_schoolSelect',
        question: 'What school do you go to?',
        type: 'select',
        description: 'Please enter your school',
        additionalOptions: {
          useDefaultValuesFrom: 'mlh-schools',
        },
      },
      {
        key: 'unique_id_address',
        question: "What's your address?",
        type: 'address',
      },
    ],
  };

  const handleFormSubmit = (formData: Record<string, any>) => {
    console.log('Form Data:', formData);
  };

  return (
    <FormBuilder
      formStructure={formStructure}
      submissionFunction={handleFormSubmit}
    />
  );
};

export default Test;
