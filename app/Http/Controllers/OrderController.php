<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Orders', [
            'orders' => DashboardData::orders(Order::query()->with(['customer', 'items'])->latest()->get()),
            'customers' => DashboardData::customers(Customer::query()->orderBy('name')->get()),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'paymentStatus' => ['required', Rule::in(['pending', 'paid', 'refunded', 'failed'])],
        ]);

        $order->update([
            'status' => $data['status'],
            'payment_status' => $data['paymentStatus'],
        ]);

        return to_route('orders.index')->with('success', 'Order updated.');
    }
}
