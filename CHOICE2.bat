@echo off

:loop
echo Appuyez sur CTRL+C ou CTRL+H pour aller au label getname :
CHOICE2 --out key.txt
STRINGS key= READ key.txt,1
echo la touche est "%key%"
if "%key%"=="302" goto getname
if "%key%"=="291" goto getname
goto loop

:getname
STRINGS ma_variable= ASK quel est votre nom ?
echo votre nom est "%ma_variable%"
