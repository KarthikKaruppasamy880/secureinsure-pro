import React, { useState } from 'react';
import SearchInterface from '@/components/search/SearchInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-gray-600 dark:text-gray-400">
            Search across policies, claims, users, and documents.
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setInstanceKey(k => k + 1);
              toast.success('Search reset');
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      <SearchInterface
        key={instanceKey}
        onResultSelect={(result: any) => {
          // Basic routing based on type
          switch (result.type) {
            case 'policy':
              navigate('/policies');
              break;
            case 'claim':
              navigate('/claims');
              break;
            case 'user':
              navigate('/admin');
              break;
            case 'document':
              toast.info('Opening document...');
              break;
            default:
              toast('Opening item');
          }
        }}
        onAdvancedSearch={() => toast('Advanced search coming soon')}
      />
    </div>
  );
};

export default SearchPage; 