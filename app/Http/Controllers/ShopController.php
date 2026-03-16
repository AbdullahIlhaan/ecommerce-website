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
        $query
            ->where('name', 'like', '%' . $search . '%')
            ->orWhere('sku', 'like', '%' . $search . '%')
            ->orWhere('description', 'like', '%' . $search . '%')
            ->orWhereHas('brand', fn ($brandQuery) => $brandQuery->where('name', 'like', '%' . $search . '%'))
            ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', '%' . $search . '%'));
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
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'deliveryZone' => ['required', Rule::in(array_keys(self::DELIVERY_CHARGES))],
            'deliveryLocationLabel' => 'required|string|max:1000',
            'deliveryLatitude' => 'required|numeric|between:-90,90',
            'deliveryLongitude' => 'required|numeric|between:-180,180',
            'paymentMethod' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|string',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'deliveryCharge' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $expectedDeliveryCharge = self::DELIVERY_CHARGES[$data['deliveryZone']];
        $expectedSubtotal = collect($data['items'])->sum(
            fn (array $item) => (float) $item['price'] * (int) $item['quantity']
        );
        $expectedTotal = $expectedSubtotal + $expectedDeliveryCharge;

        if (round((float) $data['deliveryCharge'], 2) !== round((float) $expectedDeliveryCharge, 2)) {
            throw ValidationException::withMessages([
                'deliveryZone' => 'The selected delivery location does not match the delivery charge.',
            ]);
        }

        if (round((float) $data['subtotal'], 2) !== round((float) $expectedSubtotal, 2)) {
            throw ValidationException::withMessages([
                'items' => 'The submitted subtotal does not match the cart items.',
            ]);
        }

        if (round((float) $data['total'], 2) !== round((float) $expectedTotal, 2)) {
            throw ValidationException::withMessages([
                'total' => 'The total amount is invalid. Please confirm your delivery location.',
            ]);
        }

        $orderId = \Illuminate\Support\Facades\DB::transaction(function() use ($data) {
            $customer = Customer::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'status' => 'active'
                ]
            );

            $order = Order::create([
                'customer_id' => $customer->id,
                'subtotal' => $data['subtotal'],
                'tax' => 0,
                'total' => $data['total'],
                'status' => 'pending',
                'payment_status' => 'pending',
                'delivery_zone' => $data['deliveryZone'],
                'delivery_charge' => $data['deliveryCharge'],
                'delivery_city' => $data['city'],
                'delivery_address' => $data['address'],
                'delivery_location_label' => $data['deliveryLocationLabel'],
                'delivery_latitude' => $data['deliveryLatitude'],
                'delivery_longitude' => $data['deliveryLongitude'],
            ]);

            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'product_name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            return $order->id;
        });

        return to_route('shop.checkout.success', ['orderId' => $orderId]);
    }

    public function checkoutSuccess(Request $request): Response
    {
        return Inertia::render('Shop/CheckoutSuccess', [
            'orderId' => $request->query('orderId'),
        ]);
    }
}
