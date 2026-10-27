@echo off
chcp 65001 >nul
cd /d "%~dp0"
title IRIS  (ferme cette fenetre pour arreter le jeu)

rem Lance IRIS sur le port 8124 et ouvre le navigateur (8124 et pas 8123 : LA CAGE garde le 8123, les deux jeux tournent
rem en meme temps). Depuis le 27/10/2026, si Node.js est la, c'est lui qui sert le jeu ET le serveur EN LIGNE sur le meme
rem port (serveur\node.mjs) : tes amis ouvrent l'adresse affichee, cliquent EN LIGNE, et ils sont dans l'ecole avec toi.
rem Sans Node, Python sert le jeu seul (tout marche sauf EN LIGNE).
netstat -ano | findstr /R /C:":8124 .*LISTENING" >nul
if not errorlevel 1 goto portPris

where node >nul 2>nul
if errorlevel 1 goto pythonSeul

start "" http://localhost:8124
node serveur\node.mjs 8124
goto fin

:pythonSeul
where python >nul 2>nul
if errorlevel 1 goto sansRien
echo.
echo   Node.js n'est pas installe : le jeu se lance, mais SANS le mode EN LIGNE.
echo   Pour jouer avec des amis, installe Node.js (https://nodejs.org, version LTS), ferme cette fenetre et relance.
echo.
echo   IRIS : http://localhost:8124   (ferme cette fenetre pour arreter)
echo.
start "" /B python serve.py 8124
timeout /t 1 /nobreak >nul
start "" http://localhost:8124
pause >nul
goto fin

:portPris
echo.
echo   Le port 8124 est deja pris : une fenetre du jeu est encore ouverte quelque part.
echo   (Si tu voulais juste rouvrir le jeu, il tourne deja : http://localhost:8124)
echo   Pour le mode EN LIGNE, ferme toutes les fenetres noires du jeu, puis relance ce fichier.
echo.
start "" http://localhost:8124
pause
exit /b 1

:sansRien
echo.
echo   Ni Node.js ni Python ne sont installes : il faut l'un des deux pour lancer le jeu.
echo   Le mieux : Node.js (https://nodejs.org, version LTS) — il ouvre aussi le mode EN LIGNE.
echo.
pause
exit /b 1

:fin
