<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use App\Models\QuizResult;

class Quiz extends Model
{
    use HasFactory;

    protected $table = 'quiz_tbl';
    public $timestamps = true;

    /**
     * 更新可能なカラムのリスト
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'question_count',
    ];

    /**
     * デフォルト値の設定
     */
    protected $attributes = [
        'status' => 1,
        'thumbnail' => '',
        'description' => '',
        'count' => 0
    ];

    public function quizResult()
    {
        return $this->hasMany(QuizResult::class);
    }

    /**
     * クイズの内容をjsonで取得
     */
    protected function questions(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => json_decode($value),
            //set: fn ($value) => !empty($value) ? implode(',', $value) : "",
        );
    }
}
