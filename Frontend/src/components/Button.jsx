import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, onClick, type = 'button', isLoading = false, disabled = false, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:-translate-y-0.5 ${
        (isLoading || disabled) ? 'opacity-70 cursor-not-allowed transform-none hover:-translate-y-0' : ''
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="animate-spin h-5 w-5 text-white" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
