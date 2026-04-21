<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/check', function () {
    try {
        // Verificamos la conexión a MySQL
        DB::connection()->getPdo();
        $dbStatus = "Conectada: " . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        $dbStatus = "Error de conexión: " . $e->getMessage();
    }

    return response()->json([
        'status' => 'success',
        'framework' => 'Laravel 12',
        'database' => $dbStatus,
        'php_version' => PHP_VERSION,
        'timestamp' => now()->toDateTimeString()
    ]);
});
