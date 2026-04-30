<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use App\Notifications\AdminOrderNotification;
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
        return Inertia::render('Orders', $this->sharedProps());
    }

    public function edit(Order $order): Response
    {
        return Inertia::render('Orders/Edit', [
            ...$this->sharedProps(),
            'order' => DashboardData::order($order->load(['customer', 'items', 'returnRequests'])),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'paymentStatus' => ['required', Rule::in(['pending', 'paid', 'refunded', 'failed'])],
            'shippingCarrier' => ['nullable', 'string', 'max:120'],
            'trackingNumber' => ['nullable', 'string', 'max:120'],
            'estimatedDeliveryAt' => ['nullable', 'date'],
            'internalNotes' => ['nullable', 'string'],
        ]);

        $nextShippedAt = $order->shipped_at;
        $nextDeliveredAt = $order->delivered_at;

        if ($data['status'] === 'shipped' && $nextShippedAt === null) {
            $nextShippedAt = now();
        }

        if ($data['status'] === 'delivered') {
            $nextShippedAt ??= now();
            $nextDeliveredAt = now();
        }

        $order->update([
            'status' => $data['status'],
            'payment_status' => $data['paymentStatus'],
            'shipping_carrier' => $data['shippingCarrier'] ?? null,
            'tracking_number' => $data['trackingNumber'] ?? null,
            'estimated_delivery_at' => $data['estimatedDeliveryAt'] ?? null,
            'internal_notes' => $data['internalNotes'] ?? null,
            'shipped_at' => $nextShippedAt,
            'delivered_at' => $nextDeliveredAt,
        ]);

        $order->customer->notify(new \App\Notifications\OrderUpdated($order));
        User::query()
            ->whereIn('role', [UserRole::SuperAdmin->value, UserRole::Admin->value])
            ->when($request->user(), fn ($query, $user) => $query->whereKeyNot($user->id))
            ->get()
            ->each(fn (User $user) => $user->notify(new AdminOrderNotification($order->loadMissing('customer'), 'updated')));

        return to_route('orders.index')->with('success', 'Order updated.');
    }

    public function invoice(Order $order): Response
    {
        $user = request()->user();
        $customer = $order->customer;

        $canView = request()->hasValidSignature()
            || ($user !== null && $user->canAccessAdminPanel())
            || (
                $user !== null
                && $customer !== null
                && ($customer->user_id === $user->id || $customer->email === $user->email)
            );

        abort_unless($canView, 403);

        return Inertia::render('Shop/Invoice', [
            'order' => DashboardData::order($order->load(['customer', 'items', 'returnRequests'])),
        ]);
    }

    private function sharedProps(): array
    {
        return [
            'orders' => DashboardData::orders(Order::query()->with(['customer', 'items', 'returnRequests'])->latest()->get()),
            'customers' => DashboardData::customers(Customer::query()->orderBy('name')->get()),
        ];
    }
}
