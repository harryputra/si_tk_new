<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = ExpenseCategory::latest()->get();

        return Inertia::render('MasterData/ExpenseCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:expense_categories',
            'description' => 'nullable|string',
        ]);

        ExpenseCategory::create($validated);

        return redirect()->route('kategori-biaya.index')
            ->with('success', 'Kategori biaya berhasil ditambahkan.');
    }

    public function update(Request $request, ExpenseCategory $kategoriBiaya): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:expense_categories,code,' . $kategoriBiaya->id,
            'description' => 'nullable|string',
        ]);

        $kategoriBiaya->update($validated);

        return redirect()->route('kategori-biaya.index')
            ->with('success', 'Kategori biaya berhasil diperbarui.');
    }

    public function destroy(ExpenseCategory $kategoriBiaya): RedirectResponse
    {
        $kategoriBiaya->delete();

        return redirect()->route('kategori-biaya.index')
            ->with('success', 'Kategori biaya berhasil dihapus.');
    }
}
