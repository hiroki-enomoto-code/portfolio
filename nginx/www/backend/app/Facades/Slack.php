<?php

namespace App\Facades;

use App\Libs\SlackUtils;
use Illuminate\Support\Facades\Facade;

class Slack extends Facade
{
    protected static function getFacadeAccessor()
    {
        return SlackUtils::class;
    }
}