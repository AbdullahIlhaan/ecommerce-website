<?php

namespace App\Support;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Collection;

class DashboardData
{
    public static function brands(Collection $brands): array
    {
        return $brands->map(fn (Brand $brand) => [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'createdAt' => $brand->created_at?->toDateString(),
        ])->all();
    }

    public static function categories(Collection $categories): array
    {
        return $categories->map(fn (Category $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parentId' => $category->parent_id,
            'createdAt' => $category->created_at?->toDateString(),
        ])->all();
    }

    public static function customers(Collection $customers): array
    {
        return $customers->map(fn (Customer $customer) => [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'status' => $customer->status,
            'createdAt' => $customer->created_at?->toDateString(),
        ])->all();
    }

    public static function coupons(Collection $coupons): array
    {
        return $coupons->map(fn (Coupon $coupon) => [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'startDate' => $coupon->start_date?->toDateString() ?? '',
            'endDate' => $coupon->end_date?->toDateString() ?? '',
            'usageLimit' => $coupon->usage_limit,
            'usageCount' => $coupon->usage_count,
            'status' => $coupon->status,
            'createdAt' => $coupon->created_at?->toDateString(),
        ])->all();
    }

    public static function products(Collection $products): array
    {
        return $products->map(fn (Product $product) => [
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
            'createdAt' => $product->created_at?->toDateString(),
        ])->all();
    }

    public static function orders(Collection $orders): array
    {
        return $orders->map(fn (Order $order) => [
            'id' => $order->id,
            'customerId' => $order->customer_id,
            'customerName' => $order->customer?->name ?? 'Unknown',
            'items' => $order->items->map(fn ($item) => [
                'productId' => $item->product_id,
                'productName' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
            ])->all(),
            'subtotal' => (float) $order->subtotal,
            'tax' => (float) $order->tax,
            'total' => (float) $order->total,
            'status' => $order->status,
            'paymentStatus' => $order->payment_status,
            'createdAt' => $order->created_at?->toDateString(),
        ])->all();
    }

    public static function reviews(Collection $reviews): array
    {
        return $reviews->map(fn (Review $review) => [
            'id' => $review->id,
            'productId' => $review->product_id,
            'productName' => $review->product_name,
            'customerName' => $review->customer_name,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'status' => $review->status,
            'createdAt' => $review->created_at?->toDateString(),
        ])->all();
    }
}
