<?php

namespace App\Http\Controllers;

use App\Models\FooterSetting;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class FooterSettingController extends Controller
{
    public function index(): Response
    {
        $footerSetting = FooterSetting::first() ?: new FooterSetting([
            'logo_text' => 'FutureBD',
            'description' => 'The platform to get products from global marketplaces to Bangladesh.',
            'facebook_url' => null,
            'youtube_url' => null,
            'facebook_pixel_id' => null,
            'copyright' => '© 2018-2026 FutureBD. All rights reserved.',
            'payment_methods' => [],
            'social_links' => [],
        ]);

        return Inertia::render('FooterSettings', [
            'footerSetting' => DashboardData::footerSetting($footerSetting),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $footerSetting = FooterSetting::first() ?: new FooterSetting();
        $socialLinks = $this->filterSocialLinks($request->input('social_links', []));
        $paymentMethods = $this->filterPaymentMethods($request->input('payment_methods', []));

        $request->merge([
            'social_links' => $socialLinks,
            'payment_methods' => $paymentMethods,
        ]);

        $data = $request->validate([
            'logo_text' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
            'facebook_pixel_id' => ['nullable', 'string', 'max:64'],
            'copyright' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'payment_methods' => ['nullable', 'array'],
            'payment_methods.*.name' => ['required', 'string'],
            'payment_methods.*.image' => ['nullable', 'image', 'max:1024'],
            'payment_methods.*.image_path' => ['nullable', 'string'],
            'social_links' => ['nullable', 'array'],
            'social_links.*.platform' => ['required', 'string'],
            'social_links.*.url' => ['required', 'url'],
        ]);

        if ($request->hasFile('logo')) {
            if ($footerSetting->logo_path) {
                $this->deleteFile($footerSetting->logo_path);
            }
            $footerSetting->logo_path = $this->storeFile($request->file('logo'), 'footer');
        }

        // Handle payment method images
        if ($request->hasFile('payment_methods')) {
            foreach ($request->file('payment_methods') as $index => $fileData) {
                if (isset($fileData['image']) && isset($paymentMethods[$index])) {
                    $oldPath = $paymentMethods[$index]['image_path'] ?? null;
                    if ($oldPath) {
                        $this->deleteFile($oldPath);
                    }
                    $paymentMethods[$index]['image_path'] = $this->storeFile($fileData['image'], 'payments');
                }
            }
        }

        $footerSetting->fill([
            'logo_text' => $data['logo_text'] ?? null,
            'description' => $data['description'] ?? null,
            'address' => $data['address'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'facebook_url' => $data['facebook_url'] ?? null,
            'youtube_url' => $data['youtube_url'] ?? null,
            'facebook_pixel_id' => $data['facebook_pixel_id'] ?? null,
            'copyright' => $data['copyright'] ?? null,
            'payment_methods' => $paymentMethods,
            'social_links' => $data['social_links'] ?? [],
        ]);

        $footerSetting->save();

        return back()->with('success', 'Footer settings updated.');
    }

    private function storeFile($file, $subdir): string
    {
        $directory = public_path("uploads/$subdir");
        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }
        $filename = uniqid("$subdir-", true).'.'.$file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return "/uploads/$subdir/$filename";
    }

    private function deleteFile($path): void
    {
        if (! $path || ! str_contains($path, '/uploads/')) {
            return;
        }
        $absolutePath = public_path(ltrim($path, '/'));
        if (File::exists($absolutePath)) {
            File::delete($absolutePath);
        }
    }

    private function filterSocialLinks(array $links): array
    {
        return array_values(array_filter(array_map(function ($link) {
            if (! is_array($link)) {
                return null;
            }

            $platform = trim((string) ($link['platform'] ?? ''));
            $url = trim((string) ($link['url'] ?? ''));

            if ($platform === '' && $url === '') {
                return null;
            }

            return [
                'platform' => $platform,
                'url' => $url,
            ];
        }, $links)));
    }

    private function filterPaymentMethods(array $methods): array
    {
        return array_values(array_filter(array_map(function ($method) {
            if (! is_array($method)) {
                return null;
            }

            $name = trim((string) ($method['name'] ?? ''));
            $imagePath = $method['image_path'] ?? null;

            if ($name === '' && blank($imagePath)) {
                return null;
            }

            return [
                'name' => $name,
                'image_path' => $imagePath,
            ];
        }, $methods)));
    }
}
