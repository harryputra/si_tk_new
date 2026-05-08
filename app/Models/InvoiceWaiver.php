<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceWaiver extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id', 'amount', 'reason', 'status', 
        'requested_by', 'approved_by', 'acknowledged_by'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function acknowledger()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
