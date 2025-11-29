#!/bin/bash
# Environment switcher for Project Management System

set -e

echo "🔧 Project Management System - Environment Switcher"
echo ""

case "$1" in
  local)
    echo "🏠 Setting up LOCAL development environment..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env.local
    echo "✅ Local environment configured"
    echo "📝 Make sure your backend is running on: http://localhost:5000"
    ;;
  
  production)
    echo "🚀 Setting up PRODUCTION environment..."
    echo "VITE_API_URL=https://project-management-system-backend-mxy8b4tqc.vercel.app/api" > .env.local
    echo "✅ Production environment configured"
    echo "📝 Using deployed backend: Vercel"
    ;;
    
  show)
    echo "📄 Current environment configuration:"
    if [ -f .env.local ]; then
      cat .env.local
    else
      echo "❌ No .env.local file found"
      echo "💡 Run './setup-env.sh local' or './setup-env.sh production'"
    fi
    ;;
    
  *)
    echo "Usage: $0 {local|production|show}"
    echo ""
    echo "Commands:"
    echo "  local       - Configure for local development (http://localhost:5000)"
    echo "  production  - Configure for production backend (Vercel)"
    echo "  show        - Show current configuration"
    echo ""
    echo "Examples:"
    echo "  ./setup-env.sh local"
    echo "  ./setup-env.sh production"
    echo "  ./setup-env.sh show"
    exit 1
    ;;
esac

echo ""
echo "🔄 Restart your dev server (npm run dev) to apply changes!"