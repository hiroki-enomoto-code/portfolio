<?php

namespace App\Libs\Quiz;

use Illuminate\Support\Facades\Log;
use App\Libs\ImageProcessingService;

class QuizManager
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

    static public function updateQuizImage($quiz, $validated)
    {
        $thumbnailName = 'thumbnail';
        
        $questions = json_decode($validated['questions'], true);
        $response = [
            'isUpload' => false,
            $thumbnailName => '',
            'questions' => $questions,
        ];

        $thumbnail_name = $validated['thumbnail_name'];

        $beforeQuestions = json_decode($quiz->questions, true);
        $beforeThumbnail = $quiz->thumbnail;

        $request = request();

        // サムネイルが削除された場合はファイルを削除
        if(!empty($beforeThumbnail) && !$thumbnail_name) {
            $path = 'app/public/quiz/'. $quiz->id . '/' . $beforeThumbnail;
            if (file_exists(storage_path($path))) {
                unlink(storage_path($path));
                $response[$thumbnailName] = '';
            }
        }else if(!empty($beforeThumbnail)){
            $response[$thumbnailName] = $beforeThumbnail;
        }

        if ($request->hasFile($thumbnailName)) {
            $file = $request->file($thumbnailName);
            $filename = self::uploadQuizImage($file, 'app/public/quiz/'. $quiz->id, $thumbnailName);

            if($filename) {            
                $response[$thumbnailName] = $filename;
                if($response['isUpload'] === false) {
                    $response['isUpload'] = true;
                }
            }
        }
    
        $deleteItems = self::findMissingItems($beforeQuestions, $questions);
        //var_dump($deleteItems);
        foreach($deleteItems as $deleteItem) {
            if(!empty( $deleteItem['image'])){
                $path = 'app/public/quiz/'. $quiz->id . '/' . $deleteItem['image'];
                if (file_exists(storage_path($path))) {
                    unlink(storage_path($path));
                }
            }
        }

        foreach($response['questions'] as $key => $question) {

            if(
                !$question['image'] && isset($beforeQuestions[$key]) && !empty($beforeQuestions[$key]['image'])
            ) {
                $path = 'app/public/quiz/'. $quiz->id . '/' . $beforeQuestions[$key]['image'];
                if (file_exists(storage_path($path))) {
                    unlink(storage_path($path));
                }
            }

            if (!$request->hasFile($question['id'])) {
                $question['image'] = '';
                continue;
            }

            if(isset($beforeQuestions[$key]) && !empty($beforeQuestions[$key]['image'])){
                $path = 'app/public/quiz/'. $quiz->id . '/' . $beforeQuestions[$key]['image'];
                if (file_exists(storage_path($path))) {
                    unlink(storage_path($path));
                }
            }

            $file = $request->file($question['id']);
            $filename = self::uploadQuizImage($file, 'app/public/quiz/'. $quiz->id, $question['id']);

            $response['questions'][$key]['image'] = $filename;

            if($response['isUpload'] === false) {
                $response['isUpload'] = true;
            }
        }

        return $response;
    }

    static public function questionImageUpload($id, $questions)
    {

        $thumbnailName = 'thumbnail';

        $request = request();

        $response = [
            'isUpload' => false,
            $thumbnailName => null,
            'questions' => $questions,
        ];

        if ($request->hasFile($thumbnailName)) {
            $file = $request->file($thumbnailName);
            $filename = self::uploadQuizImage($file, 'app/public/quiz/'. $id, $thumbnailName);

            if($filename) {            
                $response[$thumbnailName] = $filename;    
                if($response['isUpload'] === false) {
                    $response['isUpload'] = true;
                }
            }
        }

        foreach($response['questions'] as $key => $question) {
            if (!$request->hasFile($question['id'])) {
                $question['image'] = '';
                continue;
            }

            $file = $request->file($question['id']);
            $filename = self::uploadQuizImage($file, 'app/public/quiz/'. $id, $question['id']);

            $response['questions'][$key]['image'] = $filename;

            if($response['isUpload'] === false) {
                $response['isUpload'] = true;
            }
        }

        return $response;
    }

    static private function uploadQuizImage($file, $path, $name)
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


        // $result = $file->move(storage_path($path), $fileName);

        // if ($result && file_exists($result->getPathname())) {
        //     $response = $fileName;
        // }

        return $response;
    }

    static private function findMissingItems($beforeArray, $currentArray) {
        $currentIds = array_column($currentArray, 'id');
        return array_filter($beforeArray, function($item) use ($currentIds) {
            return !in_array($item['id'], $currentIds);
        });
    }
}