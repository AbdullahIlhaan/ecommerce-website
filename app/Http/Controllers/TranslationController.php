<?php

namespace App\Http\Controllers;

use App\Models\Translation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    public function index(): Response
    {
        $translations = Translation::query()
            ->orderByRaw('case when group_name is null or group_name = "" then 1 else 0 end')
            ->orderBy('group_name')
            ->orderBy('translation_key')
            ->get();

        return Inertia::render('Translations', [
            'translations' => $this->transformTranslations($translations),
            'groups' => $translations
                ->pluck('group_name')
                ->filter()
                ->unique()
                ->values()
                ->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Translation::query()->create($this->validated($request));

        return to_route('translations.index')->with('success', 'Translation created.');
    }

    public function update(Request $request, Translation $translation): RedirectResponse
    {
        $translation->update($this->validated($request, $translation));

        return to_route('translations.index')->with('success', 'Translation updated.');
    }

    public function destroy(Translation $translation): RedirectResponse
    {
        $translation->delete();

        return to_route('translations.index')->with('success', 'Translation deleted.');
    }

    private function validated(Request $request, ?Translation $translation = null): array
    {
        $data = $request->validate([
            'key' => [
                'required',
                'string',
                'max:120',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('translations', 'translation_key')->ignore($translation?->id),
            ],
            'group' => ['nullable', 'string', 'max:80'],
            'englishText' => ['required', 'string'],
            'banglaText' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'isActive' => ['required', 'boolean'],
        ], [
            'key.regex' => 'The key may only contain letters, numbers, dots, underscores, and hyphens.',
        ]);

        return [
            'translation_key' => $data['key'],
            'group_name' => $data['group'],
            'english_text' => $data['englishText'],
            'bangla_text' => $data['banglaText'],
            'notes' => $data['notes'],
            'is_active' => $data['isActive'],
        ];
    }

    private function transformTranslations(iterable $translations): array
    {
        return collect($translations)->map(fn (Translation $translation) => [
            'id' => $translation->id,
            'key' => $translation->translation_key,
            'group' => $translation->group_name,
            'englishText' => $translation->english_text,
            'banglaText' => $translation->bangla_text ?? '',
            'notes' => $translation->notes,
            'isActive' => (bool) $translation->is_active,
            'updatedAt' => $translation->updated_at?->format('Y-m-d H:i'),
        ])->all();
    }
}
