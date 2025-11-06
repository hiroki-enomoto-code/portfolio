<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Beat extends Model
{
    use HasFactory;

    protected $table = 'beat_tbl';
    public $timestamps = true;

    protected $casts = [
        'reaction' => 'array',
    ];

    /**
     * 更新可能なカラムのリスト
     */
    protected $fillable = [
        'content',
        'attachment',
    ];

    /**
     * デフォルト値の設定
     */
    protected $attributes = [
        'status' => 1,
        'comments' => 0,
        'attachment' => '',
    ];

    /**
     * クイズの内容をjsonで取得
     */
    protected function attachment(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => !empty($value) ? explode(',', $value) : [],
            set: fn ($value) => !empty($value) ? implode(',', $value) : [],
        );
    }
}
