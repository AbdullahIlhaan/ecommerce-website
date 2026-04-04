<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_accepts_a_valid_payload_and_redirects_to_success(): void
    {
        $category = Category::query()->create([
            'name' => 'Checkout Category',
            'slug' => 'checkout-category',
        ]);

        $brand = Brand::query()->create([
            'name' => 'Checkout Brand',
            'slug' => 'checkout-brand',
        ]);

        $product = Product::query()->create([
            'name' => 'Demo Product',
            'sku' => 'CHK-DEMO-1',
            'description' => 'Checkout flow test product',
            'price' => 499,
            'sale_price' => null,
            'stock' => 20,
            'status' => 'active',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'images' => [],
        ]);

        $response = $this->post('/checkout', [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'phone' => '01700000000',
            'address' => 'House 12, Road 5',
            'city' => 'Dhaka',
            'deliveryZone' => 'inside_dhaka',
            'deliveryLocationLabel' => 'Mirpur DOHS, Dhaka',
            'deliveryLatitude' => 23.8223,
            'deliveryLongitude' => 90.3654,
            'paymentMethod' => 'cod',
            'items' => [
                [
                    'id' => $product->id,
                    'name' => $product->name,
                    'quantity' => 2,
                    'price' => 499,
                ],
            ],
            'subtotal' => 998,
            'deliveryCharge' => 100,
            'total' => 1098,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertNotNull($response->headers->get('Location'));
        $this->assertMatchesRegularExpression(
            '#/checkout/success\?orderId=#',
            $response->headers->get('Location'),
        );

        $order = Order::query()->latest()->first();

        $this->assertNotNull($order);
        $this->assertSame('cod', $order->payment_method);
        $this->assertSame('pending', $order->payment_status);
        $this->assertSame(18, $product->fresh()->stock);
    }

    public function test_checkout_cart_items_endpoint_returns_latest_product_pricing(): void
    {
        $product = $this->createCheckoutProduct(stock: 12, price: 799);

        $product->update([
            'sale_price' => 699,
            'images' => ['/images/demo-product.jpg'],
        ]);

        $response = $this->getJson('/checkout/cart-items?ids[]=' . $product->id);

        $response
            ->assertOk()
            ->assertJsonFragment([
                'id' => $product->id,
                'name' => 'Demo Product',
                'price' => 799.0,
                'salePrice' => 699.0,
                'image' => '/images/demo-product.jpg',
                'stock' => 12,
            ]);
    }

    public function test_checkout_rejects_stale_or_manipulated_totals(): void
    {
        $product = $this->createCheckoutProduct(stock: 20, price: 499);

        $response = $this->from('/checkout')->post('/checkout', [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'phone' => '01700000000',
            'address' => 'House 12, Road 5',
            'city' => 'Dhaka',
            'deliveryZone' => 'inside_dhaka',
            'deliveryLocationLabel' => 'Mirpur DOHS, Dhaka',
            'deliveryLatitude' => 23.8223,
            'deliveryLongitude' => 90.3654,
            'paymentMethod' => 'cod',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 2,
                ],
            ],
            'subtotal' => 2,
            'deliveryCharge' => 100,
            'total' => 102,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors(['items']);
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(20, $product->fresh()->stock);
    }

    public function test_checkout_rejects_when_requested_quantity_exceeds_current_stock(): void
    {
        $product = $this->createCheckoutProduct(stock: 2, price: 499);

        $response = $this->from('/checkout')->post('/checkout', [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'phone' => '01700000000',
            'address' => 'House 12, Road 5',
            'city' => 'Dhaka',
            'deliveryZone' => 'inside_dhaka',
            'deliveryLocationLabel' => 'Mirpur DOHS, Dhaka',
            'deliveryLatitude' => 23.8223,
            'deliveryLongitude' => 90.3654,
            'paymentMethod' => 'cod',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 3,
                ],
            ],
            'subtotal' => 1497,
            'deliveryCharge' => 100,
            'total' => 1597,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors(['items']);
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(2, $product->fresh()->stock);
    }

    public function test_checkout_merges_duplicate_product_rows_before_reserving_stock(): void
    {
        $product = $this->createCheckoutProduct(stock: 20, price: 499);

        $response = $this->post('/checkout', [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'phone' => '01700000000',
            'address' => 'House 12, Road 5',
            'city' => 'Dhaka',
            'deliveryZone' => 'inside_dhaka',
            'deliveryLocationLabel' => 'Mirpur DOHS, Dhaka',
            'deliveryLatitude' => 23.8223,
            'deliveryLongitude' => 90.3654,
            'paymentMethod' => 'online',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 1,
                ],
                [
                    'id' => $product->id,
                    'quantity' => 2,
                ],
            ],
            'subtotal' => 1497,
            'deliveryCharge' => 100,
            'total' => 1597,
        ]);

        $response->assertSessionHasNoErrors();

        $order = Order::query()->latest()->with('items')->first();

        $this->assertNotNull($order);
        $this->assertSame('online', $order->payment_method);
        $this->assertCount(1, $order->items);
        $this->assertSame(3, (int) $order->items->first()->quantity);
        $this->assertSame(17, $product->fresh()->stock);
    }

    public function test_checkout_accepts_manual_delivery_details_without_map_coordinates(): void
    {
        $product = $this->createCheckoutProduct(stock: 20, price: 499);

        $response = $this->post('/checkout', [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'phone' => '01700000000',
            'address' => 'House 12, Road 5',
            'city' => 'Dhaka',
            'deliveryZone' => 'inside_dhaka',
            'deliveryLocationLabel' => null,
            'deliveryLatitude' => null,
            'deliveryLongitude' => null,
            'paymentMethod' => 'cod',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'subtotal' => 499,
            'deliveryCharge' => 100,
            'total' => 599,
        ]);

        $response->assertSessionHasNoErrors();

        $order = Order::query()->latest()->first();

        $this->assertNotNull($order);
        $this->assertNull($order->delivery_location_label);
        $this->assertNull($order->delivery_latitude);
        $this->assertNull($order->delivery_longitude);
        $this->assertSame(19, $product->fresh()->stock);
    }

    public function test_checkout_links_the_customer_to_the_authenticated_user(): void
    {
        $product = $this->createCheckoutProduct(stock: 20, price: 499);
        $user = User::factory()->create([
            'name' => 'Signed In Customer',
            'email' => 'signed-in@example.com',
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/checkout', [
                'name' => 'Signed In Customer',
                'email' => 'signed-in@example.com',
                'phone' => '01700000000',
                'address' => 'House 12, Road 5',
                'city' => 'Dhaka',
                'deliveryZone' => 'inside_dhaka',
                'deliveryLocationLabel' => 'Mirpur DOHS, Dhaka',
                'deliveryLatitude' => 23.8223,
                'deliveryLongitude' => 90.3654,
                'paymentMethod' => 'cod',
                'items' => [
                    [
                        'id' => $product->id,
                        'quantity' => 1,
                    ],
                ],
                'subtotal' => 499,
                'deliveryCharge' => 100,
                'total' => 599,
            ]);

        $response->assertSessionHasNoErrors();

        $order = Order::query()->with('customer')->latest()->first();

        $this->assertNotNull($order);
        $this->assertNotNull($order->customer);
        $this->assertSame($user->id, $order->customer->user_id);
        $this->assertSame(19, $product->fresh()->stock);
    }

    public function test_checkout_rejects_partial_map_location_payloads(): void
    {
        $product = $this->createCheckoutProduct(stock: 20, price: 499);

        $response = $this->from('/checkout')->post('/checkout', [
            'name' => 'Checkout Customer',
            'email' => 'checkout@example.com',
            'phone' => '01700000000',
            'address' => 'House 12, Road 5',
            'city' => 'Dhaka',
            'deliveryZone' => 'inside_dhaka',
            'deliveryLocationLabel' => 'Mirpur DOHS, Dhaka',
            'deliveryLatitude' => 23.8223,
            'deliveryLongitude' => null,
            'paymentMethod' => 'cod',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'subtotal' => 499,
            'deliveryCharge' => 100,
            'total' => 599,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHasErrors(['deliveryLocationLabel']);
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(20, $product->fresh()->stock);
    }

    private function createCheckoutProduct(int $stock, int $price): Product
    {
        $category = Category::query()->create([
            'name' => 'Checkout Category',
            'slug' => 'checkout-category',
        ]);

        $brand = Brand::query()->create([
            'name' => 'Checkout Brand',
            'slug' => 'checkout-brand',
        ]);

        $product = Product::query()->create([
            'name' => 'Demo Product',
            'sku' => 'CHK-DEMO-1',
            'description' => 'Checkout flow test product',
            'price' => $price,
            'sale_price' => null,
            'stock' => $stock,
            'status' => 'active',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'images' => [],
        ]);

        return $product;
    }
}
