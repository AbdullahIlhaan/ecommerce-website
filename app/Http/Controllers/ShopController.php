<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    protected const DELIVERY_CHARGES = [
        'inside_dhaka' => 100,
        'outside_dhaka' => 170,
    ];

    protected const PAYMENT_METHODS = [
        'cod',
        'online',
    ];

    public function index(Request $request): Response
    {
        $query = Product::query()->where('status', 'active')->latest();

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('brand')) {
            $query->where('brand_id', $request->brand);
        }

        if ($request->filled('search')) {
            $this->applyProductSearch($query, (string) $request->search);
        }

        return Inertia::render('Shop/Index', [
            'products' => DashboardData::products($query->get()),
            'categories' => DashboardData::categories(
                Category::query()->orderBy('name')->get()
            ),
            'brands' => DashboardData::brands(
                Brand::query()->orderBy('name')->get()
            ),
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        if (mb_strlen($search) < 1) {
            return response()->json([
                'query' => $search,
                'products' => [],
            ]);
        }

        $products = Product::query()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->where('status', 'active')
            ->where(fn ($query) => $this->applyProductSearch($query, $search))
            ->limit(8)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'salePrice' => $product->sale_price !== null ? (float) $product->sale_price : null,
                'stock' => $product->stock,
                'image' => $product->images[0] ?? '/images/placeholder-product.png',
                'brand' => $product->brand ? [
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug,
                ] : null,
                'category' => $product->category ? [
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
            ])
            ->values();

        return response()->json([
            'query' => $search,
            'products' => $products,
        ]);
    }

    protected function applyProductSearch($query, string $search): void
    {
        $query->where(function ($searchQuery) use ($search): void {
            $searchQuery
                ->where('name', 'like', '%' . $search . '%')
                ->orWhere('sku', 'like', '%' . $search . '%')
                ->orWhere('description', 'like', '%' . $search . '%')
                ->orWhereHas('brand', fn ($brandQuery) => $brandQuery->where('name', 'like', '%' . $search . '%'))
                ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', '%' . $search . '%'));
        });
    }

    public function categories(): Response
    {
        return Inertia::render('Shop/Categories', [
            'categories' => DashboardData::categories(
                Category::query()->orderBy('name')->get()
            ),
        ]);
    }

    public function show(Product $product): Response
    {
        if ($product->status !== 'active' && $product->status !== 'published') {
            abort(404);
        }

        return Inertia::render('Shop/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description ?? '',
                'price' => (float) $product->price,
                'salePrice' => $product->sale_price !== null ? (float) $product->sale_price : null,
                'stock' => $product->stock,
                'status' => $product->status,
                'categoryId' => $product->category_id,
                'brandId' => $product->brand_id,
                'images' => $product->images ?? [],
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug,
                ] : null,
            ],
            'relatedProducts' => DashboardData::products(
                Product::query()
                    ->where('category_id', $product->category_id)
                    ->where('id', '!=', $product->id)
                    ->where('status', 'active')
                    ->limit(4)
                    ->get()
            ),
        ]);
    }

    public function checkout(): Response
    {
        return Inertia::render('Shop/Checkout');
    }

    public function storeOrder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'city' => 'required|string|max:255',
            'deliveryZone' => ['required', Rule::in(array_keys(self::DELIVERY_CHARGES))],
            'deliveryLocationLabel' => 'nullable|string|max:1000',
            'deliveryLatitude' => 'nullable|numeric|between:-90,90',
            'deliveryLongitude' => 'nullable|numeric|between:-180,180',
            'paymentMethod' => ['required', Rule::in(self::PAYMENT_METHODS)],
            'items' => 'required|array|min:1',
            'items.*.id' => ['required', 'string'],
            'items.*.quantity' => 'required|integer|min:1',
            'subtotal' => 'required|numeric',
            'deliveryCharge' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $expectedDeliveryCharge = self::DELIVERY_CHARGES[$data['deliveryZone']];
        $deliveryLocation = $this->normalizeDeliveryLocation($data);

        if (round((float) $data['deliveryCharge'], 2) !== round((float) $expectedDeliveryCharge, 2)) {
            throw ValidationException::withMessages([
                'deliveryZone' => 'The selected delivery location does not match the delivery charge.',
            ]);
        }

        $orderId = DB::transaction(function () use ($data, $expectedDeliveryCharge, $deliveryLocation) {
            $resolvedItems = $this->resolveCheckoutItems($data['items']);
            $expectedSubtotal = collect($resolvedItems)->sum(
                fn (array $item) => (float) $item['price'] * (int) $item['quantity']
            );
            $expectedTotal = $expectedSubtotal + $expectedDeliveryCharge;

            if (round((float) $data['subtotal'], 2) !== round((float) $expectedSubtotal, 2)) {
                throw ValidationException::withMessages([
                    'items' => 'The submitted subtotal does not match the latest product prices.',
                ]);
            }

            if (round((float) $data['total'], 2) !== round((float) $expectedTotal, 2)) {
                throw ValidationException::withMessages([
                    'total' => 'The total amount is invalid. Please refresh your cart totals and try again.',
                ]);
            }

            $customerData = [
                'name' => $data['name'],
                'phone' => $data['phone'],
                'status' => 'active',
            ];

            if ($request->user()) {
                $customerData['user_id'] = $request->user()->id;
            }

            $customer = Customer::query()->updateOrCreate(
                ['email' => $data['email']],
                $customerData
            );

            $order = Order::create([
                'customer_id' => $customer->id,
                'subtotal' => $expectedSubtotal,
                'tax' => 0,
                'total' => $expectedTotal,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $data['paymentMethod'],
                'delivery_zone' => $data['deliveryZone'],
                'delivery_charge' => $expectedDeliveryCharge,
                'delivery_city' => $data['city'],
                'delivery_address' => $data['address'],
                'delivery_location_label' => $deliveryLocation['label'],
                'delivery_latitude' => $deliveryLocation['latitude'],
                'delivery_longitude' => $deliveryLocation['longitude'],
            ]);

            foreach ($resolvedItems as $item) {
                $item['product']->decrement('stock', $item['quantity']);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            $customer->notify(new \App\Notifications\OrderPlaced($order));

            return $order->id;
        });

        return to_route('shop.checkout.success', ['orderId' => $orderId]);
    }

    public function checkoutSuccess(Request $request): Response
    {
        $orderId = $request->query('orderId');
        $order = null;

        if (filled($orderId)) {
            $order = Order::query()
                ->select(['id', 'payment_method', 'payment_status'])
                ->find($orderId);
        }

        return Inertia::render('Shop/CheckoutSuccess', [
            'orderId' => $orderId,
            'order' => $order ? [
                'paymentMethod' => $order->payment_method ?: 'cod',
                'paymentStatus' => $order->payment_status,
            ] : null,
        ]);
    }

    /**
     * @param  array{deliveryLocationLabel?: string|null, deliveryLatitude?: float|int|string|null, deliveryLongitude?: float|int|string|null}  $data
     * @return array{label: string|null, latitude: float|null, longitude: float|null}
     */
    protected function normalizeDeliveryLocation(array $data): array
    {
        $label = isset($data['deliveryLocationLabel']) && is_string($data['deliveryLocationLabel'])
            ? trim($data['deliveryLocationLabel'])
            : null;
        $latitude = $data['deliveryLatitude'] ?? null;
        $longitude = $data['deliveryLongitude'] ?? null;

        $hasAnyLocationField = filled($label) || $latitude !== null || $longitude !== null;

        if (! $hasAnyLocationField) {
            return [
                'label' => null,
                'latitude' => null,
                'longitude' => null,
            ];
        }

        if (! filled($label) || $latitude === null || $longitude === null) {
            throw ValidationException::withMessages([
                'deliveryLocationLabel' => 'Select a map suggestion for a pinned delivery point, or clear the optional map fields and continue with your manual address.',
            ]);
        }

        return [
            'label' => $label,
            'latitude' => (float) $latitude,
            'longitude' => (float) $longitude,
        ];
    }

    /**
     * @param  array<int, array{id: string, quantity: int}>  $items
     * @return array<int, array{product: Product, product_id: string, product_name: string, quantity: int, price: float}>
     */
    protected function resolveCheckoutItems(array $items): array
    {
        $normalizedItems = collect($items)
            ->groupBy('id')
            ->map(fn ($group, string $productId) => [
                'id' => $productId,
                'quantity' => $group->sum(fn (array $item) => (int) $item['quantity']),
            ])
            ->values();

        $productIds = $normalizedItems
            ->pluck('id')
            ->all();

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        return $normalizedItems
            ->map(function (array $item) use ($products): array {
                /** @var Product|null $product */
                $product = $products->get($item['id']);

                if ($product === null || $product->status !== 'active') {
                    throw ValidationException::withMessages([
                        'items' => 'One or more products are no longer available.',
                    ]);
                }

                if ($product->stock < (int) $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => sprintf('%s is no longer available in the requested quantity.', $product->name),
                    ]);
                }

                return [
                    'product' => $product,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => (int) $item['quantity'],
                    'price' => $this->resolveCheckoutPrice($product),
                ];
            })
            ->all();
    }

    protected function resolveCheckoutPrice(Product $product): float
    {
        $salePrice = $product->sale_price !== null ? (float) $product->sale_price : null;
        $basePrice = (float) $product->price;

        if ($salePrice !== null && $salePrice < $basePrice) {
            return $salePrice;
        }

        return $basePrice;
    }
}
