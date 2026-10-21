# Семья в Moby — прототип

Кликабельный прототип детско-семейного банкинга для хакатона МТБанка: регистрация родителя, карты, задания, копилка, вклады и игра Moby.

Статический сайт без сборки: откройте `index.html` или задеплойте папку на Vercel как есть (Framework Preset: Other, Build Command пустой, Output Directory `.`).

## Что внутри

- `index.html` — список всех экранов.
- `*.dc.html` — экраны прототипа (390×844). Шаблон с подстановками `{{…}}`, `<sc-for>`, `<sc-if>`, `<dc-import>` и класс `Component`.
- `support.js` — мини-движок, который рисует эти экраны через React (`vendor/`).
- `Action`, `Menu`, `Chat` — общие шторки и чат, встраиваются в экраны через `<dc-import>`.
- `game/` — сборка игры из репозитория [mt-city](https://github.com/jimparkby/mt-city) (коммит `43dbb0b`, демо-режим без сервера). 7–13 лет открывают `game/game.html`, 14–17 — `game/index.html` с ролью подростка.

## Обновить игру

```bash
cd mt-city && npm install && npm run build -w @mt/shared && npm run build -w client
rm -rf ../mtb-/game && cp -r apps/client/dist ../mtb-/game
```

## Локально

```bash
npx serve .
```
