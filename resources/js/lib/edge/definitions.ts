import type { EdgeThemeTokens, EdgeVariant, EdgeElevation, EdgeAnimation } from './types';

export const EDGE_THEME: EdgeThemeTokens = {
    colors: {
        bg: {
            base: '#090D16',
            card: '#121827',
            elevated: '#1E293B',
            glass: 'rgba(18, 24, 39, 0.75)',
            accent: 'rgba(99, 102, 241, 0.15)',
        },
        border: {
            subtle: 'rgba(255, 255, 255, 0.08)',
            glass: 'rgba(255, 255, 255, 0.12)',
            accent: 'rgba(99, 102, 241, 0.4)',
            glow: 'rgba(139, 92, 246, 0.5)',
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
            muted: '#64748B',
            accent: '#818CF8',
        },
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            info: '#06B6D4',
        },
        gradients: {
            primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            secondary: 'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 100%)',
            accent: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            glass: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            glow: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 75%)',
        },
    },
    radii: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
    },
    shadows: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        neon: '0 0 20px rgba(99, 102, 241, 0.35)',
        subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    },
};

export function getVariantClasses(variant: EdgeVariant = 'default'): string {
    switch (variant) {
        case 'glass':
            return 'bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-xl hover:border-white/20 transition-all duration-300';
        case 'neon':
            return 'bg-slate-900/90 border border-indigo-500/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300';
        case 'gradient':
            return 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 border border-white/20 transition-all duration-300';
        case 'accent':
            return 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all duration-300';
        case 'success':
            return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300';
        case 'warning':
            return 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all duration-300';
        case 'danger':
            return 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all duration-300';
        case 'subtle':
            return 'bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-800/70 transition-all duration-200';
        case 'outline':
            return 'bg-transparent border border-slate-700 text-slate-200 hover:border-indigo-500/50 hover:text-white transition-all duration-200';
        case 'ghost':
            return 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200';
        case 'default':
        default:
            return 'bg-slate-900/80 border border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition-all duration-200';
    }
}

export function getElevationClasses(elevation: EdgeElevation = 'none'): string {
    switch (elevation) {
        case 'sm':
            return 'shadow-sm';
        case 'md':
            return 'shadow-md';
        case 'lg':
            return 'shadow-lg shadow-black/40';
        case 'xl':
            return 'shadow-2xl shadow-black/60';
        case 'glow':
            return 'shadow-[0_0_30px_rgba(99,102,241,0.3)] border-indigo-500/40';
        case 'none':
        default:
            return '';
    }
}

export function getAnimationClasses(animation: EdgeAnimation = 'none'): string {
    switch (animation) {
        case 'fade':
            return 'animate-in fade-in duration-300';
        case 'slide-up':
            return 'animate-in slide-in-from-bottom-3 duration-300 ease-out';
        case 'scale':
            return 'animate-in zoom-in-95 duration-200';
        case 'bounce':
            return 'animate-bounce';
        case 'pulse':
            return 'animate-pulse';
        case 'none':
        default:
            return '';
    }
}
