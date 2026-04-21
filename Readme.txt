📋 Demo Laravel + Vue (TypeScript)
Gestor de tareas multi-usuario con autenticación, categorías y CRUD completo.

🛠️ Tech Stack
Backend
Laravel 12 + Sanctum + MySQL
Frontend
Vue 3 + TypeScript + Vite
Infra
Docker Compose + Nginx + Adminer

🔒 Seguridad
Los archivos .env y DEMOLaravelVueSecrets/ NO están en el repo
Usa tu propia configuración con tus credenciales

🚀 Inicio rápido (bash)
# 1. Clonar repo
git clone <repo>
cd DEMOLaravelVue

# 2. Configurar entorno
# Crea y Edita .env con tus credenciales de BD

# 3. Levantar contenedores
docker compose up -d

# 4. Instalar dependencias
docker compose exec app composer install
docker compose exec frontend npm install

# 5. Migrar BD
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate

# 6. Acceder
# Frontend: http://localhost:15173
# Backend API: http://localhost:18080/api
# Adminer (BD): http://localhost:18081

🔐 Primeros pasos
Abre http://localhost:15173
Registra un usuario nuevo
Crea categorías y tareas
Cada usuario ve solo sus tareas

📁 Estructura
DEMOLaravelVue/
├── backend/          # Laravel API
├── frontend/         # Vue 3 + TS
└── docker-compose.yml

📝 Funcionalidades
✅ Registro / Login / Logout con tokens
✅ CRUD de tareas (crear, leer, editar, eliminar)
✅ Categorías dinámicas
✅ Edición inline con confirmación
✅ Tareas aisladas por usuario

Hecho con 💙 por Myriam


