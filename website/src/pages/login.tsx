import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { Metadata } from 'next'
import AuthService from '@/services/AuthService';
import { User } from '../types/User';
import { eventEmitter } from '@/events/EventEmitter';
import { useRouter } from 'next/router';
// TODO: Add metadata
export const metadata: Metadata = {
  title: 'ApplicantAtlas',
  description: 'ApplicantAtlas',
}

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AuthService.login({ email, password } as User).then((_) => {
      eventEmitter.emit('success', 'Successfully logged in!');
      //generate session token here? idk
      router.push('/');
    }).catch((err) => {
      eventEmitter.emit('apiError', err.response.data.error);
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Head>
        <title>Login</title>
      </Head>

      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <Link href="/register">
              <div className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Sign Up
              </div>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
