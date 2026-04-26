<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PhoneAuthController extends Controller
{
    public function requestCode(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:30', Rule::exists('users', 'phone')],
        ]);

        $user = User::query()->where('phone', $data['phone'])->firstOrFail();
        $message = $this->issueCode($user, 'login');

        return back()->with('success', $message);
    }

    public function verifyCode(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:30', Rule::exists('users', 'phone')],
            'code' => ['required', 'digits:6'],
        ]);

        $user = User::query()->where('phone', $data['phone'])->firstOrFail();

        $loginCode = $user->phoneLoginCodes()
            ->whereNull('used_at')
            ->latest()
            ->first();

        if ($loginCode === null || $loginCode->expires_at->isPast() || ! Hash::check($data['code'], $loginCode->code_hash)) {
            throw ValidationException::withMessages([
                'code' => 'The verification code is invalid or expired.',
            ]);
        }

        $loginCode->update([
            'used_at' => now(),
        ]);

        if ($user->phone_verified_at === null) {
            $user->forceFill([
                'phone_verified_at' => now(),
            ])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return to_route('home');
    }

    public function requestVerificationCode(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_if($user === null, 403);

        if (blank($user->phone)) {
            return back()->with('error', 'Add a phone number before requesting verification.');
        }

        $message = $this->issueCode($user, 'verification');

        return back()->with('success', $message);
    }

    public function verifyPhone(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();

        abort_if($user === null, 403);

        $loginCode = $user->phoneLoginCodes()
            ->where('phone', $user->phone)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if ($loginCode === null || $loginCode->expires_at->isPast() || ! Hash::check($data['code'], $loginCode->code_hash)) {
            throw ValidationException::withMessages([
                'code' => 'The verification code is invalid or expired.',
            ]);
        }

        $loginCode->update([
            'used_at' => now(),
        ]);

        $user->forceFill([
            'phone_verified_at' => now(),
        ])->save();

        return to_route('account')->with('success', 'Phone number verified.');
    }

    private function issueCode(User $user, string $context): string
    {
        $plainCode = (string) random_int(100000, 999999);

        $user->phoneLoginCodes()
            ->whereNull('used_at')
            ->delete();

        $user->phoneLoginCodes()->create([
            'phone' => $user->phone,
            'code_hash' => Hash::make($plainCode),
            'expires_at' => now()->addMinutes(10),
        ]);

        Log::info('Phone verification code generated.', [
            'context' => $context,
            'user_id' => $user->id,
            'phone' => $user->phone,
        ]);

        return app()->environment('local')
            ? 'Verification code generated. Local OTP: '.$plainCode
            : 'Verification code sent to your phone.';
    }
}
