<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\StockMovement;
use App\Support\DashboardData;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'products' => DashboardData::products(Product::query()->latest()->get()),
            'orders' => DashboardData::orders(Order::query()->with(['customer', 'items', 'returnRequests'])->latest()->get()),
            'customers' => DashboardData::customers(Customer::query()->latest()->get()),
            'reviews' => DashboardData::reviews(Review::query()->latest()->get()),
            'returnRequests' => DashboardData::returnRequests(ReturnRequest::query()->with(['order', 'customer'])->latest()->get()),
            'stockMovements' => DashboardData::stockMovements(StockMovement::query()->with('product')->latest()->limit(12)->get()),
        ]);
    }
}
