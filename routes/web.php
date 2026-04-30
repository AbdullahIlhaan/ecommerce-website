<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PhoneAuthController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\ContentPageController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FooterSettingController;
use App\Http\Controllers\FlashDealController;
use App\Http\Controllers\HeroBannerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReturnRequestController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\UserController;
use App\Models\Category;
use App\Models\FlashDeal;
use App\Models\HeroBanner;
use App\Support\DashboardData;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/', fn () => Inertia::render('Home', [
    'categories' => DashboardData::categories(
        Category::query()
            ->orderByRaw('case when parent_id is null then 0 else 1 end')
            ->orderBy('name')
            ->get()
    ),
    'heroBanners' => DashboardData::heroBanners(
        HeroBanner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->get()
    ),
    'latestProducts' => DashboardData::products(
        \App\Models\Product::query()
            ->where('status', 'active')
            ->latest()
            ->limit(10)
            ->get()
    ),
    'flashDeal' => Schema::hasTable('flash_deals')
        ? DashboardData::flashDeal(
            FlashDeal::query()
                ->with(['products' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('flash_deal_product.sort_order')
                    ->limit(10)])
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('ends_at')->orWhere('ends_at', '>', now());
                })
                ->orderByRaw('case when starts_at is null then 1 else 0 end')
                ->orderByDesc('starts_at')
                ->orderByDesc('updated_at')
                ->first()
        )
        : null,
    'flashSaleProducts' => Schema::hasTable('flash_deals')
        ? data_get(DashboardData::flashDeal(
            FlashDeal::query()
                ->with(['products' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('flash_deal_product.sort_order')
                    ->limit(10)])
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('ends_at')->orWhere('ends_at', '>', now());
                })
                ->orderByRaw('case when starts_at is null then 1 else 0 end')
                ->orderByDesc('starts_at')
                ->orderByDesc('updated_at')
                ->first()
        ), 'products', [])
        : [],
    'trendingProducts' => DashboardData::products(
        \App\Models\Product::query()
            ->where('status', 'active')
            ->orderByDesc('stock')
            ->latest()
            ->limit(10)
            ->get()
    ),
    'brands' => DashboardData::brands(
        \App\Models\Brand::query()
            ->orderBy('name')
            ->limit(12)
            ->get()
    ),
]))->name('home');

Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('/shop/search/suggestions', [ShopController::class, 'suggestions'])->name('shop.suggestions');
Route::get('/categories/all', [ShopController::class, 'categories'])->name('shop.categories');
Route::get('/products/{product}', [ShopController::class, 'show'])
    ->whereUuid('product')
    ->name('shop.show');
Route::get('/checkout', [ShopController::class, 'checkout'])->name('shop.checkout');
Route::get('/checkout/cart-items', [ShopController::class, 'cartItems'])->name('shop.checkout.cart-items');
Route::post('/checkout', [ShopController::class, 'storeOrder'])->name('shop.checkout.store');
Route::get('/checkout/success', [ShopController::class, 'checkoutSuccess'])->name('shop.checkout.success');
Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
Route::get('/orders/{order}/return-request', [ReturnRequestController::class, 'create'])->name('return-requests.create');
Route::post('/orders/{order}/return-request', [ReturnRequestController::class, 'store'])->name('return-requests.store');

Route::get('/support-center', fn () => app(ContentPageController::class)->show('support-center'))->name('content-pages.support-center');
Route::get('/about-us', fn () => app(ContentPageController::class)->show('about-us'))->name('content-pages.about-us');
Route::get('/help-center', fn () => app(ContentPageController::class)->show('help-center'))->name('content-pages.help-center');
Route::get('/terms', fn () => app(ContentPageController::class)->show('terms'))->name('legal.terms');
Route::get('/refund-policy', fn () => app(ContentPageController::class)->show('refund-policy'))->name('legal.refund');
Route::get('/privacy-policy', fn () => app(ContentPageController::class)->show('privacy-policy'))->name('legal.privacy');

Route::view('/offline', 'offline')->name('offline');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('register.store');

    Route::post('/auth/phone/request', [PhoneAuthController::class, 'requestCode'])
        ->middleware('throttle:5,1')
        ->name('auth.phone.request');
    Route::post('/auth/phone/verify', [PhoneAuthController::class, 'verifyCode'])
        ->middleware('throttle:10,1')
        ->name('auth.phone.verify');

    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->whereIn('provider', ['google', 'facebook'])
        ->name('social.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->whereIn('provider', ['google', 'facebook'])
        ->name('social.callback');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/account', [AccountController::class, 'show'])->name('account');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    Route::get('/email/verify', fn () => to_route('account'))->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return to_route('account')->with('success', 'Email address verified.');
    })->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('success', 'Verification link sent to your email address.');
    })->middleware('throttle:6,1')->name('verification.send');

    Route::post('/phone/verification/request', [PhoneAuthController::class, 'requestVerificationCode'])
        ->middleware('throttle:5,1')
        ->name('phone.verification.request');
    Route::post('/phone/verification/verify', [PhoneAuthController::class, 'verifyPhone'])
        ->middleware('throttle:10,1')
        ->name('phone.verification.verify');
});

Route::middleware(['auth', 'role:super_admin,admin,moderator'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::put('/reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
    Route::put('/reviews/{review}/reject', [ReviewController::class, 'reject'])->name('reviews.reject');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
});

Route::middleware(['auth', 'role:super_admin,admin'])->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
    Route::get('/brands/create', [BrandController::class, 'create'])->name('brands.create');
    Route::get('/brands/{brand}/edit', [BrandController::class, 'edit'])->name('brands.edit');
    Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
    Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    Route::get('/hero-banners', [HeroBannerController::class, 'index'])->name('hero-banners.index');
    Route::get('/hero-banners/create', [HeroBannerController::class, 'create'])->name('hero-banners.create');
    Route::get('/hero-banners/{heroBanner}/edit', [HeroBannerController::class, 'edit'])->name('hero-banners.edit');
    Route::post('/hero-banners', [HeroBannerController::class, 'store'])->name('hero-banners.store');
    Route::put('/hero-banners/{heroBanner}', [HeroBannerController::class, 'update'])->name('hero-banners.update');
    Route::delete('/hero-banners/{heroBanner}', [HeroBannerController::class, 'destroy'])->name('hero-banners.destroy');

    Route::get('/flash-deals', [FlashDealController::class, 'index'])->name('flash-deals.index');
    Route::get('/flash-deals/create', [FlashDealController::class, 'create'])->name('flash-deals.create');
    Route::get('/flash-deals/{flashDeal}/edit', [FlashDealController::class, 'edit'])->name('flash-deals.edit');
    Route::post('/flash-deals', [FlashDealController::class, 'store'])->name('flash-deals.store');
    Route::put('/flash-deals/{flashDeal}', [FlashDealController::class, 'update'])->name('flash-deals.update');
    Route::delete('/flash-deals/{flashDeal}', [FlashDealController::class, 'destroy'])->name('flash-deals.destroy');

    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
    Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::get('/return-requests', [ReturnRequestController::class, 'index'])->name('return-requests.index');
    Route::get('/return-requests/{returnRequest}/edit', [ReturnRequestController::class, 'edit'])->name('return-requests.edit');
    Route::put('/return-requests/{returnRequest}', [ReturnRequestController::class, 'update'])->name('return-requests.update');

    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::get('/coupons/create', [CouponController::class, 'create'])->name('coupons.create');
    Route::get('/coupons/{coupon}/edit', [CouponController::class, 'edit'])->name('coupons.edit');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    Route::get('/footer-settings', [FooterSettingController::class, 'index'])->name('footer-settings.index');
    Route::post('/footer-settings', [FooterSettingController::class, 'update'])->name('footer-settings.update');

    Route::get('/content-pages', [ContentPageController::class, 'index'])->name('content-pages.index');
    Route::get('/content-pages/create', [ContentPageController::class, 'create'])->name('content-pages.create');
    Route::get('/content-pages/{contentPage}/edit', [ContentPageController::class, 'edit'])->name('content-pages.edit');
    Route::post('/content-pages', [ContentPageController::class, 'store'])->name('content-pages.store');
    Route::put('/content-pages/{contentPage}', [ContentPageController::class, 'update'])->name('content-pages.update');
    Route::delete('/content-pages/{contentPage}', [ContentPageController::class, 'destroy'])->name('content-pages.destroy');

    Route::get('/translations', [TranslationController::class, 'index'])->name('translations.index');
    Route::get('/translations/create', [TranslationController::class, 'create'])->name('translations.create');
    Route::get('/translations/{translation}/edit', [TranslationController::class, 'edit'])->name('translations.edit');
    Route::post('/translations', [TranslationController::class, 'store'])->name('translations.store');
    Route::put('/translations/{translation}', [TranslationController::class, 'update'])->name('translations.update');
    Route::delete('/translations/{translation}', [TranslationController::class, 'destroy'])->name('translations.destroy');
});

Route::middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});
