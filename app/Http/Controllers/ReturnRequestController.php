<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\User;
use App\Notifications\AdminOrderNotification;
use App\Support\DashboardData;
use App\Support\InventoryManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReturnRequestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ReturnRequests', [
            'returnRequests' => DashboardData::returnRequests(
                ReturnRequest::query()
                    ->with(['order', 'customer'])
                    ->latest()
                    ->get()
            ),
        ]);
    }

    public function edit(ReturnRequest $returnRequest): Response
    {
        return Inertia::render('ReturnRequests/Edit', [
            'returnRequest' => DashboardData::returnRequest($returnRequest->load(['order.items.product', 'customer'])),
            'order' => DashboardData::order($returnRequest->order->load(['customer', 'items', 'returnRequests'])),
        ]);
    }

    public function update(Request $request, ReturnRequest $returnRequest): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected', 'received', 'refunded', 'closed'])],
            'refundAmount' => ['nullable', 'numeric', 'min:0'],
            'resolutionNotes' => ['nullable', 'string'],
            'restockItems' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($data, $request, $returnRequest): void {
            $wasPendingLike = in_array($returnRequest->status, ['pending', 'approved', 'received'], true);
            $shouldRestock = (bool) $data['restockItems']
                && in_array($data['status'], ['received', 'refunded', 'closed'], true)
                && ! $returnRequest->restock_items;

            $returnRequest->update([
                'status' => $data['status'],
                'refund_amount' => $data['refundAmount'] ?? null,
                'resolution_notes' => $data['resolutionNotes'] ?? null,
                'restock_items' => (bool) $data['restockItems'],
                'reviewed_at' => now(),
            ]);

            if ($shouldRestock) {
                $returnRequest->order->loadMissing('items.product');
                foreach ($returnRequest->order->items as $item) {
                    if ($item->product) {
                        InventoryManager::recordRestockFromReturn($item->product, (int) $item->quantity, $returnRequest, $request->user());
                    }
                }
            }

            if ($data['status'] === 'refunded') {
                $returnRequest->order->update(['payment_status' => 'refunded']);
            }

            if ($wasPendingLike && in_array($data['status'], ['approved', 'received', 'refunded'], true)) {
                User::query()
                    ->whereIn('role', [UserRole::SuperAdmin->value, UserRole::Admin->value])
                    ->when($request->user(), fn ($query, $user) => $query->whereKeyNot($user->id))
                    ->get()
                    ->each(fn (User $user) => $user->notify(new AdminOrderNotification($returnRequest->order->loadMissing('customer'), 'updated')));
            }
        });

        return to_route('return-requests.index')->with('success', 'Return request updated.');
    }

    public function create(Order $order): Response
    {
        abort_unless($this->canAccessOrder($order, request()), 403);

        return Inertia::render('Shop/ReturnRequest', [
            'order' => DashboardData::order($order->load(['customer', 'items', 'returnRequests'])),
        ]);
    }

    public function store(Request $request, Order $order): RedirectResponse
    {
        abort_unless($this->canAccessOrder($order, $request), 403);

        $data = $request->validate([
            'type' => ['required', Rule::in(['refund', 'return', 'exchange'])],
            'reason' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ]);

        ReturnRequest::query()->create([
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'type' => $data['type'],
            'reason' => $data['reason'],
            'details' => $data['details'] ?? null,
            'requested_at' => now(),
            'status' => 'pending',
        ]);

        User::query()
            ->whereIn('role', [UserRole::SuperAdmin->value, UserRole::Admin->value])
            ->get()
            ->each(fn (User $user) => $user->notify(new AdminOrderNotification($order->loadMissing('customer'), 'updated')));

        return to_route('orders.invoice', ['order' => $order, 'signature' => request()->query('signature'), 'expires' => request()->query('expires')])
            ->with('success', 'Return request submitted.');
    }

    private function canAccessOrder(Order $order, Request $request): bool
    {
        $user = $request->user();
        $customer = $order->customer;

        return $request->hasValidSignature()
            || ($user !== null && $user->canAccessAdminPanel())
            || (
                $user !== null
                && $customer !== null
                && ($customer->user_id === $user->id || $customer->email === $user->email)
            );
    }
}
