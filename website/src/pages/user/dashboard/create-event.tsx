import Header from '@/components/Landing/Header';
import React from 'react';

const CreateEvent: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <Header />
            <h1 className="text-3xl font-bold text-center mt-8">Create an Event</h1>
            <div className="bg-blue-200 p-4 rounded shadow cursor-pointer hover:bg-blue-300 transition">
                    <h2 className="text-lg font-semibold">Event Type</h2>
                    <p className="text-gray-700">This is a placeholder for a form</p>
            </div>
        </div>
    );
};

export default CreateEvent;
