@echo off
setlocal enabledelayedexpansion

rem tu peux vérifier si l'opération a été annulé avec les errorlevels

call :AskInput name "Your name (only letter): " "maxlength=10" "nn=true" "ns=true" && (
  echo;Hi !name!.
) || (
  echo;Cancelled by user.
)

call :AskInput age "Your age (only digit): " "maxlength=3" "nl=true" "ns=true" && (
  echo;You are !age! years old.
) || (
  echo;Cancelled by user.
)

rem autre façon de vérifier si l'opération a été annulé (avec échappe)

call :AskInput input "Say what you want: " "maxlength=20"
if %errorlevel% equ 0 (
  echo;You said: "%input%"
) else (
  echo;Cancelled by user.
)

rem il est aussi possible de cacher l'input
call :AskInput password "Your password: " "maxlength=20" "hidden=true"
if %errorlevel% equ 0 (
  echo;Your password is: "%password%"
) else (
  echo;Cancelled by user.
)

pause>nul&exit
:AskInput <out:string> [<in:prompt>] [maxlength=<in:number>] [hidden=<in:boolean>] [nn=<in:boolean>] [nl=<in:boolean>] [ns=<in:boolean>]
rem ------------------------------------------------------------------------------
rem AskInput - A function that mimics the behavior of the Setp.exe (by USER) command
rem (setp.exe from https://batch.xoo.it/t6656-Un-moteur-de-Jeu-Simple-avec-un-menu-et-une-memoire-testee.htm)
rem
rem Parameters:
rem  <out:string> - The variable name where the user input will be stored.
rem  [<in:prompt>] - Optional prompt to display to the user.
rem  [maxlength=<in:number>] - Optional maximum length of the input. Defaults to 2000.
rem  [hidden=<in:boolean>] - Optional flag to hide input (true/false).
rem  [nn=<in:boolean>] - Optional flag to block numbers (true/false).
rem  [nl=<in:boolean>] - Optional flag to block letters (true/false).
rem  [ns=<in:boolean>] - Optional flag to block special characters (true/false).
rem
rem Notes:
rem - The function allows setting a length limit that blocks any input except for
rem  Enter and Backspace while the user is typing. The default length limit is 2000.
rem - Input can be hidden (like password input) if specified.
rem - Special flags can be used to block numbers, letters, or special characters.
rem - The input is saved in a variable specified by <out:string>.
  setlocal enabledelayedexpansion
  set #e=0
  set "#o=%~1"
  set "#p=%~2"
  set "#text="
  set /a "#l=0,#h=0,#m=2000,#nn=0,#nl=0,#ns=0,#j=0"
  set "#unamed=maxlength hidden nn nl ns "
  shift&shift
  :AskInput.Parse
  if not "%~1"=="" (
    for /f "tokens=1,* delims==" %%1 in ("%~1") do (
      set "#k=%%~1"
      set "#v=%%~2"
    )
    set "#j=0"
    :AskInput.Parse.Unamed
    if "!#k!"=="maxlength" (
      set /a "#m=!#v!"
    ) else if "!#k!"=="hidden" (
      if "!#v!"=="true" set "#h=true"
    ) else if "!#k!"=="nn" (
      if "!#v!"=="true" set "#nn=true"
    ) else if "!#k!"=="nl" (
      if "!#v!"=="true" set "#nl=true"
    ) else if "!#k!"=="ns" (
      if "!#v!"=="true" set "#ns=true"
    ) else if "!#j!"=="0" (
      set "#j=1"
      for /f "tokens=1,* delims= " %%i in ('echo;!#unamed!') do (
        set "#v=!#k!"
        set "#k=%%~i"
        set "#unamed=!#unamed:%%~i =!"
        set "#unamed=!#unamed:  = !"
      )
      goto :AskInput.Parse.Unamed
    )
    shift
    if "!#j!"=="0" (
      for /f "tokens=1,* delims= " %%i in ('echo;!#unamed!') do (
        set "#unamed=!#unamed:%%~i =!"
        set "#unamed=!#unamed:  = !"
      )
    )
    goto :AskInput.Parse
  )
  set /p "=!#p!"<nul
  for /f "delims=" %%a in ('powershell -Command "$input = ''; $nn = (Get-Item Env:'#nn').Value -eq 'true'; $nl = (Get-Item Env:'#nl').Value -eq 'true'; $ns = (Get-Item Env:'#ns').Value -eq 'true'; $hidden = (Get-Item Env:'#h').Value -eq 'true'; $maxlength = [int](Get-Item Env:'#m').Value; while ($true) { $key = [console]::ReadKey($true); if ($key.Key -eq 'Enter') { [Console]::Error.Write([Environment]::NewLine); Write-Output ('0' + $input); exit 0 } elseif ($key.Key -eq 'Escape') { [Console]::Error.Write([Environment]::NewLine); Write-Output '1'; exit 1 } elseif ($key.Key -eq 'Backspace') { if ($input.Length -gt 0) { $input = $input.Substring(0, $input.Length - 1); if (-not $hidden) { [Console]::Error.Write([char]8 + ' ' + [char]8); } } } else { $isDigit = $key.KeyChar -match '\d'; $isLetter = $key.KeyChar -match '[a-zA-Z]'; if ((-not $nn -or -not $isDigit) -and (-not $nl -or -not $isLetter) -and (-not $ns -or $isLetter -or $isDigit)) { if ($maxlength -lt 0 -or $input.Length -lt $maxlength) { $input += $key.KeyChar; if (-not $hidden) { [Console]::Error.Write($key.KeyChar); } } } } }"') do (
    set "#text=%%a"
    set "#e=!#text:~0,1!"
    set "#text=!#text:~1!"
  )
(
  endlocal
  if "%#e%"=="0" set "%#o%=%#text%"
  exit /b %#e%
)
