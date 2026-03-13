<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Categories', [
            'categories' => DashboardData::categories(Category::query()->orderBy('name')->get()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Category::query()->create($this->validated($request));

        return to_route('categories.index')->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $category->update($this->validated($request, $category->id));

        return to_route('categories.index')->with('success', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        Category::query()->where('parent_id', $category->id)->update(['parent_id' => null]);
        Product::query()->where('category_id', $category->id)->update(['category_id' => null]);
        $category->delete();

        return to_route('categories.index')->with('success', 'Category deleted.');
    }

    private function validated(Request $request, ?string $categoryId = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($categoryId)],
            'parentId' => ['nullable', 'string', Rule::exists('categories', 'id')],
        ]);

        return [
            'name' => $data['name'],
            'slug' => $data['slug'],
            'parent_id' => $data['parentId'] ?? null,
        ];
    }
}
