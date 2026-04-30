<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Customers', $this->sharedProps());
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Form', [
            ...$this->sharedProps(),
            'mode' => 'create',
            'customer' => null,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Form', [
            ...$this->sharedProps(),
            'mode' => 'edit',
            'customer' => DashboardData::customers(collect([$customer]))[0],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Customer::query()->create($this->validated($request));

        return to_route('customers.index')->with('success', 'Customer created.');
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $customer->update($this->validated($request, $customer->id));

        return to_route('customers.index')->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return to_route('customers.index')->with('success', 'Customer deleted.');
    }

    private function validated(Request $request, ?string $customerId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customerId)],
            'phone' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive', 'blocked'])],
        ]);
    }

    private function sharedProps(): array
    {
        return [
            'customers' => DashboardData::customers(Customer::query()->orderBy('name')->get()),
        ];
    }
}
