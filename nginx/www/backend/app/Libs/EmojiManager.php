<?php

namespace App\Libs;

use Illuminate\Support\Facades\Log;
use App\Libs\ImageProcessingService;
use Illuminate\Support\Facades\Storage;

class EmojiManager
{
    private static $emoji_path = 'public/emoji';
    private static $emoji_json = 'emoji_data.json';
    private static $emoji_db_json = 'emoji_db.json';
    private static $emoji_file_types = [
        'image/apng',
        'image/jpeg',
        'image/pjpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
    ];

    static public function generateEmojiJson($emojiList)
    {
        $jsonContent = json_encode($emojiList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        Storage::put(self::$emoji_json, $jsonContent);
        return $emojiList;
    }

    static public function generateEmojiJsonToDB()
    {
        $emojiData = [];
        $directories = Storage::directories(self::$emoji_path);
        
        foreach ($directories as $directory) {
            $folderName = basename($directory);
            $files = Storage::files($directory);
            
            foreach ($files as $file) {
                $fileMimeType = Storage::mimeType($file);
                if (!in_array($fileMimeType, self::$emoji_file_types)) {
                    continue;
                }

                $filePath = basename($file);
                $fileId = pathinfo($filePath, PATHINFO_FILENAME);
                $fileName = $fileId;
                
                $emojiData[] = [
                    'name' => $fileName,
                    'folder' => $folderName,
                ];
            }
        }

        $jsonContent = json_encode($emojiData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        Storage::put(self::$emoji_db_json, $jsonContent);

        return $emojiData;
    }

    static public function get()
    {
        if (!Storage::exists(self::$emoji_json)) {
            self::generateEmojiJson();
        }
        $jsonContent = Storage::get(self::$emoji_json);
        return json_decode($jsonContent, true);
    }
}