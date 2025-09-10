import React, { useState } from 'react';
import { findGolfCourses } from '../services/geminiService';
import Spinner from './Spinner';
import { GolfCourse } from '../types';
import { MapPinIcon } from './icons';

const CourseCard: React.FC<{ course: GolfCourse }> = ({ course }) => (
  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 transform hover:scale-105 transition-transform duration-200">
    <h3 className="text-lg font-bold text-green-400">{course.name}</h3>
    <p className="text-gray-300 mt-1 mb-3 text-sm">{course.description}</p>
    <div className="flex flex-wrap gap-2">
      {course.features.map((feature, index) => (
        <span key={index} className="bg-gray-600 text-gray-200 text-xs font-semibold px-2 py-1 rounded-full">{feature}</span>
      ))}
    </div>
  </div>
);

const FindCourses: React.FC = () => {
  const [location, setLocation] = useState<string>('');
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a city or location.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setCourses([]);
    setHasSearched(true);
    try {
      const results = await findGolfCourses(location);
      setCourses(results);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-green-400">Find Golf Courses</h2>
        <p className="text-gray-400 mt-2">Discover top-rated golf courses near you or your next destination.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
          placeholder="e.g., San Francisco, CA"
          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}
      
      <div className="flex-grow overflow-y-auto rounded-lg">
        {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="12" /></div>}
        
        {!isLoading && !hasSearched && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MapPinIcon className="w-20 h-20 mb-4" />
                <p className="text-lg">Enter a location to find courses.</p>
            </div>
        )}
        
        {!isLoading && hasSearched && courses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => <CourseCard key={course.name} course={course} />)}
          </div>
        )}

        {!isLoading && hasSearched && courses.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-lg">No courses found for "{location}".</p>
                <p className="text-sm">Try a different or more specific location.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default FindCourses;
