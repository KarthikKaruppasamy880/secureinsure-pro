import React from 'react';

const SearchPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Search across policies, claims, and customer data.
        </p>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Search interface coming soon...
        </p>
      </div>
    </div>
  );
};

export default SearchPage; 