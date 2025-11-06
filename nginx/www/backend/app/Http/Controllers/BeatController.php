<?php

namespace App\Http\Controllers;

use App\Models\Beat;
use App\Libs\Beat\BeatManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BeatController extends Controller
{

    private $public_columns = [
        'id',
        'content',
        'attachment',
        'user_id',
        'comments',
        'reaction',
        'reply',
        'status',
        'is_private',
        'created_at',
        'updated_at',
    ];

    /**
     * ビート一覧取得
     */
    public function getAll(Request $request)
    {
        $params = [
            'last_id' => $request->input('last_id', 0),
            'per_page' => $request->input('per_page', 10),
        ];

        $query = Beat::select($this->public_columns)
            ->whereNull('reply')
            ->where('status', 1);

        if (!empty($params['last_id']) && $params['last_id'] > 0) {
            $query->where('id', '<', $params['last_id']);
        }

        $beats = $query->orderBy('id', 'desc')
                ->limit($params['per_page'])
        ->get();

        $currentMinId = $beats->min('id');

        $smallestId = Beat::whereNull('reply')
            ->where('status', 1)
            ->min('id');

        $isMore = ($currentMinId != $smallestId);

        return response()->json([
            'data' => $beats,
            'more' => $isMore,
        ], 200);
    }

    public function getReplyAll(Request $request, string $replyId)
    {
        $params = [
            'last_id' => $request->input('last_id', 0),
            'per_page' => $request->input('per_page', 10),
        ];

        $query = Beat::select($this->public_columns)->where('status', 1);

        if (!empty($params['last_id']) && $params['last_id'] > 0) {
            $query->where('id', '<', $params['last_id'])
                ->where('reply', $replyId);
        }else{
            $query->where(function($_query) use ($replyId) {
                $_query->where('id', $replyId)
                    ->orWhere('reply', $replyId);
                })->orderByRaw("CASE WHEN id = ? THEN 0 ELSE 1 END", [$replyId]);
        }

        $beats = $query->orderBy('id', 'desc')->limit($params['per_page'])->get();

        $currentMinId = $beats->filter(function ($item) use ($replyId) {
            return $item->id != $replyId;
        })->min('id');

        $smallestId = Beat::where('reply', $replyId)->where('status', 1)->min('id');

        $isMore = ($currentMinId != $smallestId);

        return response()->json([
            'data' => $beats,
            'more' => $isMore,
        ], 200);
    }

    /**
     * ビート作成
     */
    public function create(Request $request)
    {
        $response = '';
        $userId = auth()->id();

        $validated = $request->validate([
            'content' => 'required',
            'reply' => 'integer|nullable',
        ]);

        $replyId = $request->input('reply', null);

        $beat = new Beat;
        $beat->content = $validated['content'];
        $beat->user_id = $userId;
        $beat->reply = $replyId ? (int)$replyId : null;
        $beat->save();
        $response = $beat;

        if($replyId){
            $this->countComments($replyId);
        }

        // 画像のアップロード
        if($request->hasFile('file')){
            $files = $request->file('file');
            $uploadResponse = BeatManager::ImageUpload($beat->id, $files);
            if ($uploadResponse['isUpload']) {
    
                $updateBeat = Beat::find($beat->id);
    
                if (!empty($uploadResponse['attachment'])) {
                    $updateBeat->attachment = $uploadResponse['attachment'];
                }
                $updateBeat->save();
    
                $response = $updateBeat;
            }
        }

        return response()->json($response, 200);
    }

    /**
     * ビート削除
     */
    public function delete(Request $request, string $id)
    {
        $userId = auth()->id();

        $beat = Beat::where('id', $id)->where('user_id', $userId)->first();
        if (!$beat) {
            return response()->json(['message' => 'Beat not found'], 401);
        }

        // 画像の削除
        if ($beat->attachment) {
            BeatManager::folderDelete($beat->id);
        }

        $beat->delete();

        return response()->json(['message' => 'Beat deleted successfully'], 200);
    }

    public function reaction(Request $request, string $item_id)
    {
        $userId = auth()->id();

        $validated = $request->validate([
            'emoji_id' => 'required|integer',
        ]);

        $beat = Beat::find($item_id);
        if (!$beat) {
            return response()->json(['message' => 'Beat not found'], 404);
        }

        $reaction = $beat->reaction;

        if($reaction){
            if(isset($reaction[$validated['emoji_id']]) && is_array($reaction[$validated['emoji_id']])){
                if(in_array($userId, $reaction[$validated['emoji_id']])){
                    $key = array_search($userId, $reaction[$validated['emoji_id']]);
                    unset($reaction[$validated['emoji_id']][$key]);
                }else{
                    $reaction[$validated['emoji_id']][] = $userId;
                }
            }else{
                $reaction[$validated['emoji_id']] = [$userId];
            }
        }else{
            $reaction[$validated['emoji_id']] = [$userId];
        }
        $beat->reaction = $reaction;
        $beat->save();
        return response()->json($beat, 200);
    }

    private function countComments($id)
    {
        Beat::where('id', $id)->increment('comments');
    }
}
