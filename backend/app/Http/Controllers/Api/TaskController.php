<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        // 👇 Solo tareas del usuario autenticado
        $query = $request->user()->tasks()->with('category');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return TaskResource::collection($query->paginate(10));
    }

    public function store(StoreTaskRequest $request)
    {
        // 👇 Asocia la tarea al usuario autenticado automáticamente
        $task = $request->user()->tasks()->create($request->validated());
        return new TaskResource($task->load('category'));
    }

    public function show(Task $task)
    {
        return new TaskResource($task->load('category'));
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        // 👇 Seguridad: solo el dueño puede editar
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $task->update($request->validated());
        return new TaskResource($task->load('category'));
    }

    public function destroy(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $task->delete();
        return response()->json(['message' => 'Tarea eliminada'], 200);
    }
}
