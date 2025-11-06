<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserMeta;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UserMetaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(null);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        if(!$user_id = Auth::id()) return response()->json(['error' => 'Unauthorized', 'message' => '認証エラー'], Response::HTTP_UNAUTHORIZED);

        $validatedData = $request->validate([
            'name' => 'required|string',
            'data' => 'required',
        ]);

        $userMeta = new UserMeta;
        $userMeta->user_id = $user_id;
        $userMeta->name = $validatedData['name'];
        $userMeta->data = $validatedData['data'];
        $userMeta->save();

        $response = UserMeta::where([
            ['user_id', $user_id],
            ['name', $userMeta->name],
        ])->first();
        return response()->json($response);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $name)
    {
        if(!$user_id = Auth::id()) return response()->json(['error' => 'Unauthorized', 'message' => '認証エラー'], Response::HTTP_UNAUTHORIZED);

        $response = UserMeta::where([
            ['user_id', $user_id],
            ['name', $name],
        ])->first();

        if($response){
            return response()->json($response);
        }

        return response(null);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $name)
    {
        if(!$user_id = Auth::id()) return response()->json(['error' => 'Unauthorized', 'message' => '認証エラー'], Response::HTTP_UNAUTHORIZED);

        $userMeta = UserMeta::where([
            ['user_id', $user_id],
            ['name', $name],
        ])->first();

        if($userMeta == null){
            $validatedData = $request->validate([
                'name' => 'required|string',
                'data' => 'required',
            ]);
            $userMeta = new UserMeta;
            $userMeta->user_id = $user_id;
            $userMeta->name = $name;
            $userMeta->data = $validatedData['data'];
            $userMeta->save();
        }else{
            $validatedData = $request->validate([
                'data' => 'required',
            ]);
            $userMeta->data = $validatedData['data'];
            $userMeta->save();
        }

        $response = UserMeta::where([
            ['user_id', $user_id],
            ['name', $name],
        ])->first();;
        return response()->json($response);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $UserMeta = UserMeta::find($id);
        $UserMeta->delete();
        return response()->json(true);
    }
}
