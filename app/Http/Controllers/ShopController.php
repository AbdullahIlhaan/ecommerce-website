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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->where('status', 'active')->latest();

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('brand')) {
            $query->where('brand_id', $request->brand);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
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
            'paymentMethod' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|string',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'subtotal' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

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
                'tax' => $data['total'] - $data['subtotal'],
                'total' => $data['total'],
                'status' => 'pending',
                'payment_status' => 'pending',
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
