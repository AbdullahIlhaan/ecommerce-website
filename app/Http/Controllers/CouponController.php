<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Coupons', [
            'coupons' => DashboardData::coupons(Coupon::query()->latest()->get()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Coupon::query()->create($this->validated($request));

        return to_route('coupons.index')->with('success', 'Coupon created.');
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update($this->validated($request, $coupon->id, $coupon->usage_count));

        return to_route('coupons.index')->with('success', 'Coupon updated.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return to_route('coupons.index')->with('success', 'Coupon deleted.');
    }

    private function validated(Request $request, ?string $couponId = null, int $usageCount = 0): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('coupons', 'code')->ignore($couponId)],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0'],
            'startDate' => ['nullable', 'date'],
            'endDate' => ['nullable', 'date'],
            'usageLimit' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'expired', 'disabled'])],
        ]);

        return [
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => $data['value'],
            'start_date' => $data['startDate'] ?? null,
            'end_date' => $data['endDate'] ?? null,
            'usage_limit' => $data['usageLimit'] ?? 0,
            'usage_count' => $usageCount,
            'status' => $data['status'],
        ];
    }
}
