<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class ReportCategory extends Model
{
    use HasFactory;
    protected $table = 'report_category_tbl';
    public $timestamps = false;

    protected function parent(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => !empty($value) ? explode(',', $value) : [],
            set: fn ($value) => !empty($value) ? implode(',', $value) : "",
        );
    }
}
