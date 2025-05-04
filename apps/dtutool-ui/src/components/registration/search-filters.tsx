import React from 'react';
import { Input } from '@shadcn-ui/components/input';
import { Button } from '@shadcn-ui/components/button';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isSearchEnabled: boolean;
  handleSearch: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  isSearchEnabled,
  handleSearch,
}) => {
  return (
    <div>
      <div className='flex flex-col md:flex-row'>
        <div className='flex-1 mb-3 md:mb-0'>
          <label htmlFor='search-courses' className='block text-sm font-medium mb-1'>
            Search Courses
          </label>
          <div className='flex'>
            <div className='relative flex-grow'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-4 w-4 text-muted-foreground' />
              </div>
              <Input
                id='search-courses'
                type='search'
                className='pl-10'
                placeholder={
                  isSearchEnabled
                    ? 'Search by course code, name, instructor...'
                    : 'Select Academic Year and Semester first'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!isSearchEnabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isSearchEnabled) {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={handleSearch} disabled={!isSearchEnabled} className='ml-2'>
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
