
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 dark:border-teal-400"></div>
      <p className="mt-4 text-teal-800 dark:text-teal-400 font-medium">جاري التحميل...</p>
    </div>
  );
};

export default Loading;
