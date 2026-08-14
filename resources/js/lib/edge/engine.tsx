import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import {
    getVariantClasses,
    getElevationClasses,
    getAnimationClasses,
} from './definitions';
import type {
    EdgeElementSchema,
    EdgeVariant,
    EdgeElevation,
    EdgeAnimation,
} from './types';

// ─── EdgeBadge Component ──────────────────────────────────────────────────────

export interface EdgeBadgeProps {
    text: string;
    variant?: EdgeVariant;
    glow?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export const EdgeBadge = memo(function EdgeBadge({
    text,
    variant = 'accent',
    glow = false,
    className,
    icon,
}: EdgeBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-300',
                getVariantClasses(variant),
                glow &&
                    'border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
                className,
            )}
        >
            {icon && (
                <span className="flex h-3.5 w-3.5 items-center justify-center">
                    {icon}
                </span>
            )}
            <span>{text}</span>
        </span>
    );
});

// ─── EdgeButton Component ─────────────────────────────────────────────────────

export interface EdgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: EdgeVariant;
    elevation?: EdgeElevation;
    icon?: React.ReactNode;
    loading?: boolean;
    glow?: boolean;
    as?: React.ElementType;
    children: React.ReactNode;
}

export const EdgeButton = memo(function EdgeButton({
    variant = 'gradient',
    elevation = 'none',
    icon,
    loading = false,
    glow = false,
    as: Component = 'button',
    className,
    children,
    disabled,
    ...props
}: EdgeButtonProps) {
    return (
        <Component
            disabled={Component === 'button' ? disabled || loading : undefined}
            className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                getVariantClasses(variant),
                getElevationClasses(elevation),
                glow && 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
                className,
            )}
            {...(props as any)}
        >
            {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
                icon && (
                    <span className="flex h-4 w-4 items-center justify-center">
                        {icon}
                    </span>
                )
            )}
            <span>{children}</span>
        </Component>
    );
});

// ─── EdgeStat Component ───────────────────────────────────────────────────────

export interface EdgeStatProps {
    title: string;
    value: string | number;
    subValue?: string | number;
    trend?: {
        value: string | number;
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
    icon?: React.ReactNode;
    badge?: string | { text: string; variant?: EdgeVariant };
    variant?: EdgeVariant;
    elevation?: EdgeElevation;
    animation?: EdgeAnimation;
    className?: string;
    onClick?: () => void;
}

export const EdgeStat = memo(function EdgeStat({
    title,
    value,
    subValue,
    trend,
    icon,
    badge,
    variant = 'glass',
    elevation = 'md',
    animation = 'slide-up',
    className,
    onClick,
}: EdgeStatProps) {
    const badgeObj = typeof badge === 'string' ? { text: badge } : badge;

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative overflow-hidden rounded-2xl p-4 transition-transform duration-200 [transform:translateZ(0)] sm:p-5',
                onClick && 'cursor-pointer hover:-translate-y-1',
                getVariantClasses(variant),
                getElevationClasses(elevation),
                getAnimationClasses(animation),
                className,
            )}
        >
            <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl transform-gpu transition-colors duration-300 group-hover:bg-indigo-500/20" />

            <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    {icon && (
                        <div className="rounded-xl border border-slate-700/60 bg-slate-800/80 p-2 text-indigo-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-indigo-300">
                            {icon}
                        </div>
                    )}
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        {title}
                    </span>
                </div>
                {badgeObj && (
                    <EdgeBadge
                        text={badgeObj.text}
                        variant={badgeObj.variant || 'accent'}
                    />
                )}
            </div>

            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="truncate text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-indigo-200 sm:text-2xl md:text-3xl">
                    {value}
                </div>
                {subValue && (
                    <span className="truncate text-xs font-medium text-slate-400">
                        {subValue}
                    </span>
                )}
            </div>

            {trend && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
                    <span
                        className={cn(
                            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5',
                            trend.direction === 'up' &&
                                'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
                            trend.direction === 'down' &&
                                'border border-rose-500/20 bg-rose-500/10 text-rose-400',
                            trend.direction === 'neutral' &&
                                'bg-slate-800 text-slate-400',
                        )}
                    >
                        {trend.direction === 'up' && (
                            <TrendingUp className="h-3 w-3" />
                        )}
                        {trend.direction === 'down' && (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {trend.direction === 'neutral' && (
                            <Minus className="h-3 w-3" />
                        )}
                        <span>{trend.value}</span>
                    </span>
                    {trend.label && (
                        <span className="font-normal text-slate-400">
                            {trend.label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

// ─── EdgeCard Component ───────────────────────────────────────────────────────

export interface EdgeCardProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    headerAction?: React.ReactNode;
    icon?: React.ReactNode;
    variant?: EdgeVariant;
    elevation?: EdgeElevation;
    animation?: EdgeAnimation;
    glow?: boolean;
    className?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export const EdgeCard = memo(function EdgeCard({
    title,
    subtitle,
    headerAction,
    icon,
    variant = 'glass',
    elevation = 'md',
    animation = 'fade',
    glow = false,
    className,
    children,
    footer,
}: EdgeCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-5 [transform:translateZ(0)] transition-[border-color,box-shadow] duration-200',
                getVariantClasses(variant),
                getElevationClasses(elevation),
                getAnimationClasses(animation),
                glow &&
                    'border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.2)]',
                className,
            )}
        >
            {(title || subtitle || icon || headerAction) && (
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="shrink-0 rounded-xl border border-slate-700/60 bg-slate-800/80 p-2.5 text-indigo-400">
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && typeof title === 'string' ? (
                                <h3 className="text-base font-bold tracking-tight text-white">
                                    {title}
                                </h3>
                            ) : (
                                title
                            )}
                            {subtitle && typeof subtitle === 'string' ? (
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {subtitle}
                                </p>
                            ) : (
                                subtitle
                            )}
                        </div>
                    </div>
                    {headerAction && (
                        <div className="shrink-0 self-start sm:self-auto">
                            {headerAction}
                        </div>
                    )}
                </div>
            )}

            <div className="relative z-10">{children}</div>

            {footer && (
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    {footer}
                </div>
            )}
        </div>
    );
});

// ─── EdgeHeader Component ─────────────────────────────────────────────────────

export interface EdgeHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export const EdgeHeader = memo(function EdgeHeader({
    title,
    subtitle,
    badge,
    actions,
    icon,
    className,
}: EdgeHeaderProps) {
    return (
        <div
            className={cn(
                'mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 text-indigo-400 shadow-lg shadow-indigo-500/10">
                        {icon}
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                            {title}
                        </h1>
                        {badge && (
                            <EdgeBadge text={badge} variant="neon" glow />
                        )}
                    </div>
                    {subtitle && (
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {actions}
                </div>
            )}
        </div>
    );
});

// ─── EdgeGrid Component ───────────────────────────────────────────────────────

export interface EdgeGridProps {
    columns?: 1 | 2 | 3 | 4 | 6 | 12 | 'auto' | 'responsive';
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    children: React.ReactNode;
}

export const EdgeGrid = memo(function EdgeGrid({
    columns = 'responsive',
    gap = 'md',
    className,
    children,
}: EdgeGridProps) {
    const gapMap = {
        none: 'gap-0',
        xs: 'gap-2',
        sm: 'gap-3',
        md: 'gap-4 sm:gap-6',
        lg: 'gap-6 sm:gap-8',
        xl: 'gap-8 sm:gap-10',
    };

    const colMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
        12: 'grid-cols-12',
        auto: 'grid-cols-auto',
        responsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn('grid', colMap[columns], gapMap[gap], className)}>
            {children}
        </div>
    );
});

// ─── Dynamic EDGE Engine Schema Renderer ──────────────────────────────────────

export const EdgeRenderer = memo(function EdgeRenderer({
    schema,
}: {
    schema: EdgeElementSchema;
}) {
    switch (schema.kind) {
        case 'stat':
            return (
                <EdgeStat
                    title={schema.title || ''}
                    value={schema.value || 0}
                    subValue={schema.subValue}
                    trend={schema.trend}
                    icon={schema.icon}
                    badge={schema.badge}
                    variant={schema.variant}
                    elevation={schema.elevation}
                    animation={schema.animation}
                    className={schema.className}
                    onClick={schema.onClick}
                />
            );
        case 'card':
            return (
                <EdgeCard
                    title={schema.title}
                    subtitle={schema.subtitle}
                    icon={schema.icon}
                    variant={schema.variant}
                    elevation={schema.elevation}
                    animation={schema.animation}
                    className={schema.className}
                >
                    {schema.children}
                </EdgeCard>
            );
        case 'button':
            return (
                <EdgeButton
                    variant={schema.variant}
                    elevation={schema.elevation}
                    icon={schema.icon}
                    onClick={schema.onClick}
                    className={schema.className}
                >
                    {schema.title || schema.children}
                </EdgeButton>
            );
        case 'badge':
            return (
                <EdgeBadge
                    text={schema.title || String(schema.value || '')}
                    variant={schema.variant}
                    glow={schema.elevation === 'glow'}
                    className={schema.className}
                />
            );
        default:
            return (
                <div
                    className={cn(
                        'rounded-xl p-4',
                        getVariantClasses(schema.variant),
                        schema.className,
                    )}
                >
                    {schema.children || schema.title}
                </div>
            );
    }
});
