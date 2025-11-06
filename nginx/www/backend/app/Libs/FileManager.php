<?php

namespace App\Libs;

use Illuminate\Support\Facades\Log;
use App\Libs\ImageProcessingService;
use Illuminate\Support\Facades\Storage;

class FileManager
{
    private static $imageService;
    private static $imageFileTypes = [
        'image/apng',
        'image/jpeg',
        'image/pjpeg',
        'image/png',
    ];

    private static function getImageService()
    {
        if (self::$imageService === null) {
            self::$imageService = new ImageProcessingService();
        }
        return self::$imageService;
    }
    

    static public function upload($file, $path, $name)
    {
        $response = false;

        if (!$file->isValid()) {
            Log::info('upload file is invalid');
            return $response;
        }

        $mime = $file->getClientMimeType();
        if (!in_array($mime, self::$imageFileTypes)) {
            Log::info("Upload file is NOT image. " . $file->filename . " " . $mime);
            return $response;
        }

        $extension = $file->getClientOriginalExtension();
        $fileName = $name . '.' . $extension;

        // ディレクトリが存在しない場合は作成
        if (!file_exists(storage_path($path))) {
            mkdir(storage_path($path), 0777, true);
        }

        try {
            $manager = self::getImageService();

            $destinationPath = storage_path($path . '/' . $fileName);
            $destinationPath = $manager->process($file, $destinationPath);

            // 保存された画像が存在するか確認
            if (file_exists($destinationPath)) {
                $response = $fileName;
            }

        } catch (\Exception $e) {
            Log::error('Image processing failed: ' . $e->getMessage());
            return false;
        }

        return $response;
    }

    static public function delete($path)
    {
        if (file_exists(storage_path($path))) {
            unlink(storage_path($path));
            return true;
        } else {
            Log::info('File does not exist: ' . $path);
        }
        return false;
    }
}