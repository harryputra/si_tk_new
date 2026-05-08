#!/bin/bash

# ==========================================================
#   🌌 SI ERP TK ATTAUHID - DOCKER DEPLOYMENT RUNNER
# ==========================================================

echo "🚀 Starting Deployment Process..."

# 1. Setup Environment File
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    # Generate random password for DB if it's a new setup
    sed -i "s/DB_HOST=127.0.0.1/DB_HOST=db/g" .env
    sed -i "s/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/g" .env
    sed -i "s/DB_PORT=5433/DB_PORT=5432/g" .env
fi

# 2. Build and Start Containers
echo "🏗️ Building and starting Docker containers..."
docker compose up -d --build

# 3. Wait for Database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# 4. Run Application Setup inside the 'app' container
echo "📦 Running Composer Install & Migrations..."
docker compose exec -t app composer install --no-interaction --optimize-autoloader
docker compose exec -t app php artisan key:generate --force
docker compose exec -t app php artisan migrate --force
docker compose exec -t app php artisan storage:link
docker compose exec -t app php artisan optimize

# 5. Build Assets (Vite)
echo "🎨 Building Frontend Assets..."
# We can run this on the host if npm is available, or inside a temporary node container
docker run --rm -v $(pwd):/app -w /app node:20-alpine sh -c "npm install && npm run build"

# 6. Final Permissions Check
echo "🔒 Setting Permissions..."
docker compose exec -t app chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

echo ""
echo "=========================================================="
echo " ✅ DEPLOYMENT COMPLETE!"
echo "=========================================================="
echo " - App is running on port 80"
echo " - Ensure your Cloudflare Tunnel/DNS points to this server."
echo " - Log: docker compose logs -f"
echo "=========================================================="
