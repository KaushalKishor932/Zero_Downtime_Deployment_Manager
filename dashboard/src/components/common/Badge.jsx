import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'default', className, ...props }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        error: 'bg-red-50 text-red-700 border border-red-200',
        info: 'bg-blue-50 text-blue-700 border border-blue-200',
    };

    return (
        <span
            className={twMerge(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
