import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge(
                "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className, ...props }) => (
    <div className={twMerge("px-6 py-4 border-b border-slate-100", className)} {...props}>
        {children}
    </div>
);

export const CardContent = ({ children, className, ...props }) => (
    <div className={twMerge("p-6", className)} {...props}>
        {children}
    </div>
);
