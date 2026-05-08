<?php

namespace App\Providers;

use App\Models\InboundPayment;
use App\Models\OutboundRequest;
use App\Models\Payroll;
use App\Observers\InboundPaymentObserver;
use App\Observers\OutboundRequestObserver;
use App\Observers\PayrollObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        InboundPayment::observe(InboundPaymentObserver::class);
        OutboundRequest::observe(OutboundRequestObserver::class);
        Payroll::observe(PayrollObserver::class);
    }
}
