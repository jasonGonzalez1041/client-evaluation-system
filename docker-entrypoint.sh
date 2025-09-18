#!/bin/sh
set -e

echo "🚀 Iniciando Alpha CRM..."

# Verificar conexión a la base de datos
echo "📡 Verificando conexión a la base de datos..."
timeout=30
while ! npx prisma db pull --preview-feature > /dev/null 2>&1; do
  if [ $timeout -eq 0 ]; then
    echo "❌ Error: No se pudo conectar a la base de datos después de 30 segundos"
    exit 1
  fi
  echo "⏳ Esperando conexión a la base de datos... ($timeout segundos restantes)"
  sleep 1
  timeout=$((timeout-1))
done

echo "✅ Conexión a la base de datos establecida"

# Aplicar migraciones
echo "🔄 Aplicando migraciones de base de datos..."
npx prisma migrate deploy

echo "✅ Migraciones aplicadas exitosamente"

# Iniciar la aplicación
echo "🌟 Iniciando aplicación Next.js..."
exec npm start