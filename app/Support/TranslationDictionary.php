<?php

namespace App\Support;

use App\Models\Translation;

class TranslationDictionary
{
    public static function shared(): array
    {
        return Translation::query()
            ->where('is_active', true)
            ->orderBy('group_name')
            ->orderBy('translation_key')
            ->get()
            ->mapWithKeys(fn (Translation $translation) => [
                $translation->translation_key => [
                    'en' => $translation->english_text,
                    'bn' => $translation->bangla_text,
                ],
            ])
            ->all();
    }
}
