import React, { useEffect, useState } from 'react';

import FormBuilder from '@/components/Form/FormBuilder';
import { FormStructure, FormField, FormFieldType } from '@/types/models/Form';

interface FieldAttributesFormProps {
  fieldType: FormFieldType;
  onAddField: (field: FormField) => void;
  initialAttributes?: FormField;
}

const FieldAttributesForm: React.FC<FieldAttributesFormProps> = ({
  fieldType,
  onAddField,
  initialAttributes,
}) => {
  const [formFields, setFormFields] = useState<FormStructure>();

  useEffect(() => {
    const formStructure = createFormStructure(fieldType, initialAttributes);
    setFormFields(formStructure);
  }, [fieldType, initialAttributes]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleFormSubmission = (formData: Record<string, any>) => {
    const newField: FormField = {
      question: formData.question,
      type: fieldType as FormFieldType,
      key: initialAttributes?.key || '',
      defaultValue: formData.defaultValue
        ? String(formData.defaultValue)
        : undefined,
      options: formData.options,
      additionalValidation: {
        min: formData.min,
        max: formData.max,
        dateAndTimestampFromTimeField: formData.dateAndTimestampFromTimeField,
      },
      required: formData.required === true,
      isInternal: formData.isInternal === true,
    };

    // Call the onAddField function passed from FormCreator
    onAddField(newField);
  };

  const createFormStructure = (
    fieldType: FormFieldType,
    initialAttributes?: FormField,
  ): FormStructure => {
    const attrs: FormField[] = [
      {
        key: 'question',
        question: 'Field Label/Question',
        type: 'text',
        required: true,
        defaultValue: initialAttributes?.question,
      },
    ];

    switch (fieldType) {
      case 'select':
      case 'multiselect':
      case 'customselect':
      case 'custommultiselect':
      case 'radio':
        attrs.push({
          key: 'options',
          question: 'Options',
          type: 'custommultiselect',
          required: true,
          options: initialAttributes?.options,
          defaultOptions: initialAttributes?.options,
        });
        break;
      case 'date':
      case 'timestamp':
      case 'number':
        attrs.push({
          key: 'min',
          question: 'Minimum value/age',
          type: 'number',
          required: false,
          defaultValue: initialAttributes?.additionalValidation?.min,
          description:
            'The minimum value that this form will accept. Either a number for type number, or age in years for date and timestamp',
        });
        attrs.push({
          key: 'max',
          question: 'Maximum value/age',
          type: 'number',
          required: false,
          defaultValue: initialAttributes?.additionalValidation?.max,
          description:
            'The maximum value that this form will accept. Either a number for type number, or age in years for date and timestamp',
        });
        if (fieldType === 'date' || fieldType === 'timestamp') {
          attrs.push({
            key: 'dateAndTimestampFromTimeField',
            question: 'From when should the age be calculated?',
            type: 'date',
            required: false,
            defaultValue:
              initialAttributes?.additionalValidation
                ?.dateAndTimestampFromTimeField,
            description:
              'If the age should be calculated from a specific date, such as the start of your hackathon enter that date here. If your event starts on 1/2/2022 and you want 18+ enter 1/2/2004.',
          });
        }
        break;
      default:
        break;
    }

    attrs.push({
      key: 'defaultValue',
      question: 'Default Value',
      type: fieldType === 'number' ? 'number' : 'text',
      required: false,
      defaultValue: initialAttributes?.defaultValue,
    });
    attrs.push({
      key: 'required',
      question: 'Is this field required?',
      type: 'checkbox',
      required: false,
      defaultValue: initialAttributes?.required,
    });

    attrs.push({
      key: 'isInternal',
      question: 'Is this an internal field?',
      description:
        'Internal fields are not shown to the user, and only appear in the form submission data.',
      type: 'checkbox',
      required: false,
      defaultValue: initialAttributes?.isInternal,
    });

    console.log(attrs);

    return { attrs: attrs };
  };

  if (!formFields) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FormBuilder
        formStructure={formFields}
        submissionFunction={handleFormSubmission}
      />
    </div>
  );
};

export default FieldAttributesForm;
