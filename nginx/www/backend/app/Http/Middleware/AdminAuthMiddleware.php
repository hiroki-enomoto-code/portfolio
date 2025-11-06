<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();
        
        if ($user->auth < 3) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        return $next($request);
    }
}