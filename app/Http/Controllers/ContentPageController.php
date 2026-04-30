<?php

namespace App\Http\Controllers;

use App\Models\ContentPage;
use App\Support\DashboardData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ContentPages', $this->sharedProps());
    }

    public function create(): Response
    {
        return Inertia::render('ContentPages/Form', [
            ...$this->sharedProps(),
            'mode' => 'create',
            'contentPage' => null,
        ]);
    }

    public function edit(ContentPage $contentPage): Response
    {
        return Inertia::render('ContentPages/Form', [
            ...$this->sharedProps(),
            'mode' => 'edit',
            'contentPage' => DashboardData::contentPage($contentPage),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($redirect = $this->redirectIfTableMissing()) {
            return $redirect;
        }

        $this->ensureDefaultPages();
        ContentPage::query()->create($this->validated($request));

        return to_route('content-pages.index')->with('success', 'Content page created.');
    }

    public function update(Request $request, ContentPage $contentPage): RedirectResponse
    {
        if ($redirect = $this->redirectIfTableMissing()) {
            return $redirect;
        }

        $this->ensureDefaultPages();
        $contentPage->update($this->validated($request, $contentPage));

        return to_route('content-pages.index')->with('success', 'Content page updated.');
    }

    public function destroy(ContentPage $contentPage): RedirectResponse
    {
        if ($redirect = $this->redirectIfTableMissing()) {
            return $redirect;
        }

        $contentPage->delete();

        return to_route('content-pages.index')->with('success', 'Content page deleted.');
    }

    public function show(string $slug): Response
    {
        if (! $this->contentPagesTableExists()) {
            $page = collect($this->defaultPages())->firstWhere('slug', $slug);
            abort_unless($page !== null, 404);

            return Inertia::render('ContentPages/Show', [
                'contentPage' => [
                    ...$page,
                    'id' => $slug,
                    'updatedAtLabel' => 'April 2026',
                ],
            ]);
        }

        $this->ensureDefaultPages();

        $contentPage = ContentPage::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        abort_unless($contentPage !== null, 404);

        return Inertia::render('ContentPages/Show', [
            'contentPage' => DashboardData::contentPage($contentPage),
        ]);
    }

    private function sharedProps(): array
    {
        if (! $this->contentPagesTableExists()) {
            return [
                'contentPages' => collect($this->defaultPages())->map(fn (array $page) => [
                    ...$page,
                    'id' => $page['slug'],
                    'updatedAt' => null,
                    'updatedAtLabel' => 'Default content',
                ])->values()->all(),
                'tableMissing' => true,
            ];
        }

        $this->ensureDefaultPages();

        return [
            'contentPages' => DashboardData::contentPages(
                ContentPage::query()->orderByDesc('updated_at')->orderBy('title')->get()
            ),
            'tableMissing' => false,
        ];
    }

    private function validated(Request $request, ?ContentPage $contentPage = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('content_pages', 'slug')->ignore($contentPage?->id),
            ],
            'summary' => ['nullable', 'string'],
            'body' => ['required', 'string'],
            'isActive' => ['required', 'boolean'],
        ], [
            'slug.regex' => 'Use lowercase letters, numbers, and hyphens only.',
        ]);

        return [
            'title' => $data['title'],
            'slug' => $data['slug'],
            'summary' => $data['summary'] ?? null,
            'body' => $data['body'],
            'is_active' => $data['isActive'],
        ];
    }

    private function ensureDefaultPages(): void
    {
        if (! $this->contentPagesTableExists()) {
            return;
        }

        collect($this->defaultPages())->each(function (array $page): void {
            ContentPage::query()->firstOrCreate(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'summary' => $page['summary'],
                    'body' => $page['body'],
                    'is_active' => $page['is_active'],
                ],
            );
        });
    }

    /**
     * @return array<int, array{title: string, slug: string, summary: string, body: string, is_active: bool}>
     */
    private function defaultPages(): array
    {
        return [
            [
                'title' => 'Support Center',
                'slug' => 'support-center',
                'summary' => 'Find the fastest way to reach Future-BD for order help, delivery updates, payment questions, and after-sales support.',
                'body' => implode("\n\n", [
                    'Our support team is here to help you with product sourcing, order tracking, payments, and delivery questions.',
                    'For urgent help, contact us through the phone number, email address, Facebook page, or WhatsApp channel listed in the footer settings.',
                    'When contacting support, please include your order number, customer name, and a short description of the issue so our team can respond faster.',
                    'Support hours, escalation steps, and channel details can be updated from this page at any time from the dashboard.',
                ]),
                'is_active' => true,
            ],
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'summary' => 'Learn more about Future-BD and how we help customers in Bangladesh buy from global marketplaces with confidence.',
                'body' => implode("\n\n", [
                    'Future-BD is a cross-border ecommerce platform focused on helping customers in Bangladesh access products from trusted global marketplaces.',
                    'Our mission is to make international shopping easier by simplifying product discovery, price visibility in BDT, customer support, and doorstep delivery.',
                    'We work to build trust through transparent communication, dependable order handling, and a customer-first support experience.',
                ]),
                'is_active' => true,
            ],
            [
                'title' => 'Help Center',
                'slug' => 'help-center',
                'summary' => 'Browse frequently needed information about ordering, payments, delivery, returns, and account support.',
                'body' => implode("\n\n", [
                    'Use this page to answer common customer questions about how to order, how delivery works, and what to expect after checkout.',
                    'You can include sections for payment methods, estimated delivery times, return steps, and account-related guidance.',
                    'Keep this content updated whenever your support process, delivery timelines, or customer policies change.',
                ]),
                'is_active' => true,
            ],
            [
                'title' => 'Refund Policy',
                'slug' => 'refund-policy',
                'summary' => 'Read the current Future-BD refund and return guidelines for eligible products and orders.',
                'body' => implode("\n\n", [
                    'We offer a limited return and refund process for eligible products under the conditions described on this page.',
                    'Returned items should be unused, in original condition, and include packaging where applicable.',
                    'Refund approval depends on inspection results, order condition, and whether the item qualifies under the current policy.',
                    'Shipping charges, special-order items, and promotional items may be subject to different refund rules.',
                ]),
                'is_active' => true,
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'summary' => 'Review how Future-BD collects, uses, and protects customer information.',
                'body' => implode("\n\n", [
                    'We collect customer information needed to provide account access, order handling, delivery coordination, and support services.',
                    'Information may include contact details, order history, delivery information, and communication records.',
                    'We use this information to operate the platform, improve customer experience, and communicate important service updates.',
                    'This page should also describe any analytics, cookies, or third-party tools used by the business.',
                ]),
                'is_active' => true,
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms',
                'summary' => 'Understand the rules, responsibilities, and service conditions for using Future-BD.',
                'body' => implode("\n\n", [
                    'By using Future-BD, customers agree to follow the platform rules, payment terms, and acceptable use standards published on this page.',
                    'Product information, pricing, order timelines, and service availability may change as operations or supplier conditions change.',
                    'Future-BD may limit or suspend access where misuse, fraudulent activity, or policy violations are detected.',
                    'This page should be kept updated whenever your commercial, legal, or operational terms change.',
                ]),
                'is_active' => true,
            ],
        ];
    }

    private function contentPagesTableExists(): bool
    {
        return Schema::hasTable('content_pages');
    }

    private function redirectIfTableMissing(): ?RedirectResponse
    {
        if ($this->contentPagesTableExists()) {
            return null;
        }

        return to_route('dashboard')->with('error', 'The content pages table is missing. Run the latest migrations first.');
    }
}
