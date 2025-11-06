<?php

namespace App\Libs;

use Illuminate\Support\Facades\Storage;

class StorageService
{

    static private function getJsonExistingData(string $path): array
    {
        if (Storage::exists($path)) {
            $content = Storage::get($path);
            return json_decode($content, true) ?? [];
        }
        return [];
    }

    static public function getJson(string $path)
    {
        try {
            $data = self::getJsonExistingData($path);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON format: ' . json_last_error_msg());
            }

            return $data;

        } catch (\Exception $e) {
            //\Log::error('JSON file read error: ' . $e->getMessage());
            return null;
        }
    }

    static public function insertJson(string $path, array $newData): bool
    {
        try {
            Storage::put($path, json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            return true;
        } catch (\Exception $e) {
            //\Log::error('JSON insert error: ' . $e->getMessage());
            return false;
        }
    }
}