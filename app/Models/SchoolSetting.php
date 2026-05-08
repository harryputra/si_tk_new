<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    protected $fillable = [
        'nama_sekolah',
        'alamat',
        'telepon',
        'email',
        'website',
        'nama_kepala_sekolah',
        'nip_kepala_sekolah',
        'logo',
    ];
}
