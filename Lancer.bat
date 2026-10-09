@echo off
chcp 65001 >nul
cd /d "%~dp0"
title IRIS  (ferme cette fenetre pour arreter le jeu)

rem Lance le mini serveur du jeu (serve.py) sur le port 8124 et ouvre le navigateur.
rem 8124 et pas 8123 : LA CAGE utilise deja 8123, les deux jeux peuvent tourner en meme temps.
rem On verifie le port AVANT : si une ancienne fenetre le tient deja, le jeu tourne deja.
netstat -ano | findstr /R /C:":8124 .*LISTENING" >nul
if not errorlevel 1 goto portPris

where python >nul 2>nul
if errorlevel 1 goto sansPython

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
echo.
start "" http://localhost:8124
pause
exit /b 1

:sansPython
echo.
echo   Python n'est pas installe : il faut un petit serveur pour lancer le jeu.
echo   Installe Python (https://www.python.org, coche « Add Python to PATH »), puis relance ce fichier.
echo.
pause
exit /b 1

:fin
