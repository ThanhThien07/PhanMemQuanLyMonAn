<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NhaCungCap extends Model
{
    protected $table = 'nha_cung_cap';

    protected $fillable = [
        'ten',
        'sdt',
        'dia_chi',
    ];
}
