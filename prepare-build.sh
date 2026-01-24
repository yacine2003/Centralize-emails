#!/bin/bash

# 🚀 Script de Préparation du Build
# Ce script automatise les étapes de préparation avant de créer le .exe

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PRÉPARATION DU BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier qu'on est à la racine du projet
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Étape 1 : Builder le frontend
echo "📦 Étape 1/3 : Build du frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi
echo "✅ Frontend buildé avec succès"
echo ""

# Étape 2 : Créer le dossier public dans backend
echo "📁 Étape 2/3 : Création du dossier backend/public..."
cd ..
mkdir -p backend/public
echo "✅ Dossier créé"
echo ""

# Étape 3 : Copier le build vers backend/public
echo "📋 Étape 3/3 : Copie du build vers backend/public..."
cp -r frontend/build/* backend/public/
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la copie"
    exit 1
fi
echo "✅ Build copié avec succès"
echo ""

# Vérifier que service_account.json existe
if [ ! -f "backend/service_account.json" ]; then
    echo "⚠️  ATTENTION: service_account.json non trouvé dans backend/"
    echo "   Assurez-vous de l'ajouter avant de créer le .exe"
    echo ""
fi

# Afficher le résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PRÉPARATION TERMINÉE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1. Tester l'application unifiée :"
echo "   cd backend && npm start"
echo "   Ouvrir: http://localhost:3001"
echo ""
echo "2. Créer le .exe (sur Windows recommandé) :"
echo "   cd backend && npm run build"
echo ""
echo "3. Livrer le dossier backend/dist/ au client"
echo ""
