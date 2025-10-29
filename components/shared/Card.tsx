
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all duration-300 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default Card;
