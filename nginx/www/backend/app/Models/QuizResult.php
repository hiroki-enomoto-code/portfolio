<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use App\Models\Quiz;

class QuizResult extends Model
{
    use HasFactory;

    protected $table = 'quiz_result_tbl';
    public $timestamps = false;

    protected $casts = [
        'snapshot' => 'array',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');        
    }
}
