<?php

namespace App\Support;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\FlashDeal;
use App\Models\HeroBanner;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\URL;

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

    public static function heroBanners(Collection $heroBanners): array
    {
        return $heroBanners->map(fn (HeroBanner $heroBanner) => [
            'id' => $heroBanner->id,
            'title' => $heroBanner->title,
            'subtitle' => $heroBanner->subtitle ?? '',
            'buttonLabel' => $heroBanner->button_label ?? '',
            'buttonUrl' => $heroBanner->button_url ?? '',
            'imagePath' => $heroBanner->image_path,
            'imagePaths' => $heroBanner->image_paths ?: array_filter([$heroBanner->image_path]),
            'sortOrder' => $heroBanner->sort_order,
            'isActive' => (bool) $heroBanner->is_active,
            'createdAt' => $heroBanner->created_at?->toDateString(),
        ])->all();
    }

    public static function heroBanner(?HeroBanner $heroBanner): ?array
    {
        if ($heroBanner === null) {
            return null;
        }

        return [
            'id' => $heroBanner->id,
            'title' => $heroBanner->title,
            'subtitle' => $heroBanner->subtitle ?? '',
            'buttonLabel' => $heroBanner->button_label ?? '',
            'buttonUrl' => $heroBanner->button_url ?? '',
            'imagePath' => $heroBanner->image_path,
            'imagePaths' => $heroBanner->image_paths ?: array_filter([$heroBanner->image_path]),
            'sortOrder' => $heroBanner->sort_order,
            'isActive' => (bool) $heroBanner->is_active,
            'createdAt' => $heroBanner->created_at?->toDateString(),
        ];
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

    public static function flashDeals(Collection $flashDeals): array
    {
        return $flashDeals->map(fn (FlashDeal $flashDeal) => self::flashDeal($flashDeal))->all();
    }

    public static function flashDeal(?FlashDeal $flashDeal): ?array
    {
        if ($flashDeal === null) {
            return null;
        }

        $now = now();
        $startsAt = $flashDeal->starts_at;
        $endsAt = $flashDeal->ends_at;

        $status = 'scheduled';

        if (! $flashDeal->is_active) {
            $status = 'disabled';
        } elseif ($endsAt && $endsAt->isPast()) {
            $status = 'ended';
        } elseif (($startsAt === null || $startsAt->lte($now)) && ($endsAt === null || $endsAt->gt($now))) {
            $status = 'running';
        }

        return [
            'id' => $flashDeal->id,
            'name' => $flashDeal->name,
            'startsAt' => $startsAt?->toIso8601String(),
            'endsAt' => $endsAt?->toIso8601String(),
            'isActive' => (bool) $flashDeal->is_active,
            'status' => $status,
            'productIds' => $flashDeal->relationLoaded('products')
                ? $flashDeal->products->pluck('id')->all()
                : [],
            'products' => $flashDeal->relationLoaded('products')
                ? self::products($flashDeal->products)
                : [],
            'createdAt' => $flashDeal->created_at?->toDateString(),
        ];
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
        return $orders->map(fn (Order $order) => self::order($order))->all();
    }

    public static function order(Order $order): array
    {
        return [
            'id' => $order->id,
            'invoiceNumber' => $order->invoice_number ?: $order->buildInvoiceNumber(),
            'customerId' => $order->customer_id,
            'customer' => $order->customer ? [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
                'phone' => $order->customer->phone,
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'productId' => $item->product_id,
                'productName' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
            ])->all(),
            'subtotal' => (float) $order->subtotal,
            'tax' => (float) $order->tax,
            'deliveryCharge' => (float) ($order->delivery_charge ?? 0),
            'deliveryZone' => $order->delivery_zone,
            'deliveryCity' => $order->delivery_city,
            'deliveryAddress' => $order->delivery_address,
            'deliveryLocationLabel' => $order->delivery_location_label,
            'deliveryLatitude' => $order->delivery_latitude !== null ? (float) $order->delivery_latitude : null,
            'deliveryLongitude' => $order->delivery_longitude !== null ? (float) $order->delivery_longitude : null,
            'total' => (float) $order->total,
            'status' => $order->status,
            'paymentStatus' => $order->payment_status,
            'paymentMethod' => $order->payment_method ?: 'cod',
            'invoiceUrl' => URL::signedRoute('orders.invoice', ['order' => $order]),
            'createdAt' => $order->created_at?->toDateString(),
            'formattedDate' => $order->created_at?->format('F d, Y'),
        ];
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

    public static function footerSetting(?\App\Models\FooterSetting $footerSetting): array
    {
        $defaults = [
            'logo_text' => 'FutureBD',
            'description' => 'The platform to get products from global marketplaces to Bangladesh. You can pay product price in Bangladeshi Taka (BDT).',
            'address' => 'Plot 1020, Mirpur DOHS, Dhaka.',
            'phone' => '+88 09666 78 3333',
            'email' => 'support@futurebd.com',
            'facebook_url' => null,
            'youtube_url' => null,
            'facebook_pixel_id' => null,
            'copyright' => '© 2018-2026 FutureBD. All rights reserved.',
            'payment_methods' => [],
            'social_links' => [],
        ];

        if (! $footerSetting) {
            $footerSetting = new \App\Models\FooterSetting([
                'logo_text' => 'FutureBD',
                'description' => 'The platform to get products from global marketplaces to Bangladesh.',
                'facebook_url' => null,
                'youtube_url' => null,
                'facebook_pixel_id' => null,
                'copyright' => '© 2018-2026 FutureBD. All rights reserved.',
                'payment_methods' => [],
                'social_links' => [],
            ]);
        }

        return [
            'id' => $footerSetting->id,
            'logoPath' => $footerSetting->logo_path,
            'logoText' => $footerSetting->logo_text ?: $defaults['logo_text'],
            'description' => $footerSetting->description ?: $defaults['description'],
            'address' => $footerSetting->address ?: $defaults['address'],
            'phone' => $footerSetting->phone ?: $defaults['phone'],
            'email' => $footerSetting->email ?: $defaults['email'],
            'facebookUrl' => $footerSetting->facebook_url ?: $defaults['facebook_url'],
            'youtubeUrl' => $footerSetting->youtube_url ?: $defaults['youtube_url'],
            'facebookPixelId' => $footerSetting->facebook_pixel_id ?: $defaults['facebook_pixel_id'],
            'copyright' => $footerSetting->copyright ?: $defaults['copyright'],
            'paymentMethods' => collect($footerSetting->payment_methods ?: $defaults['payment_methods'])->map(fn($m) => [
                'name' => $m['name'] ?? '',
                'imagePath' => $m['image_path'] ?? null,
            ])->all(),
            'socialLinks' => $footerSetting->social_links ?: $defaults['social_links'],
        ];
    }
}
