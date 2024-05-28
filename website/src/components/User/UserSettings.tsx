import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { User } from '@/types/models/User';
import { getUserFull, updateUser } from '@/services/UserService';
import { useToast, ToastType } from '@/components/Toast/ToastContext';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';
import { FormStructure } from '@/types/models/Form';
import FormBuilder from '@/components/Form/FormBuilder';
import AuthService from '@/services/AuthService';

import Header from '../Header';
import Footer from '../Footer';

const UserSettings: React.FC = () => {
  const [user, setUser] = useState<User | undefined>();
  const [formFields, setFormFields] = useState<FormStructure | undefined>();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    getUserFull()
      .then((r) => {
        setUser(r);
        setFormFields(createFormStructure(r));
      })
      .catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.',
      )
    ) {
      AuthService.deleteUser()
        .then(() => {
          AuthService.logout();
          showToast('Account deleted successfully', ToastType.Success);
          router.push('/');
        })
        .catch(() => {});
    }
  };

  const createFormStructure = (user: User): FormStructure => {
    return {
      attrs: [
        {
          key: 'firstName',
          question: 'First Name',
          type: 'text',
          required: true,
          defaultValue: user?.firstName,
        },
        {
          key: 'lastName',
          question: 'Last Name',
          type: 'text',
          required: true,
          defaultValue: user?.lastName,
        },
        {
          key: 'email',
          question: 'Email',
          type: 'text',
          additionalValidation: {
            isEmail: {
              isEmail: true,
            },
          },
          required: true,
          defaultValue: user?.email,
        },
        {
          key: 'schoolEmail',
          question: 'School Email',
          type: 'text',
          additionalValidation: {
            isEmail: {
              isEmail: true,
              allowTLDs: ['edu'],
              allowSubdomains: true,
            },
          },
          required: false,
          defaultValue: user?.schoolEmail,
        },
        {
          key: 'alternativeEmails',
          question: 'Alternative Emails',
          type: 'custommultiselect',
          required: false,
          defaultValue: user?.alternativeEmails,
        },
        {
          key: 'birthday',
          question: 'Birthday',
          type: 'date',
          required: true,
          defaultValue: user?.birthday,
        },
      ],
    };
  };

  const handleFormSubmission = (formData: Record<string, any>) => {
    // Convert birthday from Date object to format with utc, 0 padded month and day
    const d = new Date(formData.birthday);
    const year = d.getUTCFullYear();
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');

    formData.birthday = `${month}/${day}/${year}`;

    updateUser(formData as User)
      .then((_) => {
        getUserFull()
          .then((r) => {
            setUser(r);
            setFormFields(createFormStructure(r));
          })
          .catch(() => {});
        showToast('Account updated successfully', ToastType.Success);
      })
      .catch(() => {});
  };

  if (!user || !formFields) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <Header
        menuItems={[{ label: 'My Events', href: '/user/dashboard' }]}
        showUserProfile={true}
      />
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold">User Settings</h2>
        <FormBuilder
          formStructure={formFields}
          submissionFunction={handleFormSubmission}
        />

        <button className="btn btn-error mt-4" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
      <Footer />
    </>
  );
};

export default UserSettings;
