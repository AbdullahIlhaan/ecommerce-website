<?php

namespace App\Http\Controllers;

use App\Models\HeroBanner;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class HeroBannerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('HeroBanners', [
            'heroBanners' => DashboardData::heroBanners(HeroBanner::query()->orderBy('sort_order')->latest()->get()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        HeroBanner::query()->create($this->validated($request));

        return to_route('hero-banners.index')->with('success', 'Hero banner created.');
    }

    public function update(Request $request, HeroBanner $heroBanner): RedirectResponse
    {
        $heroBanner->update($this->validated($request, $heroBanner));

        return to_route('hero-banners.index')->with('success', 'Hero banner updated.');
    }

    public function destroy(HeroBanner $heroBanner): RedirectResponse
    {
        $this->deleteImage($heroBanner->image_path);
        $heroBanner->delete();

        return to_route('hero-banners.index')->with('success', 'Hero banner deleted.');
    }

    private function validated(Request $request, ?HeroBanner $heroBanner = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:1000'],
            'buttonLabel' => ['nullable', 'string', 'max:255'],
            'buttonUrl' => ['nullable', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
            'isActive' => ['nullable', 'boolean'],
            'image' => [$heroBanner ? 'nullable' : 'required', 'image', 'max:4096'],
        ]);

        $imagePath = $heroBanner?->image_path;

        if ($request->hasFile('image')) {
            $this->deleteImage($imagePath);
            $imagePath = $this->storeImage($request);
        }

        return [
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? '',
            'button_label' => $data['buttonLabel'] ?? '',
            'button_url' => $data['buttonUrl'] ?? '',
            'image_path' => $imagePath,
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_active' => (bool) ($data['isActive'] ?? false),
        ];
    }

    private function storeImage(Request $request): string
    {
        $file = $request->file('image');
        $directory = public_path('uploads/hero-banners');

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $filename = uniqid('hero-banner-', true).'.'.$file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return '/uploads/hero-banners/'.$filename;
    }

    private function deleteImage(?string $imagePath): void
    {
        if (! $imagePath || ! str_starts_with($imagePath, '/uploads/hero-banners/')) {
            return;
        }

        $absolutePath = public_path(ltrim($imagePath, '/'));

        if (File::exists($absolutePath)) {
            File::delete($absolutePath);
        }
    }
}
