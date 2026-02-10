import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    loading,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-500/20',
        secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 border border-slate-200 shadow-sm',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-lg shadow-rose-500/20',
        ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={twMerge(
                baseStyles,
                variants[variant],
                sizes[size],
                loading && 'opacity-70 cursor-wait',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
};
