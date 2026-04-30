<?php

namespace App\Http\Controllers;

use App\Models\FlashDeal;
use App\Models\Product;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class FlashDealController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('FlashDeals', $this->sharedProps());
    }

    public function create(): Response
    {
        return Inertia::render('FlashDeals/Form', [
            ...$this->sharedProps(),
            'mode' => 'create',
            'flashDeal' => null,
        ]);
    }

    public function edit(FlashDeal $flashDeal): Response
    {
        return Inertia::render('FlashDeals/Form', [
            ...$this->sharedProps(),
            'mode' => 'edit',
            'flashDeal' => DashboardData::flashDeal($flashDeal->load(['products' => fn ($query) => $query->orderBy('flash_deal_product.sort_order')])),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        [$payload, $productIds] = $this->validated($request);

        DB::transaction(function () use ($payload, $productIds, &$flashDeal): void {
            if ($payload['is_active']) {
                FlashDeal::query()->update(['is_active' => false]);
            }

            $flashDeal = FlashDeal::query()->create($payload);
            $flashDeal->products()->sync($this->syncPayload($productIds));
        });

        return to_route('flash-deals.index')->with('success', 'Flash deal created.');
    }

    public function update(Request $request, FlashDeal $flashDeal): RedirectResponse
    {
        [$payload, $productIds] = $this->validated($request);

        DB::transaction(function () use ($payload, $productIds, $flashDeal): void {
            if ($payload['is_active']) {
                FlashDeal::query()
                    ->whereKeyNot($flashDeal->getKey())
                    ->update(['is_active' => false]);
            }

            $flashDeal->update($payload);
            $flashDeal->products()->sync($this->syncPayload($productIds));
        });

        return to_route('flash-deals.index')->with('success', 'Flash deal updated.');
    }

    public function destroy(FlashDeal $flashDeal): RedirectResponse
    {
        $flashDeal->delete();

        return to_route('flash-deals.index')->with('success', 'Flash deal deleted.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'startsAt' => ['nullable', 'date'],
            'endsAt' => ['nullable', 'date', 'after:startsAt'],
            'isActive' => ['nullable', 'boolean'],
            'productIds' => ['required', 'array', 'min:1'],
            'productIds.*' => ['required', 'string', 'distinct', 'exists:products,id'],
        ]);

        return [[
            'name' => $data['name'],
            'starts_at' => $data['startsAt'] ?? null,
            'ends_at' => $data['endsAt'] ?? null,
            'is_active' => (bool) ($data['isActive'] ?? false),
        ], $data['productIds']];
    }

    /**
     * @param  array<int, string>  $productIds
     * @return array<string, array{sort_order: int}>
     */
    private function syncPayload(array $productIds): array
    {
        $payload = [];

        foreach (array_values($productIds) as $index => $productId) {
            $payload[$productId] = ['sort_order' => $index];
        }

        return $payload;
    }

    private function sharedProps(): array
    {
        $products = DashboardData::products(
            Product::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get()
        );

        if (! Schema::hasTable('flash_deals')) {
            return [
                'flashDeals' => [],
                'products' => $products,
            ];
        }

        return [
            'flashDeals' => DashboardData::flashDeals(
                FlashDeal::query()
                    ->with(['products' => fn ($query) => $query->orderBy('flash_deal_product.sort_order')])
                    ->latest()
                    ->get()
            ),
            'products' => $products,
        ];
    }
}
