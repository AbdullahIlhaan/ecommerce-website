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
    private const BANNER_WIDTH = 2000;
    private const BANNER_HEIGHT = 720;

    public function index(): Response
    {
        return Inertia::render('HeroBanners', $this->sharedProps());
    }

    public function create(): Response
    {
        return Inertia::render('HeroBanners/Form', [
            ...$this->sharedProps(),
            'mode' => 'create',
            'heroBanner' => null,
        ]);
    }

    public function edit(HeroBanner $heroBanner): Response
    {
        return Inertia::render('HeroBanners/Form', [
            ...$this->sharedProps(),
            'mode' => 'edit',
            'heroBanner' => DashboardData::heroBanner($heroBanner),
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
        $this->deleteImages($heroBanner->image_paths ?: array_filter([$heroBanner->image_path]));
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
            'images' => [$heroBanner ? 'nullable' : 'required', 'array', 'min:1'],
            'images.*' => [
                'required',
                'file',
                'mimes:webp',
                'max:8192',
                'dimensions:width='.self::BANNER_WIDTH.',height='.self::BANNER_HEIGHT,
            ],
        ]);

        $imagePaths = $heroBanner?->image_paths ?: array_filter([$heroBanner?->image_path]);

        if ($request->hasFile('images')) {
            $this->deleteImages($imagePaths);
            $imagePaths = $this->storeImages($request);
        }

        return [
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? '',
            'button_label' => $data['buttonLabel'] ?? '',
            'button_url' => $data['buttonUrl'] ?? '',
            'image_path' => $imagePaths[0] ?? $heroBanner?->image_path,
            'image_paths' => $imagePaths,
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_active' => (bool) ($data['isActive'] ?? false),
        ];
    }

    private function storeImages(Request $request): array
    {
        $directory = public_path('uploads/hero-banners');

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        return collect($request->file('images', []))
            ->map(function ($file) use ($directory) {
                $filename = uniqid('hero-banner-', true).'.'.$file->getClientOriginalExtension();
                $file->move($directory, $filename);

                return '/uploads/hero-banners/'.$filename;
            })
            ->all();
    }

    private function deleteImages(array $imagePaths): void
    {
        foreach ($imagePaths as $imagePath) {
            if (! $imagePath || ! str_starts_with($imagePath, '/uploads/hero-banners/')) {
                continue;
            }

            $absolutePath = public_path(ltrim($imagePath, '/'));

            if (File::exists($absolutePath)) {
                File::delete($absolutePath);
            }
        }
    }

    private function sharedProps(): array
    {
        return [
            'heroBanners' => DashboardData::heroBanners(HeroBanner::query()->orderBy('sort_order')->latest()->get()),
        ];
    }
}
