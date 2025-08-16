import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Profile management interface coming soon...
        </p>
      </div>
    </div>
  );
};

export default ProfilePage; 