<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('verification_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token')->unique();
            $table->timestamp('expires_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('verification_tokens');
    }
};
