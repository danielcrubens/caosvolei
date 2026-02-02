#!/bin/bash
set -e

echo "🧹 Limpando arquivos antigos..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependências..."
npm install --force

echo "🔧 Preparando Nuxt..."
npm run postinstall || true

echo "🏗️ Construindo projeto..."
npm run build