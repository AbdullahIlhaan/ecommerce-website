<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class NotificationController extends Controller
{
    public function markAllRead(Request $request): RedirectResponse
    {
        if (! Schema::hasTable('notifications')) {
            return back();
        }

        $request->user()?->unreadNotifications->markAsRead();

        return back()->with('success', 'Notifications marked as read.');
    }

    public function markRead(Request $request, string $notification): RedirectResponse
    {
        if (! Schema::hasTable('notifications')) {
            return back();
        }

        $request->user()?->unreadNotifications()
            ->where('id', $notification)
            ->update(['read_at' => now()]);

        return back();
    }
}
