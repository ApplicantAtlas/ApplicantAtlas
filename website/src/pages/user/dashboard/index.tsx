import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { Metadata } from 'next'
import Header from '@/components/Landing/Header';
import withAuth from '@/middleware/WithAuth';

const Dashboard: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <Header />
            <Head>
                <title>Dashboard</title>
            </Head>
            <h1 className="text-3xl font-bold text-center mt-8">Hi!</h1>
            <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/services/create-event">
                        <div className="bg-blue-200 p-4 rounded shadow cursor-pointer hover:bg-blue-300 transition">
                            <h2 className="text-lg font-semibold">Create an Event</h2>
                            <p className="text-gray-700">This is a small box with some content.</p>
                        </div> 
                    </Link>
                    <div className="bg-green-200 p-4 rounded shadow">
                        <h2 className="text-lg font-semibold">Box 2</h2>
                        <p className="text-gray-700">This is another small box with some content.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default  withAuth(Dashboard);
