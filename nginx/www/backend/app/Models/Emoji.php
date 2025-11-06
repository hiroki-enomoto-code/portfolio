<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Emoji extends Model
{
    use HasFactory;

    protected $table = 'emoji_tbl';
    public $timestamps = false;

    protected $fillable = [
        'user',
        'folder',
        'name'
    ];

    /**
     * デフォルト値の設定
     */
    protected $attributes = [
        'folder' => 'custom',
        'user' => 'admin',
    ];
}
