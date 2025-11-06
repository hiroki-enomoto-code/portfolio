<?php

namespace App\Http\Controllers\Auth;

use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Http\Controllers\SlackController;
use App\Models\User;
use App\Models\VerificationToken;
use App\Libs\StorageService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, SlackController $slackController)
    {

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
            'token' => 'required|string',
            'reset' => 'required|boolean',
        ]);

        $result = $this->doVerifyTokenAndEmail($request->email, $request->token, $request->reset ? 1 : 0);
        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 400);
        }

        // $slackUserDatas = StorageService::getJson('slack-user-info.json');

        // if(!isset($slackUserDatas) || !is_array($slackUserDatas)){
        //     return response()->json(['message' => 'Slackユーザーの情報が取得できませんでした。 管理者に報告お願いします'], 400);
        // }

        $slackUserData = $slackController->getUserInfo($request->email);
        if (!$slackUserData || !is_array($slackUserData)) {
            return response()->json(['message' => 'Slackユーザーの情報が取得できませんでした。 管理者に報告お願いします'], 400);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $slackUserData['name'],
            'value' => $slackUserData['value'],
            'name_ja' => $slackUserData['label'],
            'label' => $slackUserData['label'],
            'birthday' => '00-00',
            'history' => '0000-00-00',
            'team' => 9999,
        ]);

        if (!$user) {
            return response()->json(['message' => '登録に失敗しました'], 400);
        }

        event(new Registered($user));

        VerificationToken::where('token', $request->token)->delete();

        return response()->json($user);
    }

    private function doVerifyTokenAndEmail($email, $token, $reset)
    {
        $verification = VerificationToken::where('token', $token)
            ->where('expires_at', '>', Carbon::now())
            ->where('reset', $reset)
            ->where('email', $email)
            ->first();
        if (!$verification) {
            return ['success' => false, 'message' => 'トークンが無効です'];
        }

        return ['success' => true];
    }
}
