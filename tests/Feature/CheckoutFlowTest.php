<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
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
    }
}
