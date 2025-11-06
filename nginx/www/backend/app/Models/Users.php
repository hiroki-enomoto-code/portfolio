<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Users extends Model
{
    use HasFactory;

    protected $table = 'users';
    public $timestamps = true;

    /**
     * 更新可能なカラムのリスト
     */
    protected $fillable = [
        'name_ja',
        'birthday',
        'history',
    ];
}
