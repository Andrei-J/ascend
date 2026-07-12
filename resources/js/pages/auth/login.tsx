import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-lg px-4 py-3 text-center text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-white/70"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="h-10 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#818cf8]/60 focus-visible:ring-[#818cf8]/20 focus-visible:ring-[3px] transition-all duration-200"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-white/70"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-[#818cf8] no-underline hover:text-[#a5b4fc] decoration-none transition-colors duration-200"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-10 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#818cf8]/60 focus-visible:ring-[#818cf8]/20 focus-visible:ring-[3px] transition-all duration-200"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-white/20 data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-white/50 cursor-pointer select-none"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                id="login-submit"
                                type="submit"
                                className="mt-1 h-10 w-full rounded-lg font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                                style={{
                                    background: processing
                                        ? 'rgba(99,102,241,0.7)'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: processing
                                        ? 'none'
                                        : '0 0 24px rgba(99,102,241,0.35)',
                                    border: 'none',
                                }}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {processing ? 'Signing in…' : 'Log in'}
                            </Button>
                        </div>

                        {/* Register link */}
                        {canRegister && (
                            <div className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="font-medium text-[#818cf8] no-underline hover:text-[#a5b4fc] transition-colors duration-200"
                                >
                                    Sign up free
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Log in to continue your ascent',
};
