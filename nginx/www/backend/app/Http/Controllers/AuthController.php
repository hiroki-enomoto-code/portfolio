<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\VerificationToken;
use App\Libs\StorageService;
use App\Libs\FileManager;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'reset' => 'required|boolean',
        ]);

        if (!$this->isAllowedEmail($request->email)) {
            return response()->json(['message' => '無効なメールアドレスです。'], 400);
        }

        $token = Str::random(64);
        VerificationToken::updateOrCreate(
            ['email' => $request->email],
            [
                'token' => $token,
                'reset' => $request->reset ? 1 : 0,
                'expires_at' => now()->addHours(24),
            ]
        );

        if ($request->reset) {
            $verificationUrl = config('app.frontend_url') . "/reset-password/?tk={$token}";
            Mail::send('emails.password_reset_mail', ['url' => $verificationUrl], function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('パスワードのリセット');
            });
        } else {

            $user = User::where('email', $request->email)->first();
            if ($user) {
                return response()->json(['message' => 'アカウントが存在します'], 400);
            }

            $verificationUrl = config('app.frontend_url') . "/register/?tk={$token}";
            Mail::send('emails.verification', ['url' => $verificationUrl], function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('メールアドレスの確認');
            });
        }

        return response()->json(['message' => '確認メールを送信しました。']);
    }

    private function doVerifyTokenAndEmail($email, $token, $reset)
    {
        $verification = VerificationToken::where('token', $token)
            ->where('expires_at', '>', Carbon::now())
            ->where('reset', $reset)
            ->first();
        if (!$verification) {
            return ['success' => false, 'message' => 'トークンが無効です'];
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return ['success' => false, 'message' => 'ユーザーが存在しません'];
        }

        return ['success' => true];
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'reset' => 'required|boolean',
        ]);

        $result = $this->doVerifyTokenAndEmail($request->email, $request->token, $request->reset ? 1 : 0);
        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        VerificationToken::where('token', $request->token)->delete();

        return response()->json(['message' => 'Password updated.']);
    }

    public function updateProfile(Request $request)
    {

        $userId = auth()->id();

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'ユーザーが存在しません'], 401);
        }

        $validated = $request->validate([
            'nickname' => 'string|max:50|nullable',
            'birthday' => 'string|nullable',
            'mbti' => 'string|nullable',
        ]);

        $user->nickname = $validated['nickname'] ?? $user->nickname;
        $user->birthday = $validated['birthday'] ?? $user->birthday;
        $user->mbti = $validated['mbti'] ?? $user->mbti;

        if($request->hasFile('avatar')){
            $file = $request->file('avatar');
            $mime = $file->getClientMimeType();

            $name = '';
            if($user->avatar && $user->avatar !== 'default.png'){
                $fileInfo = pathinfo($user->avatar);
                $name = $fileInfo['filename'];
                $extension = $fileInfo['extension'];

                if($extension !== $mime){
                    $isDelete = FileManager::delete('app/public/avatar/' . $user->avatar);

                    if($isDelete){
                        $user->avatar = null;
                    }
                }
            }else{
                $name = bin2hex(random_bytes(32 / 2));
            }

            $response = FileManager::upload($file, 'app/public/avatar/', $name);

            if ($response) {
                $user->avatar = $response;
            }
        }else if(!$user->avatar){
            $user->avatar = 'default.png';
        }

        $user->save();

        return response()->json($user, 200);
    }

    private function isAllowedEmail($email)
    {
        $allowedaddress = StorageService::getJson('slack-mails.json');

        if(!isset($allowedaddress) || !is_array($allowedaddress) || count($allowedaddress) === 0){
            return false;
        }

        return in_array($email, $allowedaddress);
    }
}
