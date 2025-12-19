/**
 * InfoDisplay Component
 * Reusable component for displaying label-value pairs in forms and detail views
 */

import React from 'react';

interface InfoDisplayProps {
    label: string;
    value: string | React.ReactNode;
    className?: string;
    valueClassName?: string;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({
    label,
    value,
    className = '',
    valueClassName = ''
}) => {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {label}:
            </span>
            <div className={`text-base text-gray-900 ${valueClassName}`}>
                {value}
            </div>
        </div>
    );
};
