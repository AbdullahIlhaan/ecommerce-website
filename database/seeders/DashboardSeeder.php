<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\FlashDeal;
use App\Models\HeroBanner;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Seeder;

class DashboardSeeder extends Seeder
{
    public function run(): void
    {
        Category::query()->insert([
            ['id' => 'cat1', 'name' => 'Electronics', 'slug' => 'electronics', 'parent_id' => null, 'created_at' => '2024-01-15 00:00:00', 'updated_at' => '2024-01-15 00:00:00'],
            ['id' => 'cat2', 'name' => 'Clothing', 'slug' => 'clothing', 'parent_id' => null, 'created_at' => '2024-01-15 00:00:00', 'updated_at' => '2024-01-15 00:00:00'],
            ['id' => 'cat3', 'name' => 'Smartphones', 'slug' => 'smartphones', 'parent_id' => 'cat1', 'created_at' => '2024-01-16 00:00:00', 'updated_at' => '2024-01-16 00:00:00'],
            ['id' => 'cat4', 'name' => 'Laptops', 'slug' => 'laptops', 'parent_id' => 'cat1', 'created_at' => '2024-01-16 00:00:00', 'updated_at' => '2024-01-16 00:00:00'],
            ['id' => 'cat5', 'name' => 'Men\'s Wear', 'slug' => 'mens-wear', 'parent_id' => 'cat2', 'created_at' => '2024-01-17 00:00:00', 'updated_at' => '2024-01-17 00:00:00'],
            ['id' => 'cat6', 'name' => 'Smart Home', 'slug' => 'smart-home', 'parent_id' => 'cat1', 'created_at' => '2024-01-18 00:00:00', 'updated_at' => '2024-01-18 00:00:00'],
        ]);

        Brand::query()->insert([
            ['id' => 'br1', 'name' => 'Apple', 'slug' => 'apple', 'created_at' => '2024-01-10 00:00:00', 'updated_at' => '2024-01-10 00:00:00'],
            ['id' => 'br2', 'name' => 'Samsung', 'slug' => 'samsung', 'created_at' => '2024-01-10 00:00:00', 'updated_at' => '2024-01-10 00:00:00'],
            ['id' => 'br3', 'name' => 'Nike', 'slug' => 'nike', 'created_at' => '2024-01-10 00:00:00', 'updated_at' => '2024-01-10 00:00:00'],
            ['id' => 'br4', 'name' => 'Sony', 'slug' => 'sony', 'created_at' => '2024-01-11 00:00:00', 'updated_at' => '2024-01-11 00:00:00'],
            ['id' => 'br5', 'name' => 'Xiaomi', 'slug' => 'xiaomi', 'created_at' => '2024-01-12 00:00:00', 'updated_at' => '2024-01-12 00:00:00'],
        ]);

        Product::query()->insert([
            ['id' => 'p1', 'name' => 'iPhone 15 Pro', 'sku' => 'APL-IP15P', 'description' => 'Latest iPhone with titanium design', 'price' => 999, 'sale_price' => 949, 'stock' => 45, 'status' => 'active', 'category_id' => 'cat3', 'brand_id' => 'br1', 'images' => json_encode([]), 'created_at' => '2024-02-01 00:00:00', 'updated_at' => '2024-02-01 00:00:00'],
            ['id' => 'p2', 'name' => 'Galaxy S24 Ultra', 'sku' => 'SAM-S24U', 'description' => 'Premium Samsung flagship', 'price' => 1199, 'sale_price' => null, 'stock' => 32, 'status' => 'active', 'category_id' => 'cat3', 'brand_id' => 'br2', 'images' => json_encode([]), 'created_at' => '2024-02-05 00:00:00', 'updated_at' => '2024-02-05 00:00:00'],
            ['id' => 'p3', 'name' => 'MacBook Pro 16"', 'sku' => 'APL-MBP16', 'description' => 'M3 Pro chip laptop', 'price' => 2499, 'sale_price' => 2399, 'stock' => 18, 'status' => 'active', 'category_id' => 'cat4', 'brand_id' => 'br1', 'images' => json_encode([]), 'created_at' => '2024-02-10 00:00:00', 'updated_at' => '2024-02-10 00:00:00'],
            ['id' => 'p4', 'name' => 'Air Jordan 1', 'sku' => 'NK-AJ1', 'description' => 'Classic basketball shoe', 'price' => 180, 'sale_price' => null, 'stock' => 120, 'status' => 'active', 'category_id' => 'cat5', 'brand_id' => 'br3', 'images' => json_encode([]), 'created_at' => '2024-02-15 00:00:00', 'updated_at' => '2024-02-15 00:00:00'],
            ['id' => 'p5', 'name' => 'Sony WH-1000XM5', 'sku' => 'SNY-WH5', 'description' => 'Noise cancelling headphones', 'price' => 349, 'sale_price' => 299, 'stock' => 67, 'status' => 'active', 'category_id' => 'cat1', 'brand_id' => 'br4', 'images' => json_encode([]), 'created_at' => '2024-02-20 00:00:00', 'updated_at' => '2024-02-20 00:00:00'],
            ['id' => 'p6', 'name' => 'iPad Air M2', 'sku' => 'APL-IPAM2', 'description' => 'Versatile tablet', 'price' => 599, 'sale_price' => null, 'stock' => 0, 'status' => 'draft', 'category_id' => 'cat1', 'brand_id' => 'br1', 'images' => json_encode([]), 'created_at' => '2024-03-01 00:00:00', 'updated_at' => '2024-03-01 00:00:00'],
            ['id' => 'p7', 'name' => 'Xiaomi Smart Air Purifier 4', 'sku' => 'XMI-AP4', 'description' => 'HEPA air purifier with app control for smart homes.', 'price' => 299, 'sale_price' => 269, 'stock' => 54, 'status' => 'active', 'category_id' => 'cat6', 'brand_id' => 'br5', 'images' => json_encode([]), 'created_at' => '2024-03-03 00:00:00', 'updated_at' => '2024-03-03 00:00:00'],
        ]);

        Customer::query()->insert([
            ['id' => 'c1', 'name' => 'John Doe', 'email' => 'john@example.com', 'phone' => '+1 555-0101', 'status' => 'active', 'created_at' => '2024-01-20 00:00:00', 'updated_at' => '2024-01-20 00:00:00'],
            ['id' => 'c2', 'name' => 'Jane Smith', 'email' => 'jane@example.com', 'phone' => '+1 555-0102', 'status' => 'active', 'created_at' => '2024-01-22 00:00:00', 'updated_at' => '2024-01-22 00:00:00'],
            ['id' => 'c3', 'name' => 'Bob Wilson', 'email' => 'bob@example.com', 'phone' => '+1 555-0103', 'status' => 'inactive', 'created_at' => '2024-02-01 00:00:00', 'updated_at' => '2024-02-01 00:00:00'],
            ['id' => 'c4', 'name' => 'Alice Brown', 'email' => 'alice@example.com', 'phone' => '+1 555-0104', 'status' => 'active', 'created_at' => '2024-02-15 00:00:00', 'updated_at' => '2024-02-15 00:00:00'],
        ]);

        Order::query()->insert([
            ['id' => 'o1', 'customer_id' => 'c1', 'subtotal' => 949, 'tax' => 85.41, 'total' => 1034.41, 'status' => 'delivered', 'payment_status' => 'paid', 'created_at' => '2024-03-01 00:00:00', 'updated_at' => '2024-03-01 00:00:00'],
            ['id' => 'o2', 'customer_id' => 'c2', 'subtotal' => 2698, 'tax' => 242.82, 'total' => 2940.82, 'status' => 'shipped', 'payment_status' => 'paid', 'created_at' => '2024-03-05 00:00:00', 'updated_at' => '2024-03-05 00:00:00'],
            ['id' => 'o3', 'customer_id' => 'c4', 'subtotal' => 360, 'tax' => 32.4, 'total' => 392.4, 'status' => 'processing', 'payment_status' => 'paid', 'created_at' => '2024-03-10 00:00:00', 'updated_at' => '2024-03-10 00:00:00'],
            ['id' => 'o4', 'customer_id' => 'c3', 'subtotal' => 1199, 'tax' => 107.91, 'total' => 1306.91, 'status' => 'pending', 'payment_status' => 'pending', 'created_at' => '2024-03-12 00:00:00', 'updated_at' => '2024-03-12 00:00:00'],
        ]);

        OrderItem::query()->insert([
            ['id' => 'oi1', 'order_id' => 'o1', 'product_id' => 'p1', 'product_name' => 'iPhone 15 Pro', 'quantity' => 1, 'price' => 949, 'created_at' => '2024-03-01 00:00:00', 'updated_at' => '2024-03-01 00:00:00'],
            ['id' => 'oi2', 'order_id' => 'o2', 'product_id' => 'p3', 'product_name' => 'MacBook Pro 16"', 'quantity' => 1, 'price' => 2399, 'created_at' => '2024-03-05 00:00:00', 'updated_at' => '2024-03-05 00:00:00'],
            ['id' => 'oi3', 'order_id' => 'o2', 'product_id' => 'p5', 'product_name' => 'Sony WH-1000XM5', 'quantity' => 1, 'price' => 299, 'created_at' => '2024-03-05 00:00:00', 'updated_at' => '2024-03-05 00:00:00'],
            ['id' => 'oi4', 'order_id' => 'o3', 'product_id' => 'p4', 'product_name' => 'Air Jordan 1', 'quantity' => 2, 'price' => 180, 'created_at' => '2024-03-10 00:00:00', 'updated_at' => '2024-03-10 00:00:00'],
            ['id' => 'oi5', 'order_id' => 'o4', 'product_id' => 'p2', 'product_name' => 'Galaxy S24 Ultra', 'quantity' => 1, 'price' => 1199, 'created_at' => '2024-03-12 00:00:00', 'updated_at' => '2024-03-12 00:00:00'],
        ]);

        Coupon::query()->insert([
            ['id' => 'cp1', 'code' => 'SAVE10', 'type' => 'percentage', 'value' => 10, 'start_date' => '2024-01-01', 'end_date' => '2024-12-31', 'usage_limit' => 100, 'usage_count' => 42, 'status' => 'active', 'created_at' => '2024-01-01 00:00:00', 'updated_at' => '2024-01-01 00:00:00'],
            ['id' => 'cp2', 'code' => 'FLAT50', 'type' => 'fixed', 'value' => 50, 'start_date' => '2024-03-01', 'end_date' => '2024-06-30', 'usage_limit' => 50, 'usage_count' => 12, 'status' => 'active', 'created_at' => '2024-03-01 00:00:00', 'updated_at' => '2024-03-01 00:00:00'],
            ['id' => 'cp3', 'code' => 'SUMMER20', 'type' => 'percentage', 'value' => 20, 'start_date' => '2024-06-01', 'end_date' => '2024-08-31', 'usage_limit' => 200, 'usage_count' => 0, 'status' => 'disabled', 'created_at' => '2024-02-15 00:00:00', 'updated_at' => '2024-02-15 00:00:00'],
        ]);

        Review::query()->insert([
            ['id' => 'r1', 'product_id' => 'p1', 'product_name' => 'iPhone 15 Pro', 'customer_name' => 'John Doe', 'rating' => 5, 'comment' => 'Best phone I\'ve ever had!', 'status' => 'approved', 'created_at' => '2024-03-05 00:00:00', 'updated_at' => '2024-03-05 00:00:00'],
            ['id' => 'r2', 'product_id' => 'p3', 'product_name' => 'MacBook Pro 16"', 'customer_name' => 'Jane Smith', 'rating' => 4, 'comment' => 'Great laptop, a bit pricey', 'status' => 'approved', 'created_at' => '2024-03-08 00:00:00', 'updated_at' => '2024-03-08 00:00:00'],
            ['id' => 'r3', 'product_id' => 'p5', 'product_name' => 'Sony WH-1000XM5', 'customer_name' => 'Alice Brown', 'rating' => 5, 'comment' => 'Amazing noise cancellation!', 'status' => 'pending', 'created_at' => '2024-03-11 00:00:00', 'updated_at' => '2024-03-11 00:00:00'],
            ['id' => 'r4', 'product_id' => 'p4', 'product_name' => 'Air Jordan 1', 'customer_name' => 'Bob Wilson', 'rating' => 3, 'comment' => 'Good but runs small', 'status' => 'pending', 'created_at' => '2024-03-12 00:00:00', 'updated_at' => '2024-03-12 00:00:00'],
        ]);

        HeroBanner::query()->insert([
            [
                'id' => 'hb1',
                'title' => 'Spring arrivals for everyday tech',
                'subtitle' => 'Explore the latest devices, accessories, and seasonal deals.',
                'button_label' => 'Shop Now',
                'button_url' => '/shop',
                'image_path' => '/images/herobg.jpeg',
                'image_paths' => json_encode(['/images/herobg.jpeg']),
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => '2024-03-14 00:00:00',
                'updated_at' => '2024-03-14 00:00:00',
            ],
        ]);

        $flashDeal = FlashDeal::query()->create([
            'id' => 'fd1',
            'name' => 'Homepage Launch Deal',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        $flashDeal->products()->sync([
            'p1' => ['sort_order' => 0],
            'p3' => ['sort_order' => 1],
            'p5' => ['sort_order' => 2],
            'p7' => ['sort_order' => 3],
        ]);
    }
}
