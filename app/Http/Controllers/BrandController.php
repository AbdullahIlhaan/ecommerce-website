<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Product;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Brands', $this->sharedProps());
    }

    public function create(): Response
    {
        return Inertia::render('Brands/Form', [
            ...$this->sharedProps(),
            'mode' => 'create',
            'brand' => null,
        ]);
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('Brands/Form', [
            ...$this->sharedProps(),
            'mode' => 'edit',
            'brand' => DashboardData::brands(collect([$brand]))[0],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Brand::query()->create($this->validated($request));

        return to_route('brands.index')->with('success', 'Brand created.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $brand->update($this->validated($request, $brand->id));

        return to_route('brands.index')->with('success', 'Brand updated.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        Product::query()->where('brand_id', $brand->id)->update(['brand_id' => null]);
        $brand->delete();

        return to_route('brands.index')->with('success', 'Brand deleted.');
    }

    private function validated(Request $request, ?string $brandId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brandId)],
        ]);
    }

    private function sharedProps(): array
    {
        return [
            'brands' => DashboardData::brands(Brand::query()->orderBy('name')->get()),
        ];
    }
}
