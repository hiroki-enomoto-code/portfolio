<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SlackController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\BeatController;
use App\Http\Controllers\EmojiController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CongratulationController;

// 認証が必要なユーザー情報取得
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// 認証が不要なルート
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/password/reset', [AuthController::class, 'updatePassword']);

// ヘルスチェック
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// ログインユーザーのみ
Route::middleware(['auth.custom'])->group(function () {

    // ユーザー情報
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    Route::get('/users', [UsersController::class, 'getAll']);

    // クイズ関連
    Route::prefix('quiz')->group(function () {
        Route::get('/', [QuizController::class, 'getAll']);
        Route::post('/', [QuizController::class, 'create']);

        Route::prefix('edit')->group(function () {
            Route::get('/', [QuizController::class, 'getEditAll']);
            Route::get('/{id}', [QuizController::class, 'getEditData']);
            Route::put('/{id}', [QuizController::class, 'updateEdit']);
            Route::delete('/{id}', [QuizController::class, 'delete']);
        });

        Route::prefix('attempt')->group(function () {
            Route::get('/', [QuizController::class, 'myAttempts']);
            Route::get('/{id}', [QuizController::class, 'getAttempt']);
        });

        Route::post('/result/{id}', [QuizController::class, 'result']);
        Route::get('/{id}', [QuizController::class, 'get']);
    });

    // ビート関連
    Route::prefix('beat')->group(function () {
        Route::get('/', [BeatController::class, 'getAll']);
        Route::post('/', [BeatController::class, 'create']);
        Route::delete('/{id}', [BeatController::class, 'delete']);
        Route::get('/reply/{id}', [BeatController::class, 'getReplyAll']);
        Route::post('/reaction/{item_id}', [BeatController::class, 'reaction']);
    });

    // 絵文字関連
    Route::prefix('emoji')->group(function () {
        Route::get('/', [EmojiController::class, 'get']);
        Route::get('/json', [EmojiController::class, 'setJson']);
        Route::get('/jsondb', [EmojiController::class, 'setJsonToDb']);
        Route::get('/db', [EmojiController::class, 'db']);
    });

    // 誕生日
    Route::get('/birthday', [CongratulationController::class, 'birthday']);
});

Route::get('/public/quiz', [QuizController::class, 'quizPublic']);

// 管理者用（認証 + 管理者権限チェック）
Route::prefix('admin')->middleware(['auth.custom', 'admin.auth'])->group(function () {
    Route::get('/users', [UsersController::class, 'getAdminUserAll']);
    Route::post('/user/register', [UsersController::class, 'adminUserRegister']);
    Route::put('/user/{id}', [UsersController::class, 'updateAdminUser']);
    Route::delete('/user/{id}', [UsersController::class, 'deleteAdminUser']);
    Route::post('/user/slack', [UsersController::class, 'getSlackUserData']);
});

// テスト関連
Route::prefix('test')->group(function () {
    Route::get('/send-mail', [TestController::class, 'semdMail']);
    Route::get('/storage', [TestController::class, 'storage']);
    Route::get('/slack', [SlackController::class, 'sendRichTestMessage']);
    Route::get('/dwl', [TestController::class, 'downloadCsv']);
    Route::get('/users', [TestController::class, 'downloadusers']);
    Route::get('/redis', [TestController::class, 'redisConnect']);
});
