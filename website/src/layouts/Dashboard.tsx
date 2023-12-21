import React, { ReactNode } from 'react';

interface DashboardProps {
    children: ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
    return (
        <div>
            {/* Header */}
            <header>
                {/* Add your header content here */}
            </header>

            {/* Sidebar */}
            <aside>
                {/* Add your sidebar content here */}
            </aside>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer>
                {/* Add your footer content here */}
            </footer>
        </div>
    );
};

export default Dashboard;
