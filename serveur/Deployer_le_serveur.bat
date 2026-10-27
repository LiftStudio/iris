@echo off
chcp 65001 >nul
cd /d "%~dp0"
title IRIS - mettre le serveur en ligne

echo.
echo   ================================================================
echo     METTRE LE SERVEUR EN LIGNE D'IRIS CHEZ CLOUDFLARE
echo   ================================================================
echo.
echo   Le meme compte Cloudflare que LA CAGE. Si le navigateur s'ouvre et
echo   demande d'autoriser Wrangler, clique "Allow" : c'est tout.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   Node.js n'est pas installe : https://nodejs.org ^(version LTS^), puis relance.
  pause
  exit /b 1
)

call npx --yes wrangler deploy
if errorlevel 1 (
  echo.
  echo   Le deploiement a echoue. Le plus souvent : l'autorisation n'a pas ete donnee dans le navigateur.
  echo   Relance ce fichier.
  pause
  exit /b 1
)
echo.
echo   C'EST EN LIGNE : la version web du jeu (liftstudio.github.io/iris) se branche dessus toute seule.
echo.
pause
