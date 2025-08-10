import React from 'react';

interface TableCellsIconProps {
  className?: string;
}

const TableCellsIcon: React.FC<TableCellsIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h-1.5m1.5 0v-1.5m17.25 0v-1.5m0 0h1.5m-1.5 0h-17.25m-1.5 0v-1.5c0-.621.504-1.125 1.125-1.125h1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 7.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h-1.5m1.5 0v-1.5m17.25 0v-1.5m0 0h1.5m-1.5 0h-17.25m-1.5 0v-1.5c0-.621.504-1.125 1.125-1.125h1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 13.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h-1.5m1.5 0v-1.5m17.25 0v-1.5m0 0h1.5m-1.5 0h-17.25m-1.5 0v-1.5c0-.621.504-1.125 1.125-1.125h1.5" />
    </svg>
  );
};

export default TableCellsIcon;
