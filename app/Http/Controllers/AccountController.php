<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\DashboardData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        
        $orders = Order::query()
            ->with(['items', 'customer'])
            ->whereHas('customer', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->latest()
            ->get();

        return Inertia::render('Account', [
            'orders' => DashboardData::orders($orders),
        ]);
    }
}
