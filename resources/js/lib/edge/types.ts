import type { ReactNode } from 'react';

export type EdgeElementKind =
    | 'card'
    | 'stat'
    | 'button'
    | 'header'
    | 'badge'
    | 'grid'
    | 'group'
    | 'input'
    | 'accordion'
    | 'progress'
    | 'nav'
    | 'custom';

export type EdgeVariant =
    | 'default'
    | 'glass'
    | 'neon'
    | 'gradient'
    | 'subtle'
    | 'outline'
    | 'ghost'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger';

export type EdgeElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';

export type EdgeAnimation = 'fade' | 'slide-up' | 'scale' | 'bounce' | 'pulse' | 'none';

export interface EdgeActionConfig {
    label?: string;
    icon?: string | ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: EdgeVariant;
    disabled?: boolean;
    loading?: boolean;
}

export interface EdgeLayoutConfig {
    columns?: 1 | 2 | 3 | 4 | 6 | 12 | 'auto' | 'responsive';
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    direction?: 'row' | 'column';
    align?: 'start' | 'center' | 'end' | 'between' | 'stretch';
    wrap?: boolean;
}

export interface EdgeElementSchema<T = any> {
    id: string;
    kind: EdgeElementKind;
    title?: string;
    subtitle?: string;
    value?: string | number;
    subValue?: string | number;
    trend?: {
        value: string | number;
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
    icon?: ReactNode | string;
    badge?: {
        text: string;
        variant?: EdgeVariant;
        glow?: boolean;
    };
    variant?: EdgeVariant;
    elevation?: EdgeElevation;
    animation?: EdgeAnimation;
    layout?: EdgeLayoutConfig;
    actions?: EdgeActionConfig[];
    children?: ReactNode;
    payload?: T;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export interface EdgeThemeTokens {
    colors: {
        bg: {
            base: string;
            card: string;
            elevated: string;
            glass: string;
            accent: string;
        };
        border: {
            subtle: string;
            glass: string;
            accent: string;
            glow: string;
        };
        text: {
            primary: string;
            secondary: string;
            muted: string;
            accent: string;
        };
        status: {
            success: string;
            warning: string;
            danger: string;
            info: string;
        };
        gradients: {
            primary: string;
            secondary: string;
            accent: string;
            glass: string;
            glow: string;
        };
    };
    radii: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    shadows: {
        glass: string;
        neon: string;
        subtle: string;
    };
}
