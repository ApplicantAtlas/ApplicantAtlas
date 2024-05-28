import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FormBuilder from '@/components/Form/FormBuilder';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import { deleteForm, updateForm } from '@/services/FormService';
import { FormStructure } from '@/types/models/Form';
import { RootState, AppDispatch } from '@/store';
import { updateFormDetails, resetFormState } from '@/store/slices/formSlice';

interface FormSettingsProps {
  onDelete: () => void;
}

const FormSettings: React.FC<FormSettingsProps> = ({ onDelete }) => {
  const dispatch: AppDispatch = useDispatch();
  const form = useSelector((state: RootState) => state.form.formDetails);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { showToast } = useToast();

  if (!form) {
    return <p>No form selected</p>;
  }

  const handleDeleteForm = async (formID: string | undefined) => {
    if (!formID) return;

    deleteForm(formID)
      .then(() => {
        showToast('Form deleted successfully', ToastType.Success);
        onDelete();
        dispatch(resetFormState()); // Clear the form details from Redux
      })
      .catch(() => {});
  };

  const formSettingStructure: FormStructure = {
    attrs: [
      {
        question: 'Form Name',
        description: 'The name of the form',
        type: 'text',
        key: 'name',
        required: true,
        defaultValue: form.name,
      },
      {
        question: 'Form Description',
        description: 'The description of the form',
        type: 'textarea',
        key: 'description',
        required: false,
        defaultValue: form.description,
      },
      {
        question: 'Allow Multiple Submissions',
        description: 'Allow users to submit the form multiple times',
        type: 'checkbox',
        key: 'allowMultipleSubmissions',
        required: false,
        defaultValue: form.allowMultipleSubmissions,
      },
      {
        question: 'Max Submissions',
        description: 'The maximum number of total submissions allowed',
        type: 'number',
        key: 'maxSubmissions',
        required: false,
        defaultValue: form.maxSubmissions,
      },
      {
        question: 'Form Status',
        description: 'The status of the form',
        type: 'radio',
        key: 'status',
        required: true,
        options: ['draft', 'published', 'closed', 'archived'],
        defaultOptions: [form.status ? form.status : 'draft'],
      },
      {
        question: 'Open Submission Date',
        description: 'The date the form will open for submissions',
        type: 'timestamp',
        key: 'openSubmissionsAt',
        required: false,
        defaultValue: form.openSubmissionsAt,
      },
      {
        question: 'Close Submission Date',
        description: 'The date the form will close for submissions',
        type: 'timestamp',
        key: 'closeSubmissionsAt',
        required: false,
        defaultValue: form.closeSubmissionsAt,
      },
      {
        question: 'Form Submission Message',
        description: 'The message to display after the form is submitted',
        type: 'textarea',
        key: 'submissionMessage',
        required: false,
        defaultValue: form.submissionMessage,
      },
      {
        question: 'Restrict This Form',
        description: 'Restrict who can submit the form',
        type: 'checkbox',
        key: 'isRestricted',
        required: false,
        defaultValue: form.isRestricted,
      },
      {
        question: 'Allowed Submitters',
        description:
          'The emails of users allowed to submit the form, this is only applicable if the form is restricted',
        type: 'textarea',
        key: 'allowedSubmitters',
        required: false,
        defaultValue: Array.isArray(form.allowedSubmitters)
          ? form.allowedSubmitters
              ?.map((submitter) => {
                if (!submitter.expiresAt) return `${submitter.email}`;
                const expiresAtDate = new Date(submitter.expiresAt);
                const isZeroDate = expiresAtDate.getTime() < 0;
                return (
                  `${submitter.email}` +
                  (submitter.expiresAt && !isZeroDate
                    ? `,expiresAt:${submitter.expiresAt}`
                    : '')
                );
              })
              .join('\n')
          : '',
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleSubmit = (formData: Record<string, any>) => {
    const {
      status,
      allowMultipleSubmissions,
      openSubmissionsAt,
      closeSubmissionsAt,
      maxSubmissions,
      submissionMessage,
      name,
      description,
      isRestricted,
    } = formData;
    let { allowedSubmitters } = formData;

    if (allowedSubmitters) {
      allowedSubmitters = allowedSubmitters
        .split('\n')
        .map((submitter: string) => {
          const [email, expiresAtPart] = submitter.split(',');
          const expiresAt = expiresAtPart
            ? expiresAtPart.split('expiresAt:')[1]
            : undefined;
          return {
            email,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          };
        });
    }

    if (allowedSubmitters == undefined || allowedSubmitters.length === 0)
      allowedSubmitters = [];

    const updatedForm = {
      ...form,
      status,
      allowMultipleSubmissions,
      openSubmissionsAt,
      closeSubmissionsAt,
      maxSubmissions,
      submissionMessage,
      name,
      description,
      isRestricted,
      allowedSubmitters,
    };

    updateForm(form.id || 't', updatedForm)
      .then(() => {
        showToast('Successfully updated form!', ToastType.Success);
        dispatch(updateFormDetails(updatedForm));
      })
      .catch((_) => {});
  };

  return (
    <>
      <FormBuilder
        formStructure={formSettingStructure}
        submissionFunction={handleSubmit}
        buttonText="Save"
      />

      <p>
        <button
          className="btn btn-outline btn-error mt-2"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete Form
        </button>
      </p>

      {showDeleteConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this form?
              <br />
              Name: {form.name}
            </h3>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleDeleteForm(form.id)}
              >
                Delete
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormSettings;
