<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Products', [
            'products' => DashboardData::products(Product::query()->latest()->get()),
            'categories' => DashboardData::categories(Category::query()->orderBy('name')->get()),
            'brands' => DashboardData::brands(Brand::query()->orderBy('name')->get()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Product::query()->create($this->validated($request));

        return to_route('products.index')->with('success', 'Product created.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validated($request, $product->id));

        return to_route('products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return to_route('products.index')->with('success', 'Product deleted.');
    }

    private function validated(Request $request, ?string $productId = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($productId)],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'salePrice' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'draft', 'archived'])],
            'categoryId' => ['nullable', 'string', Rule::exists('categories', 'id')],
            'brandId' => ['nullable', 'string', Rule::exists('brands', 'id')],
            'images' => ['nullable', 'array'],
        ]);

        return [
            'name' => $data['name'],
            'sku' => $data['sku'],
            'description' => $data['description'] ?? '',
            'price' => $data['price'],
            'sale_price' => $data['salePrice'] ?? null,
            'stock' => $data['stock'] ?? 0,
            'status' => $data['status'],
            'category_id' => $data['categoryId'] ?? null,
            'brand_id' => $data['brandId'] ?? null,
            'images' => $data['images'] ?? [],
        ];
    }
}
