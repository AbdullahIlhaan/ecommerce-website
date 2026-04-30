<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Users', $this->sharedProps());
    }

    public function create(): Response
    {
        return Inertia::render('Users/Form', [
            ...$this->sharedProps(),
            'mode' => 'create',
            'userRecord' => null,
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Form', [
            ...$this->sharedProps(),
            'mode' => 'edit',
            'userRecord' => $this->transformUsers([$user])[0],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        User::query()->create($this->validated($request));

        return to_route('users.index')->with('success', 'User created.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $user->update($this->validated($request, $user));

        return to_route('users.index')->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->is(auth()->user())) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return to_route('users.index')->with('success', 'User deleted.');
    }

    private function validated(Request $request, ?User $user = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'phone' => ['nullable', 'string', 'max:30', Rule::unique('users', 'phone')->ignore($user?->id)],
            'role' => ['required', Rule::in(UserRole::values())],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
        ]);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        return $data;
    }

    private function transformUsers(iterable $users): array
    {
        return collect($users)->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'createdAt' => $user->created_at?->toDateString(),
        ])->all();
    }

    private function sharedProps(): array
    {
        return [
            'users' => $this->transformUsers(User::query()->latest()->get()),
            'roles' => UserRole::options(),
        ];
    }
}
