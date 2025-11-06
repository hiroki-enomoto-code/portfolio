<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;    // DBファサード
use Illuminate\Support\Facades\Log;   // Logファサード
use App\Models\Quiz;
use App\Models\QuizResult;
use App\Libs\Quiz\QuizManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuizController extends Controller
{
    /**
     * クイズ一覧取得
     */
    public function getAll(Request $request)
    {
        $params = [
            'page' => $request->input('page', 1),
            'per_page' => $request->input('per_page', 10),
            'orderby' => $request->input('orderby', 'created_at'),
            'order' => $request->input('order', 'desc'),
        ];

        $columns = [
            'id',
            'title',
            'description',
            'thumbnail',
            'status',
            'count',
            'question_count',
            'avg_score',
            'create_user',
            'created_at',
            'updated_at'
        ];

        $total = Quiz::count();
        $quiz = Quiz::select($columns)
            ->where('status', 2)
            ->orderBy($params['orderby'], $params['order'])
            ->paginate($params['per_page'], [], 'page', $params['page']);

        return response()->json([
            'data' => $quiz->items(),
            'total' => $total,
            'current_page' => $quiz->currentPage(),
            'per_page' => $quiz->perPage(),
            'last_page' => $quiz->lastPage(),
        ], 200);
    }

    /**
     * IDでクイズの取得
     */
    public function get(Request $request, string $id)
    {
        $columns = [
            'id',
            'title',
            'description',
            'thumbnail',
            'status',
            'count',
            'questions',
            'question_count',
            'avg_score',
            'create_user',
            'created_at',
            'updated_at'
        ];

        $preview = $request->get('preview');

        $query = Quiz::select($columns);

        if ($preview && $preview == 1) {

            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $query->where('create_user', $userId);

        } else {
            $query->where('status', 2);
        }
        $quiz = $query->find($id);

        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 401);
        }

        return response()->json($quiz, 200);
    }

    /**
     * クイズ一覧取得
     */
    public function getEditAll(Request $request)
    {
        $userId = auth()->id();

        $params = [
            'page' => $request->input('page', 1),
            'per_page' => $request->input('per_page', 20),
            'orderby' => $request->input('orderby', 'created_at'),
            'order' => $request->input('order', 'desc'),
        ];

        $columns = [
            'id',
            'title',
            'question_count',
            'count',
            'avg_score',
            'status',
            'created_at',
            'updated_at'
        ];

        $total = Quiz::where('create_user', $userId)->count();
        $quiz = Quiz::select($columns)->where('create_user', $userId)->orderBy($params['orderby'], $params['order'])->paginate($params['per_page'], [], 'page', $params['page']);

        return response()->json([
            'data' => $quiz->items(),
            'total' => $total,
            'current_page' => $quiz->currentPage(),
            'per_page' => $quiz->perPage(),
            'last_page' => $quiz->lastPage(),
        ], 200);
    }

    /**
     * IDでクイズの取得
     */
    public function getEditData(Request $request, string $id)
    {
        $userId = auth()->id();

        $quiz = Quiz::where('id', $id)->where('create_user', $userId)->first();

        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 401);
        }

        return response()->json($quiz, 200);
    }

    /**
     * IDでクイズの更新
     */
    public function updateEdit(Request $request, string $id)
    {
        $userId = auth()->id();

        $quiz = Quiz::where('id', $id)->where('create_user', $userId)->first();

        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 401);
        }

        $validated = $request->validate([
            'title' => 'required',
            'questions' => 'required',
            'answer' => 'required',
            'question_count' => 'required|integer',
            'description' => 'nullable|string',
            'thumbnail_name' => 'nullable|string',
            'status' => 'required',
        ]);

        $uploadResponse = QuizManager::updateQuizImage($quiz, $validated);

        $quiz->thumbnail = $uploadResponse['thumbnail'];
        $quiz->questions = $uploadResponse['questions'];
        $quiz->answer = json_decode($validated['answer'], true);

        foreach ($quiz->getFillable() as $column) {
            if (isset($validated[$column])) {
                $quiz->{$column} = $validated[$column];
            }
        }
        $quiz->save();

        return response()->json($quiz, 200);
    }

    /**
     * クイズ作成
     */
    public function create(Request $request)
    {

        $response = '';
        $userId = auth()->id();

        $validated = $request->validate([
            'title' => 'required',
            'questions' => 'required',
            'answer' => 'required',
            'question_count' => 'required|integer',
            'description' => 'nullable|string',
            'status' => 'required',
        ]);

        $questions = json_decode($validated['questions'], true);
        $answer = json_decode($validated['answer'], true);

        $quiz = new Quiz;
        $quiz->title = $validated['title'];
        $quiz->questions = $validated['questions'];
        $quiz->answer = $validated['answer'];
        $quiz->question_count = $validated['question_count'];
        $quiz->description = $validated['description'] ?? '';
        $quiz->status = $validated['status'];
        $quiz->create_user = $userId;
        $quiz->thumbnail = '';
        $quiz->save();

        $response = $quiz;

        $uploadResponse = QuizManager::questionImageUpload($quiz->id, $questions);

        if ($uploadResponse['isUpload']) {

            $updateQuiz = Quiz::find($quiz->id);

            if ($uploadResponse['thumbnail']) {
                $updateQuiz->thumbnail = $uploadResponse['thumbnail'];
            }

            $updateQuiz->questions = $uploadResponse['questions'];
            $updateQuiz->save();

            $response = $updateQuiz;
        }

        return response()->json($response, 200);
    }

    /**
     * クイズ削除
     */
    public function delete(Request $request, string $id)
    {
        $userId = auth()->id();

        $quiz = Quiz::where('id', $id)->where('create_user', $userId)->first();

        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 401);
        }

        $path = '/public/quiz/' . $id;
        if (Storage::exists($path)) {
            Storage::deleteDirectory($path);
        }
        
        $quiz->delete();
        QuizResult::where('quiz_id', $id)->delete();

        return response()->json(true, 200);
    }

    /**
     * クイズ結果
     */
    public function result(Request $request, string $id)
    {
        $userId = auth()->id();

        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 401);
        }

        $validated = $request->validate([
            'result' => 'required',
        ]);

        $answer = json_decode($quiz->answer, true);
        $questions = json_decode($quiz->questions, true);

        $result = $validated['result'];
        $answer_count = 0;
        $question_count	 = 0;
        $answer_q = [];
        $rank = 0;
        foreach ($questions as $q) {
            $question_count++;

            $_answer = $answer[$q['id']];
            $_result = $result[$q['id']];

            $isCollect = false;
            $__result = '';
            $__answer = '';
            if(
                isset($q['type']) &&
                $q['type'] == 'input' &&
                is_array($_answer)
            ) {
                $answer_array = array_values($_answer);
                if(in_array($_result, $answer_array)) {
                    $answer_count++;
                    $isCollect = true;
                }
                $__result = $_result;
                $__answer = implode(',', $answer_array);
            }else{
                $options = [];
                foreach ($q['options'] as $option) {
                    $options[$option['id']] = $option['text'];
                }

                if ($_answer == $_result) {
                    $answer_count++;
                    $isCollect = true;
                }
                $__result = $options[$_result] ?? '';
                $__answer = $options[$_answer] ?? '';
            }

            $answer_q[] = [
                'question' => $q['question'],
                'answer' => $__answer,
                'result' => $__result,
                'isCollect' => $isCollect,
            ];
        }

        if($userId != $quiz->create_user) {
            $percentage = round(($answer_count / $question_count) * 100);
            $first_attempt = QuizResult::where('quiz_id', $quiz->id)->where('user_id', $userId)->first();
    
            $quizResult = new QuizResult;
            $quizResult->quiz_id = $quiz->id;
            $quizResult->user_id = $userId;
            $quizResult->score = $percentage;
            $quizResult->answer_count = $answer_count;
            $quizResult->question_count = $question_count;
            $quizResult->is_first_attempt = $first_attempt ? 0 : 1;
            $quizResult->snapshot = $answer_q;
            $quizResult->save();
    
            //Quizのcountを更新
            $total_score = $quiz->avg_score * $quiz->count;
            $total_score = $total_score + $percentage;
            $quiz->avg_score = round($total_score / ($quiz->count + 1));
            $quiz->count = $quiz->count + 1;
            $quiz->save();
    
            //Quizの順位を取得
            $rank = QuizResult::where('quiz_id', $quiz->id)->where('score', '>', $percentage)->count() + 1;
        }

        $response = [
            'answer_count' => $answer_count,
            'question_count' => $question_count,
            'answer' => $answer_q,
            'rank' => $rank,
            'total' => $quiz->count,
        ];

        return response()->json($response, 200);
    }

    /**
     * クイズ結果取得
     */
    public function getAttempt(Request $request, string $id)
    {   
        $columns = [
            'id',
            'title',
            'description',
            'thumbnail',
            'status',
            'count',
            'question_count',
            'avg_score',
            'create_user',
            'created_at',
            'updated_at'
        ];
        $quiz = Quiz::select($columns)->where('status', 2)->find($id);
        if (!$quiz) {
            return response()->json(['message' => 'Quiz not found'], 401);
        }

        $columns = [
            'id',
            'quiz_id',
            'user_id',
            'score',
            'answer_count',
            'question_count',
            'is_first_attempt',
            'created_at',
        ];
        $quizResults = QuizResult::select($columns)
            ->where('quiz_id', $id)
            ->whereNot('user_id', $quiz->create_user)
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        if (!$quizResults) {
            return response()->json(['message' => 'QuizResults not found'], 401);
        }

        return response()->json([
            'quiz' => $quiz,
            'results' => $quizResults,
        ], 200);
    }

    /**
     * 自分のクイズ結果一覧取得
     */
    public function myAttempts(Request $request)
    {
        $userId = auth()->id();

        $quizResults = QuizResult::with('quiz:id,title')->where('user_id', $userId)->orderBy('created_at', 'asc')->get();

        return response()->json($quizResults, 200);
    }

    public function quizPublic(Request $request)
    {
        $columns = [
            'id',
            'title',
            'thumbnail',
            'count',
            'question_count',
            'avg_score',
        ];

        $quiz = Quiz::select($columns)->where('status', 2)
            ->orderBy('created_at', 'desc')->get();

        return response()->json($quiz, 200);
    }
}
