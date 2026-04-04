<?php

namespace App\Http\Controllers;

use App\Models\FooterSetting;
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
            'copyright' => '© 2018-2026 FutureBD. All rights reserved.',
            'payment_methods' => [],
            'social_links' => [],
        ]);

        return Inertia::render('FooterSettings', [
            'footerSetting' => $footerSetting,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $footerSetting = FooterSetting::first() ?: new FooterSetting();

        $data = $request->validate([
            'logo_text' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
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

        $paymentMethods = $request->input('payment_methods', []);
        
        // Handle payment method images
        if ($request->hasFile('payment_methods')) {
            foreach ($request->file('payment_methods') as $index => $fileData) {
                if (isset($fileData['image'])) {
                     // Delete old image if it exists in the original data
                     $oldPath = $paymentMethods[$index]['image_path'] ?? null;
                     if ($oldPath) {
                         $this->deleteFile($oldPath);
                     }
                     $paymentMethods[$index]['image_path'] = $this->storeFile($fileData['image'], 'payments');
                }
            }
        }

        $footerSetting->fill([
            'logo_text' => $data['logo_text'],
            'description' => $data['description'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'copyright' => $data['copyright'],
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
}
