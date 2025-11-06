<?php

namespace App\Http\Controllers;

use App\Models\Emoji;
use App\Libs\EmojiManager;
use Illuminate\Http\Request;

class EmojiController extends Controller
{
    public function get(Request $request)
    {
        $response = [];
        $json = EmojiManager::get();

        foreach ($json as $value) {
            $response[$value['id']] = $value;
        }

        return response()->json($response, 200);
    }

    public function setJson(Request $request)
    {
        $emojiList = Emoji::all();
        $response['emoji'] = EmojiManager::generateEmojiJson($emojiList);
    }

    public function db(Request $request)
    {

        $emojiList = EmojiManager::get();
        foreach ($emojiList as $emoji) {
            Emoji::create([
                'name' => $emoji['name'],
                'folder' => $emoji['folder'],
                'user' => 'admin',
            ]);
        }
        return response()->json([
            'message' => 'Emoji data has been saved to the database.',
        ], 200);
    }

    public function setJsonToDb(Request $request)
    {
        $response = [
            'emoji' => [],
        ];

        $response['emoji'] = EmojiManager::generateEmojiJsonToDB();
        return response()->json($response, 200);
    }
}
