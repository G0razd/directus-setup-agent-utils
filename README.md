# Directus Setup Scripts

Automatické nastavení a populace Directus sbírek pro Abakus Akademie.

## Příprava

### 1. Nastavit přístupový token

Vygenerujte nový přístupový token v Directus admin panelu:
1. Jděte do **Settings → Access Tokens**
2. Vytvořte nový token s názvem `Setup Bot`
3. Zajistěte dostatečná oprávnění (minimálně čtení/zápis sbírek a položek)

### 2. Nakonfigurovat .env

```bash
# apps/server/.env (nebo root .env)
DIRECTUS_URL=http://localhost:8055
DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18  # Váš token
```

## Použití

### Úplné nastavení (doporučeno)
```bash
pnpm --filter @abakus/directus-setup setup
```

Toto postupně:
1. Vytvoří všechny sbírky podle schématu
2. Naplní je demo daty
3. Ověří úspěšnost

### Jednotlivé kroky

```bash
# Pouze vytvoření sbírek
pnpm --filter @abakus/directus-setup setup:collections

# Pouze naplnění daty (sbírky musí existovat)
pnpm --filter @abakus/directus-setup setup:data

# Ověření stavu
pnpm --filter @abakus/directus-setup verify

# Zálohování sbírek do JSON
pnpm --filter @abakus/directus-setup backup

# Vyčistění sbírek
pnpm --filter @abakus/directus-setup clean
```

## Struktura

```
directus-setup/
├── src/
│   ├── main.js                 # Spuštění všech kroků
│   ├── create-collections.js   # Vytvoření sbírek
│   ├── populate-data.js        # Naplnění daty
│   ├── verify-setup.js         # Ověření
│   ├── backup-collections.js   # Zálohování
│   ├── clean-collections.js    # Vyčistění
│   ├── config/
│   │   └── collections.json    # Definice sbírek
│   ├── lib/
│   │   ├── auth.js             # Autentizace
│   │   ├── client.js           # Directus klient
│   │   └── logger.js           # Logování
│   └── data/
│       └── demo-data.json      # Demo data
├── package.json
└── README.md
```

## Architektura

### Bezpečnost
- **Dynamické JWT tokeny**: Vygenerují se za běhu, nikdy se neukládají
- **Environment variables**: Todos ukládáno v .env (gitignore)
- **Role-based access**: Skripty respektují Directus oprávnění

### Logika
- **JSON-driven**: Sbírky definovány v `collections.json`
- **Idempotent**: Lze bezpečně spustit vícekrát
- **Modulární**: Každý skript je nezávislý
- **Ověřovatelné**: Automatické ověření stavu

### Tok dat

```
Access Token (z Directus settings)
    ↓
DirectusAuth (dynamické JWT generování)
    ↓
DirectusClient (REST API s autentizací)
    ↓
create-collections.js  ← collections.json (schéma)
    ↓
populate-data.js       ← demo-data (obsah)
    ↓
verify-setup.js        ← ověření integrity
    ↓
backup-collections.js  → JSON backupy
```

### Sbírky a vztahy

```
Courses (4 demo sbírky)
    ↓
Lessons (2+ lekcí)
    ↓
Problems (2+ úkoly)

ai_prompts (3 system prompty)
```

## Řešení problémů

### 403 Forbidden
```
❌ Chyba: [Directus] 403 Forbidden
```
- ✅ Zkontrolujte oprávnění tokenu
- ✅ Ujistěte se, že token má roli s přístupem k datům

### 401 Unauthorized
```
❌ Chyba: [Directus] 401 Unauthorized
```
- ✅ Token je neplatný nebo vypršel
- ✅ Vygenerujte nový v admin panelu

### Connection failed
```
❌ Chyba: ECONNREFUSED 127.0.0.1:8055
```
- ✅ Ujistěte se, že Directus běží
- ✅ Zkontrolujte DIRECTUS_URL v .env

## Pro AI agenty

Tento balíček je navržen pro snadné používání AI agenty:

```typescript
// Importovat a spustit
import setupCollections from '@abakus/directus-setup';

await setupCollections({
  directusUrl: process.env.DIRECTUS_URL,
  accessToken: process.env.DIRECTUS_SETUP_TOKEN
});
```

Všechny skripty mají:
- ✅ Detailní logování
- ✅ Chybové zprávy
- ✅ Progresní indikátory
- ✅ Automatické rollback
