<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $appVersion = config('nativephp.version', env('NATIVEPHP_APP_VERSION', '1.0.1'));
        $versionCode = config('nativephp.version_code', env('NATIVEPHP_APP_VERSION_CODE', 12));

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appVersion' => [
                'version' => (string) $appVersion,
                'version_code' => (int) $versionCode,
                'build_id' => file_exists(base_path('.version')) ? trim(file_get_contents(base_path('.version'))) : "{$appVersion}b{$versionCode}",
            ],
        ];
    }
}
