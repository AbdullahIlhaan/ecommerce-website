<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reviews', [
            'reviews' => DashboardData::reviews(Review::query()->latest()->get()),
        ]);
    }

    public function approve(Review $review): RedirectResponse
    {
        $review->update(['status' => 'approved']);

        return to_route('reviews.index')->with('success', 'Review approved.');
    }

    public function reject(Review $review): RedirectResponse
    {
        $review->update(['status' => 'rejected']);

        return to_route('reviews.index')->with('success', 'Review rejected.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return to_route('reviews.index')->with('success', 'Review deleted.');
    }
}
