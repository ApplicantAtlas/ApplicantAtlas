import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import FormBuilder from '@/components/Form/FormBuilder';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import AuthService from '@/services/AuthService';
import { getEvent } from '@/services/EventService';
import { getForm } from '@/services/FormService';
import { SubmitResponse } from '@/services/ResponsesService';
import { EventModel } from '@/types/models/Event';
import { FormStructure } from '@/types/models/Form';

const FormSubmission = () => {
  const router = useRouter();
  const { eventId, formId } = router.query;
  const [formStructure, setFormStructure] = useState<FormStructure | null>(
    null,
  );
  const [event, setEvent] = useState<EventModel | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { showToast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!eventId || !formId) return;

    getEvent(eventId as string)
      .then((r) => {
        setEvent(r.data.event);
      })
      .catch((e) => {
        let msg = 'Could not retrieve this form, is it a valid?';
        if (e.response?.data?.error) {
          msg = e.response.data.error;
        }
        setErr(msg);
      });

    getForm(formId as string)
      .then((r) => {
        if (r.status !== 'published') {
          const msg =
            'This form is not published yet, please contact the event organizers if you believe this is incorrect.';
          showToast(msg, ToastType.Error);
          setErr(msg);
        } else {
          // Remove internal fields from the form
          r.attrs = r.attrs.filter((field) => !field.isInternal);

          setFormStructure(r);
        }
      })
      .catch((e) => {
        let msg = 'Could not retrieve this form, is it a valid?';
        if (e.response?.data?.error) {
          msg = e.response.data.error;
        }
        setErr(msg);
      });
  }, [eventId, formId, showToast]);

  if (!AuthService.isAuth) {
    showToast('You must be logged in to access this form.', ToastType.Error);
    router.push('/login');
  }

  if (err) {
    return (
      <>
        <Header />
        <div className="p-4">
          <p>{err}</p>
          <small>
            Please contact the event organizers if you believe this is an error.
          </small>
        </div>
      </>
    );
  }

  if (!formStructure || !event) return <LoadingSpinner />;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission
  const onSubmission = (formData: Record<string, any>) => {
    SubmitResponse(formStructure.id || '', formData)
      .then(() => {
        showToast('Successfully submitted form!', ToastType.Success);
        setHasSubmitted(true);
      })
      .catch(() => {});
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Header showUserProfile={true} />
        <div className="p-4">
          {!hasSubmitted && (
            <>
              <h1 className="text-3xl font-semibold text-gray-800 mt-4">
                {formStructure.name}
              </h1>
              <FormBuilder
                formStructure={formStructure}
                submissionFunction={onSubmission}
              />
            </>
          )}

          {hasSubmitted && (
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-3xl font-semibold text-gray-800 mt-4">
                {formStructure.name}
              </h1>
              <p className="text-xl font-semibold text-gray-800 mt-4">
                {formStructure.submissionMessage ||
                  'Thank you for submitting this form!'}
              </p>
              <p className="text-gray-600 mt-2">
                You can close this page
                {formStructure.allowMultipleSubmissions && (
                  <>, or submit another form.</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormSubmission;
