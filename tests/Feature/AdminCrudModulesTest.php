<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\FooterSetting;
use App\Models\HeroBanner;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Translation;
use App\Models\User;
use App\Notifications\OrderUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminCrudModulesTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::Admin->value,
        ]);
    }

    public function test_admin_can_perform_category_crud(): void
    {
        $this->actingAs($this->admin)->post('/categories', [
            'name' => 'Kitchen',
            'slug' => 'kitchen',
            'parentId' => null,
        ])->assertRedirect(route('categories.index'));

        $category = Category::query()->where('slug', 'kitchen')->firstOrFail();
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Kitchen']);

        $this->actingAs($this->admin)->put("/categories/{$category->id}", [
            'name' => 'Kitchen Appliances',
            'slug' => 'kitchen-appliances',
            'parentId' => null,
        ])->assertRedirect(route('categories.index'));

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'slug' => 'kitchen-appliances']);

        $this->actingAs($this->admin)->delete("/categories/{$category->id}")
            ->assertRedirect(route('categories.index'));

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_admin_can_perform_brand_crud(): void
    {
        $this->actingAs($this->admin)->post('/brands', [
            'name' => 'Acme',
            'slug' => 'acme',
        ])->assertRedirect(route('brands.index'));

        $brand = Brand::query()->where('slug', 'acme')->firstOrFail();
        $this->assertDatabaseHas('brands', ['id' => $brand->id, 'name' => 'Acme']);

        $this->actingAs($this->admin)->put("/brands/{$brand->id}", [
            'name' => 'Acme Labs',
            'slug' => 'acme-labs',
        ])->assertRedirect(route('brands.index'));

        $this->assertDatabaseHas('brands', ['id' => $brand->id, 'slug' => 'acme-labs']);

        $this->actingAs($this->admin)->delete("/brands/{$brand->id}")
            ->assertRedirect(route('brands.index'));

        $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
    }

    public function test_admin_can_perform_product_crud(): void
    {
        $category = Category::query()->create([
            'name' => 'Phones',
            'slug' => 'phones',
        ]);

        $brand = Brand::query()->create([
            'name' => 'Zen',
            'slug' => 'zen',
        ]);

        $this->actingAs($this->admin)->post('/products', [
            'name' => 'Zen Phone X',
            'sku' => 'ZEN-PHX',
            'description' => 'Initial product description.',
            'price' => 900,
            'salePrice' => 850,
            'stock' => 30,
            'status' => 'active',
            'categoryId' => $category->id,
            'brandId' => $brand->id,
        ])->assertRedirect(route('products.index'));

        $product = Product::query()->where('sku', 'ZEN-PHX')->firstOrFail();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Zen Phone X']);

        $this->actingAs($this->admin)->put("/products/{$product->id}", [
            'name' => 'Zen Phone X Plus',
            'sku' => 'ZEN-PHX',
            'description' => 'Updated description.',
            'price' => 950,
            'salePrice' => 899,
            'stock' => 26,
            'status' => 'active',
            'categoryId' => $category->id,
            'brandId' => $brand->id,
        ])->assertRedirect(route('products.index'));

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 26]);

        $this->actingAs($this->admin)->delete("/products/{$product->id}")
            ->assertRedirect(route('products.index'));

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_admin_can_perform_coupon_crud(): void
    {
        $this->actingAs($this->admin)->post('/coupons', [
            'code' => 'save15',
            'type' => 'percentage',
            'value' => 15,
            'startDate' => '2026-04-01',
            'endDate' => '2026-04-30',
            'usageLimit' => 200,
            'status' => 'active',
        ])->assertRedirect(route('coupons.index'));

        $coupon = Coupon::query()->where('code', 'SAVE15')->firstOrFail();
        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'code' => 'SAVE15']);

        $this->actingAs($this->admin)->put("/coupons/{$coupon->id}", [
            'code' => 'save15',
            'type' => 'fixed',
            'value' => 100,
            'startDate' => '2026-04-01',
            'endDate' => '2026-05-01',
            'usageLimit' => 150,
            'status' => 'disabled',
        ])->assertRedirect(route('coupons.index'));

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'type' => 'fixed', 'status' => 'disabled']);

        $this->actingAs($this->admin)->delete("/coupons/{$coupon->id}")
            ->assertRedirect(route('coupons.index'));

        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
    }

    public function test_admin_can_perform_customer_crud(): void
    {
        $this->actingAs($this->admin)->post('/customers', [
            'name' => 'Customer One',
            'email' => 'customer-one@example.com',
            'phone' => '01711000000',
            'status' => 'active',
        ])->assertRedirect(route('customers.index'));

        $customer = Customer::query()->where('email', 'customer-one@example.com')->firstOrFail();
        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'name' => 'Customer One']);

        $this->actingAs($this->admin)->put("/customers/{$customer->id}", [
            'name' => 'Customer One Updated',
            'email' => 'customer-one@example.com',
            'phone' => '01711999999',
            'status' => 'blocked',
        ])->assertRedirect(route('customers.index'));

        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'status' => 'blocked']);

        $this->actingAs($this->admin)->delete("/customers/{$customer->id}")
            ->assertRedirect(route('customers.index'));

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_admin_can_perform_hero_banner_crud(): void
    {
        $image = UploadedFile::fake()->image('banner.jpg', 1280, 720);

        $this->actingAs($this->admin)->post('/hero-banners', [
            'title' => 'Summer Sale',
            'subtitle' => 'Up to 40% off',
            'buttonLabel' => 'Shop Deals',
            'buttonUrl' => '/shop',
            'sortOrder' => 1,
            'isActive' => true,
            'images' => [$image],
        ])->assertRedirect(route('hero-banners.index'));

        $banner = HeroBanner::query()->where('title', 'Summer Sale')->firstOrFail();
        $this->assertNotNull($banner->image_path);
        $this->assertDatabaseHas('hero_banners', ['id' => $banner->id, 'is_active' => 1]);

        $this->actingAs($this->admin)->put("/hero-banners/{$banner->id}", [
            'title' => 'Summer Sale Extended',
            'subtitle' => 'Up to 45% off',
            'buttonLabel' => 'Explore',
            'buttonUrl' => '/shop',
            'sortOrder' => 2,
            'isActive' => false,
        ])->assertRedirect(route('hero-banners.index'));

        $this->assertDatabaseHas('hero_banners', ['id' => $banner->id, 'title' => 'Summer Sale Extended', 'is_active' => 0]);

        $this->actingAs($this->admin)->delete("/hero-banners/{$banner->id}")
            ->assertRedirect(route('hero-banners.index'));

        $this->assertDatabaseMissing('hero_banners', ['id' => $banner->id]);
    }

    public function test_admin_can_perform_translation_crud(): void
    {
        $this->actingAs($this->admin)->post('/translations', [
            'key' => 'home.hero_title',
            'group' => 'home',
            'englishText' => 'Welcome to FutureBD',
            'banglaText' => 'FutureBD e shagotom',
            'notes' => 'Homepage heading',
            'isActive' => true,
        ])->assertRedirect(route('translations.index'));

        $translation = Translation::query()->where('translation_key', 'home.hero_title')->firstOrFail();
        $this->assertDatabaseHas('translations', ['id' => $translation->id, 'group_name' => 'home']);

        $this->actingAs($this->admin)->put("/translations/{$translation->id}", [
            'key' => 'home.hero_title',
            'group' => 'home',
            'englishText' => 'Welcome Back',
            'banglaText' => 'Abaro shagotom',
            'notes' => 'Updated heading',
            'isActive' => false,
        ])->assertRedirect(route('translations.index'));

        $this->assertDatabaseHas('translations', ['id' => $translation->id, 'english_text' => 'Welcome Back', 'is_active' => 0]);

        $this->actingAs($this->admin)->delete("/translations/{$translation->id}")
            ->assertRedirect(route('translations.index'));

        $this->assertDatabaseMissing('translations', ['id' => $translation->id]);
    }

    public function test_admin_can_update_footer_settings(): void
    {
        $this->actingAs($this->admin)->post('/footer-settings', [
            'logo_text' => 'FutureBD',
            'description' => 'Fast ecommerce delivery',
            'address' => 'Dhaka, Bangladesh',
            'phone' => '+8801700000000',
            'email' => 'support@futurebd.test',
            'facebook_url' => 'https://facebook.com/futurebd',
            'youtube_url' => 'https://youtube.com/@futurebd',
            'facebook_pixel_id' => '123456789012345',
            'copyright' => '(c) 2026 FutureBD',
            'payment_methods' => [
                ['name' => 'bKash', 'image_path' => '/uploads/payments/bkash.png'],
            ],
            'social_links' => [
                ['platform' => 'Facebook', 'url' => 'https://facebook.com/futurebd'],
                ['platform' => 'YouTube', 'url' => 'https://youtube.com/@futurebd'],
            ],
        ])->assertRedirect();

        $footerSetting = FooterSetting::query()->firstOrFail();

        $this->assertSame('FutureBD', $footerSetting->logo_text);
        $this->assertSame('https://facebook.com/futurebd', $footerSetting->facebook_url);
        $this->assertSame('https://youtube.com/@futurebd', $footerSetting->youtube_url);
        $this->assertSame('123456789012345', $footerSetting->facebook_pixel_id);
        $this->assertIsArray($footerSetting->payment_methods);
        $this->assertIsArray($footerSetting->social_links);
    }

    public function test_admin_can_update_order_status_and_payment_status(): void
    {
        Notification::fake();

        $customer = Customer::query()->create([
            'name' => 'Order Customer',
            'email' => 'order-customer@example.com',
            'phone' => '01710000000',
            'status' => 'active',
        ]);

        $order = Order::query()->create([
            'customer_id' => $customer->id,
            'subtotal' => 1000,
            'tax' => 0,
            'total' => 1000,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cod',
        ]);

        $this->actingAs($this->admin)->put("/orders/{$order->id}", [
            'status' => 'shipped',
            'paymentStatus' => 'paid',
        ])->assertRedirect(route('orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'shipped',
            'payment_status' => 'paid',
        ]);

        Notification::assertSentTo($customer, OrderUpdated::class);
    }

    public function test_admin_can_moderate_and_delete_reviews(): void
    {
        $review = Review::query()->create([
            'product_id' => null,
            'product_name' => 'Demo Product',
            'customer_name' => 'Reviewer',
            'rating' => 4,
            'comment' => 'Looks good',
            'status' => 'pending',
        ]);

        $this->actingAs($this->admin)->put("/reviews/{$review->id}/approve")
            ->assertRedirect(route('reviews.index'));
        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'status' => 'approved']);

        $this->actingAs($this->admin)->put("/reviews/{$review->id}/reject")
            ->assertRedirect(route('reviews.index'));
        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'status' => 'rejected']);

        $this->actingAs($this->admin)->delete("/reviews/{$review->id}")
            ->assertRedirect(route('reviews.index'));
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }
}
