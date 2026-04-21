<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AuthController;

// 🔍 Rutas de diagnóstico (públicas, útiles para desarrollo)
Route::get('/check', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = "Conectada: " . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        $dbStatus = "Error: " . $e->getMessage();
    }
    return response()->json([
        'status' => 'success',
        'framework' => 'Laravel 12',
        'database' => $dbStatus,
        'php_version' => PHP_VERSION,
        'timestamp' => now()->toDateTimeString()
    ]);
});

// 🔐 Rutas públicas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 🔒 Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // 👤 Usuario actual
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // 📋 Tareas (solo el propietario puede gestionarlas)
    Route::apiResource('tasks', TaskController::class);

    // 🏷️ Categorías
    Route::get('categories', fn(Request $request) =>
        \App\Models\Category::all() // Todos ven las mismas categorías (globales)
    );

    Route::post('categories', fn(Request $request) =>
        \App\Models\Category::create(
            $request->validate([
                'name' => 'required|string|max:50',
                'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/'
            ])
        )
    );
});
