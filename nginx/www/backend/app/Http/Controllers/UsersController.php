<?php

namespace App\Http\Controllers;

use App\Models\Users;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\SlackController;

use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{

    private $public_columns = ['id', 'mbti', 'name_ja', 'nickname', 'avatar', 'birthday', 'history', 'auth'];

    /**
     * Display a listing of the resource.
     */
    public function getAll()
    {
        return Users::select($this->public_columns)
            ->whereNotNull('nickname')
            ->where('nickname', '!=', '')
            ->where('status', 0)
            ->get()
            ->keyBy('id')
            ->toArray();
    }

    public function getAdminUserAll()
    {
        $users = Users::select(['id', 'name_ja', 'nickname', 'avatar', 'birthday', 'history', 'team', 'nickname', 'auth', 'value', 'email', 'created_at'])->where('status', 0)->get();

        return response()->json($users);
    }

    public function updateAdminUser(Request $request, $id)
    {
        $validated = $request->validate([
            'name_ja' => 'required',
            'birthday' => 'required|regex:/^\d{2}-\d{2}$/',
            'history' => 'required|regex:/^\d{4}-\d{2}-\d{2}$/',
        ]);

        $updateUser = Users::find($id);
        if (!$updateUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $updateUser->update($validated);

        return response()->json($updateUser);
    }

    public function getSlackUserData(Request $request, SlackController $slackController)
    {
        $email = $request->input('email');
        if (!$email) {
            return response()->json(['message' => 'Email is required'], 400);
        }

        $slackUserData = $slackController->getUserInfo($email);
        if (!$slackUserData || !is_array($slackUserData)) {
            return response()->json(['message' => 'Slackユーザーの情報が取得できませんでした。 管理者に報告お願いします'], 400);
        }

        $user = [
            'name' => $slackUserData['name'],
            'value' => $slackUserData['value'],
            'name_ja' => $slackUserData['label'],
            'label' => $slackUserData['label'],
        ];

        return response()->json($user);
    }

    public function adminUserRegister(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => ['required', 'string', 'min:8'],
            'name_ja' => 'required|string|max:255',
            'birthday' => 'required|regex:/^\d{2}-\d{2}$/',
            'history' => 'required|regex:/^\d{4}-\d{2}-\d{2}$/',
            'value' => 'required|string|max:255',
            'label' => 'required|string|max:255',
        ]);

        $checkUser = User::where('email', $validated['email'])->first();
        if ($checkUser) {
            return response()->json(['message' => 'アカウントが存在します'], 400);
        }

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'name' => $validated['email'],
            'value' => $validated['value'],
            'name_ja' => $validated['name_ja'],
            'label' => $validated['label'],
            'birthday' => $validated['birthday'],
            'history' => $validated['history'],
            'team' => 9999,
        ]);

        if (!$user) {
            return response()->json(['message' => '登録に失敗しました'], 400);
        }

        return response()->json(['message' => '登録が完了しました', 'user' => $user], 200);
    }

    public function deleteAdminUser($id)
    {

        $deleteUser = Users::find($id);
        if (!$deleteUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $deleteUser->status = 2;
        $deleteUser->save();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
