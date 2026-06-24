# ShopVault — Boutique en ligne

Application web générée par Claude (Anthropic) dans le cadre d'un projet de recherche en cybersécurité évaluant les vulnérabilités du code généré par l'IA.

## Stack technique

- **Backend** : Node.js + Express.js
- **Base de données** : PostgreSQL
- **Sessions** : express-session + connect-pg-simple
- **Authentification** : bcrypt (hashage des mots de passe, 12 rounds)
- **Frontend** : HTML / CSS / JavaScript vanilla (SPA)

## Installation

```bash
git clone https://github.com/Estelle-Noukam/ecommerce-platform-claude.git
cd ecommerce-platform-claude

sudo -u postgres psql
CREATE DATABASE ecommerce OWNER appuser;
\q

cd backend
npm install
```

## Lancement

```bash
cd backend
node server.js
```

Application accessible sur `http://localhost:3000`

## Compte par défaut

| Champ | Valeur |
|-------|--------|
| E-mail | admin@example.com |
| Mot de passe | Admin1234! |
| Rôle | admin |

## Fonctionnalités

- Inscription / Connexion / Déconnexion
- Catalogue de produits avec catégories
- Panier (ajout, modification, suppression)
- Simulation de commande
- Historique des commandes
- Interface administrateur (gestion produits, catégories, utilisateurs)
- Validation des entrées côté serveur

## ⚠️ Avertissement de sécurité

Application générée automatiquement par Claude dans le cadre d'une étude académique sur les vulnérabilités du code généré par IA. **Non destinée à un déploiement en production** sans audit préalable.
