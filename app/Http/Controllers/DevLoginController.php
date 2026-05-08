<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class DevLoginController extends Controller
{
    public function show(): Response
    {
        // Only allow in local environment
        if (!app()->isLocal()) {
            abort(404);
        }

        $roles = Role::all()->map(function ($role) {
            $user = User::role($role->name)->first();
            return [
                'name' => $role->name,
                'user_email' => $user?->email,
                'user_name' => $user?->name,
                'password' => 'password', // Default password for all seeded users
            ];
        });

        return Inertia::render('Auth/DevLogin', [
            'roles' => $roles,
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        if (!app()->isLocal()) {
            abort(404);
        }

        $credentials = $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->route('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }
}
