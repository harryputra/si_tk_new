<?php

namespace App\Observers;

use App\Models\OutboundRequest;
use Illuminate\Support\Facades\DB;

class OutboundRequestObserver
{
    public function updated(OutboundRequest $request): void
    {
        if ($request->isDirty('status_approval') && $request->status_approval === 'disbursed') {
            DB::transaction(function () use ($request) {
                $account = $request->account()->lockForUpdate()->first();
                $account->decrement('saldo', $request->nominal);

                if ($request->rkas_id) {
                    $rkas = $request->rkasBudget()->lockForUpdate()->first();
                    $rkas->increment('terpakai', $request->nominal);
                }
            });
        }
    }
}
