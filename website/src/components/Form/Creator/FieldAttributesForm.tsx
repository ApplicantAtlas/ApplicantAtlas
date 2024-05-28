import React, { useCallback, useEffect, useState } from 'react';

import FormBuilder from '@/components/Form/FormBuilder';
import {
  FormStructure,
  FormField,
  FormFieldType,
  SelectorSource,
} from '@/types/models/Form';
import { getAllSelectors } from '@/services/FormService';

interface FieldAttributesFormProps {
  fieldType: FormFieldType;
  onAddField: (field: FormField) => void;
  initialAttributes?: FormField;
}

const defaultSelectorMessage = "I'd like to define my own options";
const isSelectorType = (fieldType: FormFieldType): boolean => {
  return (
    fieldType === 'select' ||
    fieldType === 'multiselect' ||
    fieldType === 'customselect' ||
    fieldType === 'custommultiselect' ||
    fieldType === 'radio'
  );
};

const FieldAttributesForm: React.FC<FieldAttributesFormProps> = ({
  fieldType,
  onAddField,
  initialAttributes,
}) => {
  const [formFields, setFormFields] = useState<FormStructure>();
  const [selectorSources, setSelectorSources] = useState<SelectorSource[]>();

  useEffect(() => {
    const fetchSelectorSources = async () => {
      const sources = await getAllSelectors();
      setSelectorSources(sources);
      console.log('updating selector sources with response', sources);
    };
    fetchSelectorSources();
  }, []);

  const createFormStructure = useCallback(
    (
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
          const mappedNames =
            selectorSources?.map((source) => source.sourceName) || [];
          const defaultFirst = [defaultSelectorMessage, ...mappedNames];

          attrs.push({
            key: 'selectorSource',
            question: 'Selector Source',
            description:
              "If you want to use a predefined source of options please select it here. If you don't see the source you want, select '" +
              defaultSelectorMessage +
              "' and you can enter them below.",
            type: 'select',
            required: false,
            options: defaultFirst,
            defaultOptions: initialAttributes?.additionalOptions
              ?.useDefaultValuesFrom
              ? [initialAttributes?.additionalOptions?.useDefaultValuesFrom]
              : [defaultSelectorMessage],
          });

          attrs.push({
            key: 'options',
            question: 'Options',
            description:
              "Enter the options you'd like to display in the dropdown. If you've selected a source above, these will be ignored.",
            type: 'custommultiselect',
            required: false,
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

      // TODO: rework this for selector types
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
    },
    [selectorSources],
  );

  useEffect(() => {
    const formStructure = createFormStructure(fieldType, initialAttributes);
    setFormFields(formStructure);
  }, [fieldType, initialAttributes, createFormStructure]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleFormSubmission = (formData: Record<string, any>) => {
    const type = fieldType as FormFieldType;
    let newFieldOptions = formData.options;
    if (!newFieldOptions) {
      if (isSelectorType(type)) {
        newFieldOptions = [];
      }
    }

    let selectorSource = formData.selectorSource;
    if (selectorSource === defaultSelectorMessage) {
      selectorSource = undefined;
    }

    const newField: FormField = {
      question: formData.question,
      type: type,
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
      additionalOptions: {
        useDefaultValuesFrom: selectorSource,
      },
      required: formData.required === true,
      isInternal: formData.isInternal === true,
    };

    // Call the onAddField function passed from FormCreator
    onAddField(newField);
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
