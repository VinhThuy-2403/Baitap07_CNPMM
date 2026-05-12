import React from 'react';
import { AlertCircle } from 'lucide-react';

const InputField = ({ label, type, name, value, onChange, placeholder, icon: Icon, error, required = false }) => {
  return (
    <div className="w-full mb-4 text-left">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-xl border ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white/50 backdrop-blur-sm transition-all duration-200 ease-in-out sm:text-sm shadow-sm text-gray-900`}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;
