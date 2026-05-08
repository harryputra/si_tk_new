<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // master data
            'view_students', 'manage_students',
            'view_teachers', 'manage_teachers',
            'view_accounts', 'manage_accounts',
            'view_tariffs', 'manage_tariffs',
            'view_rkas', 'manage_rkas',

            // inbound
            'view_invoices', 'manage_invoices',
            'view_payments', 'create_payments',
            'approve_payments',

            // outbound
            'view_outbound', 'create_outbound',
            'approve_outbound', 'disburse_outbound',

            // payroll
            'view_attendance', 'manage_attendance',
            'view_payroll', 'generate_payroll',
            'approve_payroll', 'pay_payroll',

            // reports
            'view_reports', 'export_reports',

            // admin
            'manage_users',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        $roles = [
            'super_admin' => $permissions,
            'bendahara' => [
                'view_students', 'view_teachers',
                'view_accounts', 'manage_accounts',
                'view_tariffs',
                'view_invoices', 'manage_invoices',
                'view_payments', 'create_payments', 'approve_payments',
                'view_outbound', 'approve_outbound', 'disburse_outbound',
                'view_payroll', 'pay_payroll',
                'view_reports', 'export_reports',
            ],
            'admin_hr' => [
                'view_students', 'manage_students',
                'view_teachers', 'manage_teachers',
                'view_invoices',
                'view_payments', 'create_payments',
                'view_attendance', 'manage_attendance',
                'view_payroll', 'generate_payroll',
                'view_reports',
            ],
            'kepala_sekolah' => [
                'view_students', 'view_teachers',
                'view_accounts',
                'view_invoices', 'view_payments',
                'view_outbound', 'create_outbound', 'approve_outbound',
                'view_attendance',
                'view_payroll', 'approve_payroll',
                'view_reports', 'export_reports',
            ],
            'yayasan' => [
                'view_students', 'view_teachers',
                'view_accounts',
                'view_invoices', 'view_payments',
                'view_outbound', 'approve_outbound',
                'view_payroll', 'approve_payroll',
                'view_reports', 'export_reports',
            ],
        ];

        foreach ($roles as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePerms);
        }
    }
}
