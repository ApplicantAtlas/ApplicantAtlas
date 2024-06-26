import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import AuthService from '@/services/AuthService';
import { eventEmitter } from '@/events/EventEmitter';
import FormBuilder from '@/components/Form/FormBuilder';
import { FormStructure } from '@/types/models/Form';
import { User } from '@/types/models/User';
import { IS_BACKEND_DISABLED } from '@/config/constants';
import DisabledBackend from '@/components/Auth/DisabledBackend';
import Header from '@/components/Header';
import Metadata from '@/components/Metadata';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (AuthService.isAuth()) {
      router.push('/user/dashboard');
    }
  }, [router]);

  const loginFormStructure: FormStructure = {
    attrs: [
      {
        question: 'Email',
        type: 'text',
        key: 'email',
        required: true,
        additionalValidation: {
          isEmail: {
            isEmail: true,
          },
        },
      },
      {
        question: 'Password',
        type: 'text',
        key: 'password',
        required: true,
        additionalOptions: {
          isPassword: true,
        },
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is a generic form submission handler
  const handleSubmit = (formData: Record<string, any>) => {
    const { email, password } = formData;
    AuthService.login({ email, password } as User)
      .then(() => {
        eventEmitter.emit('success', 'Successfully logged in!');
        router.push('/user/dashboard');
      })
      .catch((err) => {
        if (err.response) {
          eventEmitter.emit('apiError', err.response.data.error);
        }
      });
  };

  return (
    <>
      <Metadata title="ApplicantAtlas | Login" />
      <Header />
      <div className="flex items-center justify-center h-screen bg-gray-100">
        {IS_BACKEND_DISABLED ? (
          <DisabledBackend />
        ) : (
          <div className="w-full max-w-xs">
            <FormBuilder
              formStructure={loginFormStructure}
              submissionFunction={handleSubmit}
              buttonText="Login"
            />
            <Link href="/register">
              <div className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-pointer">
                Sign Up
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginPage;
