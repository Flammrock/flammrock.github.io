@set @junk=1 /*
@echo off

rem on initialise l'environnement
goto :APP.INIT
:APP.START


rem #################### VARIABLE GLOBALE ####################

    rem le dossier où se trouve les sous-dossiers : 
    set CarFolder=dossiertrb\Elite
    
    rem le fichier final trb
    set FileTRB=trb.txt
    
    rem l'emplacement du fichier temporaire qui permettra de remplacer des valeurs dans les fichiers (comme le timestamp ou CarUID)
    set outTempFile=temp.txt
    
    rem le dossier où sont sauvegardés les nsb, scb, trb et 8ed9e902c5c024bfb899e99893d4eb525d3ad179 originaux
    set saveFolder=Sauvegarde fichiers
    
    rem on détermine l'éditeur (notepad++ en priorité)
    if exist "%ProgramFiles%\Notepad++\Notepad++.exe" (
        set editor="%ProgramFiles%\Notepad++\Notepad++.exe"
    ) else (
        set editor=notepad
    )

rem ################## End:VARIABLE GLOBALE ##################


:APP.MAIN

rem on affiche le menu
call :Lib.DisplayMenu choice


rem en fonction du choix, on effectue différente opération

rem On décompresse tout ce qu'on peut
if !choice! equ 1 (
    call :Command.Decompress
) else if !choice! equ 2 (
    call :Command.FixSyncANDROID
) else if !choice! equ 3 (
    call :Command.FixSyncIOS
) else if !choice! equ 4 (
    call :Command.BuildTRB
) else if !choice! equ 5 (
    call :Command.DebanANDROID
) else if !choice! equ 6 (
    call :Command.EditFile
) else if !choice! equ 7 (
    call :Command.Compress
) else if !choice! equ 8 (
    exit
)


echo;
echo;

rem on demande à l'utilisateur d'appuyer sur une touche pour retourner au menu
set /p ".=Appuyez sur une touche pour revenur au menu..."<nul
pause>nul
goto :APP.MAIN




rem Petite sécurité
:APP.END
pause>nul
goto :APP.END












rem Encore une sécurité (au cas où)
pause>nul&exit

rem on créé un wrapper du jscript mais en batch + quelques fonctions pratiques



:Command.Decompress
    rem on efface la console
    cls
    
    rem on affiche le choix choisit
    call :Console.log %ESC%[32mDécompression en cours...%ESC%[0m

    rem on créé le dossier "Sauvegarde fichiers"
    call :Lib.CreateSaveFolder
    
    rem on unpack les fichiers
    call :Lib.TryUnPack "nsb" 1 1
    call :Lib.TryUnPack "scb" 1 0
    call :Lib.TryUnPack "8ed9e902c5c024bfb899e99893d4eb525d3ad179" 0 0
    call :Lib.TryUnPack "trb" 0 1
    
Exit /b 0


:Command.FixSyncANDROID
    rem on efface la console
    cls
    
    rem on affiche le choix choisit
    call :Console.log %ESC%[32mRésolution du bug de Synchronisation (ANDROID)...%ESC%[0m

    if exist "nsb.txt" (
        ren "nsb.txt" nsb_reparation_synchro.txt
        findstr /V "cmlv" nsb_reparation_synchro.txt > nsb.txt
        del /q /f "nsb_reparation_synchro.txt" >nul 2>&1
        call :Console.log Résolution du bug de Synchronisation ^(ANDROID^) - %ESC%[32mSuccès%ESC%[0m.
        call :Console.log Fixation "nsb.txt" - %ESC%[32mSuccès%ESC%[0m.
    ) else (
        call :Console.log "nsb.txt" n'existe pas, bug non-résolu
    )

Exit /b 0


:Command.FixSyncIOS
    rem on efface la console
    cls
    
    rem on affiche le choix choisit
    call :Console.log %ESC%[32mRésolution du bug de Synchronisation (IOS)...%ESC%[0m
    
    set _o=0
    
    if exist "nsb.txt" (
        ren "nsb.txt" nsb_reparation_synchro.txt
        findstr /V "Red Blue Green Yellow cmlv" nsb_reparation_synchro.txt > nsb.txt
        del "nsb_reparation_synchro.txt"
        set _o=1
        call :Console.log Fixation "nsb.txt" - %ESC%[32mSuccès%ESC%[0m.
    )
    if exist "scb.txt" (
        ren "scb.txt" scb_reparation_synchro.txt
        findstr /V "AMPart" scb_reparation_synchro.txt > scb.txt
        del "scb_reparation_synchro.txt"
        set _o=1
        call :Console.log Fixation "scb.txt" - %ESC%[32mSuccès%ESC%[0m.
    )
    
    if "!_o!"=="1" (
        call :Console.log Résolution du bug de Synchronisation ^(IOS^) - %ESC%[32mSuccès%ESC%[0m.
    ) else (
        call :Console.log "nsb.txt" et "scb.txt" n'existent pas, bug non-résolu
    )

Exit /b 0


:Command.BuildTRB
    rem on efface la console
    cls
    
    call :Lib.BuildTRB
    
Exit /b 0


:Command.DebanANDROID
    rem on efface la console
    cls
    
    rem on affiche le choix choisit
    call :Console.log %ESC%[32mDeban des fichiers (ANDROID)...%ESC%[0m
    
    rem on créé le dossier "Sauvegarde fichiers"
    call :Lib.CreateSaveFolder
    
    rem on unpack les fichiers
    call :Lib.TryUnPack "nsb" 1 1
    call :Lib.TryUnPack "scb" 1 0

    pause
    
    if exist "nsb.txt" (
        ren "nsb.txt" "nsb_Unban.txt"
        findstr /V "smptr tcbl cmlv Red Blue Green Yellow" "nsb_Unban.txt" > "nsb.txt"
        ECHO ******************************************************************************
        ECHO Les niveaux ELITE ont ete supprimes du fichier nsb
        ECHO Le code TCBL a ete supprime du fichier nsb
        ECHO ******************************************************************************
        move "nsb_Unban.txt" "!saveFolder!\"
        call :Console.log Deban de "nsb.txt" - %ESC%[32mSuccès%ESC%[0m.
    )
    if exist "scb.txt" (
        ren "scb.txt" scb_unban.txt
        findstr /V "AMPart" scb_unban.txt > scb.txt
        ECHO ******************************************************************************
        ECHO Les jetons ELITE ont ete supprimes du fichier scb
        ECHO ******************************************************************************
        move "scb_unban.txt" "!saveFolder!\"
        call :Console.log Deban de "scb.txt" - %ESC%[32mSuccès%ESC%[0m.
    )
    
    pause
    
    call :Lib.TryPack "nsb.txt"
    
    pause
    
    call :Lib.TryPack "scb.txt"
    
    pause

Exit /b 0 


:Command.Compress
    rem on efface la console
    cls
    
    rem on affiche le choix choisit
    call :Console.log %ESC%[32mCompression des fichiers...%ESC%[0m
    
    if exist "8ed9e902c5c024bfb899e99893d4eb525d3ad179.txt" (
        ren "8ed9e902c5c024bfb899e99893d4eb525d3ad179.txt" "8ed9e902c5c024bfb899e99893d4eb525d3ad179_crc.txt"
        findstr /V "CRC" 8ed9e902c5c024bfb899e99893d4eb525d3ad179_crc.txt > 8ed9e902c5c024bfb899e99893d4eb525d3ad179.txt
        move "8ed9e902c5c024bfb899e99893d4eb525d3ad179_crc.txt" "!saveFolder!\"
    )
    
    call :Lib.TryPack "nsb.txt"
    call :Lib.TryPack "scb.txt"
    call :Lib.TryPack "8ed9e902c5c024bfb899e99893d4eb525d3ad179.txt"
    call :Lib.TryPack "trb.txt"
    
Exit /b 0 


:Lib.TryPack <in:file>
    if exist "%~1" (
        call :Console.log Pack de "%~1"...
        call :MAGIE.pack "%~1" "%~n1"
        call :Console.log Pack de "%~1" - %ESC%[32mSuccès%ESC%[0m.
        ECHO ******************************************************************************
        ECHO Si il y a une erreur JSON, choisissez 7 dans le menu et verifiez votre travail
        ECHO ******************************************************************************
        ping localhost -n 2 >nul
        ren "%~1.sav" "%~n1"
        move "%~1" "!saveFolder!\"
    )
Exit /b 0 

:Lib.CreateSaveFolder
    rem on créé le dossier "Sauvegarde fichiers"
    if exist !saveFolder!\nul (
        call :Console.log %ESC%[33mLe dossier "%ESC%[32m!saveFolder!%ESC%[33m" existe déjà.%ESC%[0m
    ) else (
    
        call :Console.log Création du Dossier "%ESC%[94m!saveFolder!%ESC%[0m"....
        md "!saveFolder!" && (
            call :Console.log Création du Dossier "%ESC%[94m!saveFolder!%ESC%[0m" - %ESC%[32mSuccès%ESC%[0m.
        ) || (
            call :Console.error Impossible de créer le dossier "%ESC%[94m!saveFolder!%ESC%[0m"
        )
    )
Exit /b 0   

:Lib.TryUnPack <in:file> <in:start> <in:bigfile>
    if exist "%~1" (
        set __m=
        if "%~3"=="1" set __m=^(peut prendre quelques minutes, engine JScript^)
        call :Console.log Unpack de "%~1"... !__m!
        call :MAGIE.unpack "%~1" "%~1.txt"
        call :Console.log Unpack de "%~1" - %ESC%[32mSuccès%ESC%[0m.
        ren "%~1" "%~1_original" && (
            call :Console.log Renommage de "%~1" en "%~1_original" - %ESC%[32mSuccès%ESC%[0m.
        ) || (
            call :Console.error Impossible de renommer "%~1" en "%~1_original".%ESC%[0m
        )
        move "%~1_original" "!saveFolder!\" >nul 2>&1 && (
            call :Console.log "%~1" déplacé vers "%~1_original" - %ESC%[32mSuccès%ESC%[0m.
        ) || (
            call :Console.error Impossible de déplacer "%~1" vers "%~1_original".%ESC%[0m
        )
        if "%~2"=="1" !editor! "%~1.txt"
    )
Exit /b 0

:Lib.DisplayMenu <out:choice>
    cls
    echo;
    echo;                  ***************************************************************
    echo;                  *------------------ Menu V2 par Boomers XXX ------------------*
    echo;                  ***************************************************************
    echo;                  *      Tous les documents originaux seront sauvegardes^^!       *
    echo;                  *                                                             *
    echo;                  *          Taper 1 - Decompresser les fichiers                *
    echo;                  *          Taper 2 - Reparer le bug de synchro (ANDROID)      *
    echo;                  *          Taper 3 - Reparer le bug de synchro (IOS)          *
    echo;                  *          Taper 4 - Creation fichiers TRB ELITE              *
    echo;                  *          Taper 5 - Pour debannir vos fichiers (ANDROID)     *
    echo;                  *                    sans decompresser les fichiers           *
    echo;                  *          Taper 6 - Pour modifier vos fichiers en cas        *
    echo;                  *                    d'erreur JSON                            *
    echo;                  *          Tapez 7 - Recompresser les fichiers                *
    echo;                  *          Tapez 8 - Quitter                                  *
    echo;                  ***************************************************************
    echo;                           le numero CRC sera supprime automatiquement
    echo;                              lors de la recompression des fichiers
    echo;
    echo;
    choice /c 12345678 /N /M "Tapez votre choix :"
    set _e=!errorlevel!
    set %~1=!_e!
    if !_e! lss 1 goto :Lib.DisplayMenu
    if !_e! gtr 8 goto :Lib.DisplayMenu
Exit /b !_e!


rem :Lib.BuildTRB - contruit un fichier trb.txt à partir des fichiers nsb.txt et scb.txt
:Lib.BuildTRB

    rem on vide le fichier trb.txt (ou on le créé s'il n'existe pas encore)
    call :Console.log Construction du fichier "!FileTRB!"...
    type nul > "!FileTRB!"


    rem on vérifie que le fichier "nsb.txt" n'existe pas déjà
    if exist "nsb.txt" (
        call :Console.log %ESC%[33m"%ESC%[32mnsb.txt%ESC%[33m" existe déjà.%ESC%[0m.
    ) else (

        rem on unpack "nsb"
        call :Console.log Unpack de "nsb"... ^(peut prendre quelques minutes^)
        call :MAGIE.unpack nsb nsb.txt
        call :Console.log Unpack de "nsb" - %ESC%[32mSuccès%ESC%[0m.
        rem Magie.exe unpack -p -i "nsb" >nul && (
        rem     call :Console.log Unpack de "nsb" - %ESC%[32mSuccès%ESC%[0m.
        rem ) || (
        rem     call :Console.error Une erreur est survenue lors de l'unpack de "nsb"
        rem )
        
    )

    rem on vérifie que le fichier "scb.txt" n'existe pas déjà
    if exist "scb.txt" (
        call :Console.log %ESC%[33m"%ESC%[32mscb.txt%ESC%[33m" existe déjà.%ESC%[0m.
    ) else (

        rem on unpack "scb"
        call :Console.log Unpack de "scb"...
        call :MAGIE.unpack scb scb.txt
        call :Console.log Unpack de "scb" - %ESC%[32mSuccès%ESC%[0m.
        rem Magie.exe unpack -p -i "scb" >nul && (
        rem     call :Console.log Unpack de "scb" - %ESC%[32mSuccès%ESC%[0m.
        rem ) || (
        rem     call :Console.error Une erreur est survenue lors de l'unpack de "scb"
        rem )
        
    )

    rem on construit le fichier "scb.CarsSecureData.formated.txt" (toi tu le nomme "1listeunidcmlv.txt")
    call :Console.log Extraction des données importantes de "scb.txt"...
    call :JSON.format "CarsSecureData" "scb.txt" "scb.CarsSecureData.formated.txt" "$1:$2" "cui" "amml"
    call :Console.log Extraction des données de "scb.txt" - %ESC%[32mSuccès%ESC%[0m.

    rem on construit le fichier "nsb.caow.formated.txt" (toi tu le nomme "4listefinale.txt")
    call :Console.log Extraction des données importantes de "nsb.txt"... (cette opération peut prendre plusieurs dizaines de secondes)
    call :JSON.format "caow" "nsb.txt" "nsb.caow.formated.txt" "$1:$2" "unid" "crdb"
    call :Console.log Extraction des données de "nsb.txt" - %ESC%[32mSuccès%ESC%[0m.


    rem on construit le fichier "trb.row.data.txt" (toi tu le nomme "sortie.txt" ou "5listetrb.txt")
    call :Console.log Construction du fichier "trb.row.data.txt"...
    type nul > "trb.row.data.txt"
    for /f "tokens=1* delims=:" %%a in ('type "nsb.caow.formated.txt"') do (
        for /f "tokens=1* delims=: " %%c in ('type "scb.CarsSecureData.formated.txt"') do if "%%~a"=="%%~c" echo %%a:%%b:%%d
    )>> "trb.row.data.txt"
    call :Console.log Fusion de "scb.CarsSecureData.formated.txt" et "nsb.caow.formated.txt" %* - %ESC%[32mSuccès%ESC%[0m.

    rem on concat les fichiers :
    call :Console.log Construction du fichier "!FileTRB!"...

    rem on récupère le timestamp
    call :Utils.GetUnixTime UNIX_TIME

    rem on itère sur chaque ligne de "trb.row.data.txt" (toi tu le nomme "5listetrb.txt")
    for /f "tokens=1,2,3 delims=:" %%1 in ('type "trb.row.data.txt"') do (

        rem on enlève une indentation (c'est juste pour avoir un affichage plus jolie sur la console)
        set Console.log.Indent=0

        rem on affiche la ligne qu'on traite
        call :Console.log %ESC%[96m%%2%ESC%[0m %ESC%[94mLevel%ESC%[0m %ESC%[32m%%3%ESC%[0m ^(CarUID %ESC%[95m%%1%ESC%[0m^)
        
        rem on ajoute une indentation (c'est juste pour avoir un affichage plus jolie sur la console)
        set Console.log.Indent=1
        
        rem on vérifie que le dossier existe bien
        if exist !CarFolder!\%%2\nul (
            
            rem on vérifie que le fichier n'est pas un dossier
            if exist !CarFolder!\%%2\%%3Cmlv.txt\nul (
            
                rem sinon on affiche une erreur
                call :Console.error "!CarFolder!\%%2\%%3Cmlv.txt" est un dossier, "!CarFolder!\%%2\%%3Cmlv.txt" DOIT être un fichier.
                
            
            rem on vérifie que le fichier existe (si on arrive ici alors on est sûr que le fichier n'est pas un dossier)
            ) else if exist !CarFolder!\%%2\%%3Cmlv.txt (
            
                rem on commence à le traiter
                call :Console.log Concaténation de "!CarFolder!\%%2\%%3Cmlv.txt"
                call :Console.log Traitement de "!CarFolder!\%%2\%%3Cmlv.txt" en cours...
                
                
                
                
                rem on modifie la propriété "CarUID"
                call :Console.log Remplacement de la valeur de la propriété "CarUID"...
                rem on remplace la valeur de la propriété "CarUID" avec la valeur qu'on a
                call :JSON.replace "CarUID" "!CarFolder!\%%2\%%3Cmlv.txt" "!outTempFile!" %%1 0
                call :Console.log Remplacement de la valeur de la propriété "CarUID" - %ESC%[32mSuccès%ESC%[0m.
                
                
                
                rem on modifie la propriété "timestamp"
                call :Console.log Remplacement de la valeur de la propriété "timestamp"...
                rem on remplace la valeur de la propriété "timestamp" avec la valeur qu'on a : UNIX_TIME
                call :JSON.replace "timestamp" "!outTempFile!" "!outTempFile!" !UNIX_TIME! 0
                call :Console.log Remplacement de la valeur de la propriété "timestamp" - %ESC%[32mSuccès%ESC%[0m.
                
                rem on concatène ensuite ce fichier
                type "!outTempFile!" >> "!FileTRB!"
                
                rem on supprime le fichier temporaire
                del /q /f "!outTempFile!" >nul 2>&1
                
            
            rem le fichier n'existe pas (à toi de gérer ce cas)
            ) else (
            
            
                rem call :Console.error "!CarFolder!\%%2\%%3Cmlv.txt" n'existe pas.
                echo;%ESC%[31mErreur: "!CarFolder!\%%2\%%3Cmlv.txt" n'existe pas.%ESC%[0m
                pause
                
            )
            
        rem le dossier est un fichier (ce qui n'est pas possible)
        ) else if exist !CarFolder!\%%2 (
        
            rem on affiche l'erreur
            call :Console.error "!CarFolder!\%%2" est un fichier, "!CarFolder!\%%2" DOIT être un dossier.
            
            
        rem sinon le dossier n'existe pas (à toi de gérer ce cas)
        ) else (
        
            rem call :Console.error "!CarFolder!\%%2" n'existe pas.
            echo;%ESC%[31mErreur: "!CarFolder!\%%2" n'existe pas.%ESC%[0m
            pause
            
        )
    )

    rem on enlève une indentation (c'est juste pour avoir un affichage plus jolie sur la console)
    set Console.log.Indent=0

    rem on supprime les fichiers tempraires
    call :Console.log Suppression des fichiers temporaires...
    call :Utils.Delete "!outTempFile!"
    call :Utils.Delete "scb.CarsSecureData.formated.txt"
    call :Utils.Delete "nsb.caow.formated.txt"
    call :Utils.Delete "trb.row.data.txt"
    call :Console.log Suppression des fichiers temporaires - %ESC%[32mSuccès%ESC%[0m.

    rem on clean le fichier trb (on enlève la virgule à la fin)
    rem on encapsule tout l'objet dans une clé "transactions"
    call :JSON.clean "!FileTRB!" "!FileTRB!" 1 "transactions"

    rem on affiche que le script s'est terminé
    call :Console.log Construction du fichier "!FileTRB!" - %ESC%[32mSuccès%ESC%[0m.

Exit /b 0


:MAGIE.unpack <fileIn> <fileOut>
    chcp !__cp!>nul
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":MAGIE.unpack" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__file=%~1"
    chcp 65001>nul
    call :JSON.log !_e! ":MAGIE.unpack" %*
Exit /b !_e!

:MAGIE.pack <fileIn> <fileOut>
    chcp !__cp!>nul
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":MAGIE.pack" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__file=%~1"
    chcp 65001>nul
    call :JSON.log !_e! ":MAGIE.pack" %*
Exit /b !_e!

:GZIP.unpack <fileIn> <fileOut>
    chcp !__cp!>nul
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":GZIP.unpack" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__file=%~1"
    chcp 65001>nul
    call :JSON.log !_e! ":GZIP.unpack" %*
Exit /b !_e!

:GZIP.pack <fileIn> <fileOut>
    chcp !__cp!>nul
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":GZIP.pack" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__file=%~1"
    chcp 65001>nul
    call :JSON.log !_e! ":GZIP.pack" %*
Exit /b !_e!


:JSON.extract <in:Key> <in:FileIn> <in:FileOut>
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":JSON.extract" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__key=%~1"&set "__file=%~2"
    call :JSON.log !_e! ":JSON.extract" %*
Exit /b !_e!

:JSON.format <in:Key> <in:FileIn> <in:FileOut> <in:Format> <in:SubKey_1> <in:SubKey_2> ... <in:SubKey_n>
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":JSON.format" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__key=%~1"&set "__file=%~2"
    call :JSON.log !_e! ":JSON.format" %*
Exit /b !_e!

:JSON.replace <in:Key> <in:FileIn> <in:FileOut> <in:Value> <in:keepRepearVersion>
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":JSON.replace" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__key=%~1"&set "__file=%~2"
    call :JSON.log !_e! ":JSON.replace" %*
Exit /b !_e!

:JSON.clean <in:FileIn> <in:FileOut> <in:Value> <in:keepRepearVersion>
    set /p ".=%ESC%[91m"<nul
    cscript //nologo //E:jscript "!____BatchFile____!" ":JSON.clean" %*
    set _e=!errorlevel!
    set /p ".=%ESC%[0m"<nul
    set "__file=%~1"
    call :JSON.log !_e! ":JSON.clean" %*
Exit /b !_e!

:Utils.GetUnixTime
    setlocal enableextensions
    for /f %%x in ('wmic path win32_utctime get /format:list ^| findstr "="') do (
        set %%x
    )
    set /a z=(14-100%Month%%%100)/12, y=10000%Year%%%10000-z
    set /a ut=y*365+y/4-y/100+y/400+(153*(100%Month%%%100+12*z-3)+2)/5+Day-719469
    set /a ut=ut*86400+100%Hour%%%100*3600+100%Minute%%%100*60+100%Second%%%100
    endlocal & set "%1=%ut%"
Exit /b 0

:Utils.Delete <File>
    set _e=1
    if exist "%~1" (
        del /q /f "%~1" >nul 2>&1
        call :Console.log Suppression de "%~1"
        if exist "%~1" (
            set _e=0
            echo;%ESC%[31mErreur: Impossible de supprimer le fichier "%~1".%ESC%[0m
            pause
        )
    )
Exit /b !_e!

:JSON.log <errorlevel> <call> <args>
    for /f "tokens=1,2,* delims= " %%i in ('echo;%*') do set "_d=%%k"
    if %~1 equ 0 (
        call :Console.log %~2 !_d! - %ESC%[32mSuccès%ESC%[0m.
    ) else if %~1 equ 1 (
        call :Console.error %~2 !_d! - La clé "%ESC%[91m!__key!%ESC%[31m" n'a pas été trouvée.%ESC%[0m
    ) else if %~1 equ 2 (
        echo;%ESC%[31mError: %~2 !_d! - Impossible de parser le fichier "%ESC%[91m!__file!%ESC%[31m".%ESC%[0m
        pause
    ) else if %~1 equ 3 (
        call :Console.error %~2 !_d! - Pas assez d'arguments.%ESC%[0m
    ) else if %~1 equ 4 (
        call :Console.error %~2 !_d! - Une erreur est survenue.%ESC%[0m
    ) else if %~1 equ 5 (
        call :Console.error %~2 !_d! - Le fichier "%ESC%[91m!__file!%ESC%[31m" n'existe pas.%ESC%[0m
    ) else if %~1 equ 6 (
        call :Console.error %~2 !_d! - La signature n'a pas été trouvé.%ESC%[0m
    ) else if %~1 equ 7 (
        echo;%ESC%[31mError: %~2 !_d! - JSON non-valide. %ESC%[0m
        pause
    )
Exit /b 0

:Console.log
    if not "!Console.log.Indent!"=="!___sindenss!" (
        set "___sindens="
        set "___sindenss=!Console.log.Indent!"
        for /l %%i in (1,1,!Console.log.Indent!) do set "___sindens=!___sindens!    "
    )
    echo;[%ESC%[34m!date!%ESC%[0m] - %ESC%[35m!time!%ESC%[0m : !___sindens!%*
Exit /b 0

:Console.error
    echo;%ESC%[31mError: %* %ESC%[0m
    set /p ".=Appuyez sur une touche pour quitter..."<nul
    pause>nul&exit
Exit /b 0



:APP.INIT
    setlocal enabledelayedexpansion
    for /f "tokens=2 delims=:." %%x in ('chcp') do set __cp=%%x
    chcp 65001>nul
    for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
    title build trb file ^| Par Flammrock (inspiré de Dorian68) ^| v1.0.0
    set ____BatchFile____=%~f0
    set Console.log.Indent=0
goto :APP.START


exit
*/

var htmlfile = WSH.CreateObject('htmlfile'), JSON, atob;
htmlfile.write('<meta http-equiv="x-ua-compatible" content="IE=edge" />');
htmlfile.close(JSON = htmlfile.parentWindow.JSON, atob = htmlfile.parentWindow.atob);

/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
/*
(function(){function N(p,r){function q(a){if(q[a]!==w)return q[a];var c;if("bug-string-char-index"==a)c="a"!="a"[0];else if("json"==a)c=q("json-stringify")&&q("json-parse");else{var e;if("json-stringify"==a){c=r.stringify;var b="function"==typeof c&&s;if(b){(e=function(){return 1}).toJSON=e;try{b="0"===c(0)&&"0"===c(new t)&&'""'==c(new A)&&c(u)===w&&c(w)===w&&c()===w&&"1"===c(e)&&"[1]"==c([e])&&"[null]"==c([w])&&"null"==c(null)&&"[null,null,null]"==c([w,u,null])&&'{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'==
c({a:[e,!0,!1,null,"\x00\b\n\f\r\t"]})&&"1"===c(null,e)&&"[\n 1,\n 2\n]"==c([1,2],null,1)&&'"-271821-04-20T00:00:00.000Z"'==c(new C(-864E13))&&'"+275760-09-13T00:00:00.000Z"'==c(new C(864E13))&&'"-000001-01-01T00:00:00.000Z"'==c(new C(-621987552E5))&&'"1969-12-31T23:59:59.999Z"'==c(new C(-1))}catch(f){b=!1}}c=b}if("json-parse"==a){c=r.parse;if("function"==typeof c)try{if(0===c("0")&&!c(!1)){e=c('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');var n=5==e.a.length&&1===e.a[0];if(n){try{n=!c('"\t"')}catch(d){}if(n)try{n=
1!==c("01")}catch(g){}if(n)try{n=1!==c("1.")}catch(m){}}}}catch(X){n=!1}c=n}}return q[a]=!!c}p||(p=k.Object());r||(r=k.Object());var t=p.Number||k.Number,A=p.String||k.String,H=p.Object||k.Object,C=p.Date||k.Date,G=p.SyntaxError||k.SyntaxError,K=p.TypeError||k.TypeError,L=p.Math||k.Math,I=p.JSON||k.JSON;"object"==typeof I&&I&&(r.stringify=I.stringify,r.parse=I.parse);var H=H.prototype,u=H.toString,v,B,w,s=new C(-0xc782b5b800cec);try{s=-109252==s.getUTCFullYear()&&0===s.getUTCMonth()&&1===s.getUTCDate()&&
10==s.getUTCHours()&&37==s.getUTCMinutes()&&6==s.getUTCSeconds()&&708==s.getUTCMilliseconds()}catch(Q){}if(!q("json")){var D=q("bug-string-char-index");if(!s)var x=L.floor,M=[0,31,59,90,120,151,181,212,243,273,304,334],E=function(a,c){return M[c]+365*(a-1970)+x((a-1969+(c=+(1<c)))/4)-x((a-1901+c)/100)+x((a-1601+c)/400)};(v=H.hasOwnProperty)||(v=function(a){var c={},e;(c.__proto__=null,c.__proto__={toString:1},c).toString!=u?v=function(a){var c=this.__proto__;a=a in(this.__proto__=null,this);this.__proto__=
c;return a}:(e=c.constructor,v=function(a){var c=(this.constructor||e).prototype;return a in this&&!(a in c&&this[a]===c[a])});c=null;return v.call(this,a)});B=function(a,c){var e=0,b,f,n;(b=function(){this.valueOf=0}).prototype.valueOf=0;f=new b;for(n in f)v.call(f,n)&&e++;b=f=null;e?B=2==e?function(a,c){var e={},b="[object Function]"==u.call(a),f;for(f in a)b&&"prototype"==f||v.call(e,f)||!(e[f]=1)||!v.call(a,f)||c(f)}:function(a,c){var e="[object Function]"==u.call(a),b,f;for(b in a)e&&"prototype"==
b||!v.call(a,b)||(f="constructor"===b)||c(b);(f||v.call(a,b="constructor"))&&c(b)}:(f="valueOf toString toLocaleString propertyIsEnumerable isPrototypeOf hasOwnProperty constructor".split(" "),B=function(a,c){var e="[object Function]"==u.call(a),b,h=!e&&"function"!=typeof a.constructor&&F[typeof a.hasOwnProperty]&&a.hasOwnProperty||v;for(b in a)e&&"prototype"==b||!h.call(a,b)||c(b);for(e=f.length;b=f[--e];h.call(a,b)&&c(b));});return B(a,c)};if(!q("json-stringify")){var U={92:"\\\\",34:'\\"',8:"\\b",
12:"\\f",10:"\\n",13:"\\r",9:"\\t"},y=function(a,c){return("000000"+(c||0)).slice(-a)},R=function(a){for(var c='"',b=0,h=a.length,f=!D||10<h,n=f&&(D?a.split(""):a);b<h;b++){var d=a.charCodeAt(b);switch(d){case 8:case 9:case 10:case 12:case 13:case 34:case 92:c+=U[d];break;default:if(32>d){c+="\\u00"+y(2,d.toString(16));break}c+=f?n[b]:a.charAt(b)}}return c+'"'},O=function(a,c,b,h,f,n,d){var g,m,k,l,p,r,s,t,q;try{g=c[a]}catch(z){}if("object"==typeof g&&g)if(m=u.call(g),"[object Date]"!=m||v.call(g,
"toJSON"))"function"==typeof g.toJSON&&("[object Number]"!=m&&"[object String]"!=m&&"[object Array]"!=m||v.call(g,"toJSON"))&&(g=g.toJSON(a));else if(g>-1/0&&g<1/0){if(E){l=x(g/864E5);for(m=x(l/365.2425)+1970-1;E(m+1,0)<=l;m++);for(k=x((l-E(m,0))/30.42);E(m,k+1)<=l;k++);l=1+l-E(m,k);p=(g%864E5+864E5)%864E5;r=x(p/36E5)%24;s=x(p/6E4)%60;t=x(p/1E3)%60;p%=1E3}else m=g.getUTCFullYear(),k=g.getUTCMonth(),l=g.getUTCDate(),r=g.getUTCHours(),s=g.getUTCMinutes(),t=g.getUTCSeconds(),p=g.getUTCMilliseconds();
g=(0>=m||1E4<=m?(0>m?"-":"+")+y(6,0>m?-m:m):y(4,m))+"-"+y(2,k+1)+"-"+y(2,l)+"T"+y(2,r)+":"+y(2,s)+":"+y(2,t)+"."+y(3,p)+"Z"}else g=null;b&&(g=b.call(c,a,g));if(null===g)return"null";m=u.call(g);if("[object Boolean]"==m)return""+g;if("[object Number]"==m)return g>-1/0&&g<1/0?""+g:"null";if("[object String]"==m)return R(""+g);if("object"==typeof g){for(a=d.length;a--;)if(d[a]===g)throw K();d.push(g);q=[];c=n;n+=f;if("[object Array]"==m){k=0;for(a=g.length;k<a;k++)m=O(k,g,b,h,f,n,d),q.push(m===w?"null":
m);a=q.length?f?"[\n"+n+q.join(",\n"+n)+"\n"+c+"]":"["+q.join(",")+"]":"[]"}else B(h||g,function(a){var c=O(a,g,b,h,f,n,d);c!==w&&q.push(R(a)+":"+(f?" ":"")+c)}),a=q.length?f?"{\n"+n+q.join(",\n"+n)+"\n"+c+"}":"{"+q.join(",")+"}":"{}";d.pop();return a}};r.stringify=function(a,c,b){var h,f,n,d;if(F[typeof c]&&c)if("[object Function]"==(d=u.call(c)))f=c;else if("[object Array]"==d){n={};for(var g=0,k=c.length,l;g<k;l=c[g++],(d=u.call(l),"[object String]"==d||"[object Number]"==d)&&(n[l]=1));}if(b)if("[object Number]"==
(d=u.call(b))){if(0<(b-=b%1))for(h="",10<b&&(b=10);h.length<b;h+=" ");}else"[object String]"==d&&(h=10>=b.length?b:b.slice(0,10));return O("",(l={},l[""]=a,l),f,n,h,"",[])}}if(!q("json-parse")){var V=A.fromCharCode,W={92:"\\",34:'"',47:"/",98:"\b",116:"\t",110:"\n",102:"\f",114:"\r"},b,J,l=function(){b=J=null;throw G();},z=function(){for(var a=J,c=a.length,e,h,f,k,d;b<c;)switch(d=a.charCodeAt(b),d){case 9:case 10:case 13:case 32:b++;break;case 123:case 125:case 91:case 93:case 58:case 44:return e=
D?a.charAt(b):a[b],b++,e;case 34:e="@";for(b++;b<c;)if(d=a.charCodeAt(b),32>d)l();else if(92==d)switch(d=a.charCodeAt(++b),d){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:e+=W[d];b++;break;case 117:h=++b;for(f=b+4;b<f;b++)d=a.charCodeAt(b),48<=d&&57>=d||97<=d&&102>=d||65<=d&&70>=d||l();e+=V("0x"+a.slice(h,b));break;default:l()}else{if(34==d)break;d=a.charCodeAt(b);for(h=b;32<=d&&92!=d&&34!=d;)d=a.charCodeAt(++b);e+=a.slice(h,b)}if(34==a.charCodeAt(b))return b++,e;l();default:h=
b;45==d&&(k=!0,d=a.charCodeAt(++b));if(48<=d&&57>=d){for(48==d&&(d=a.charCodeAt(b+1),48<=d&&57>=d)&&l();b<c&&(d=a.charCodeAt(b),48<=d&&57>=d);b++);if(46==a.charCodeAt(b)){for(f=++b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&l();b=f}d=a.charCodeAt(b);if(101==d||69==d){d=a.charCodeAt(++b);43!=d&&45!=d||b++;for(f=b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&l();b=f}return+a.slice(h,b)}k&&l();if("true"==a.slice(b,b+4))return b+=4,!0;if("false"==a.slice(b,b+5))return b+=5,!1;if("null"==a.slice(b,
b+4))return b+=4,null;l()}return"$"},P=function(a){var c,b;"$"==a&&l();if("string"==typeof a){if("@"==(D?a.charAt(0):a[0]))return a.slice(1);if("["==a){for(c=[];;b||(b=!0)){a=z();if("]"==a)break;b&&(","==a?(a=z(),"]"==a&&l()):l());","==a&&l();c.push(P(a))}return c}if("{"==a){for(c={};;b||(b=!0)){a=z();if("}"==a)break;b&&(","==a?(a=z(),"}"==a&&l()):l());","!=a&&"string"==typeof a&&"@"==(D?a.charAt(0):a[0])&&":"==z()||l();c[a.slice(1)]=P(z())}return c}l()}return a},T=function(a,b,e){e=S(a,b,e);e===
w?delete a[b]:a[b]=e},S=function(a,b,e){var h=a[b],f;if("object"==typeof h&&h)if("[object Array]"==u.call(h))for(f=h.length;f--;)T(h,f,e);else B(h,function(a){T(h,a,e)});return e.call(a,b,h)};r.parse=function(a,c){var e,h;b=0;J=""+a;e=P(z());"$"!=z()&&l();b=J=null;return c&&"[object Function]"==u.call(c)?S((h={},h[""]=e,h),"",c):e}}}r.runInContext=N;return r}var K=typeof define==="function"&&define.amd,F={"function":!0,object:!0},G=F[typeof exports]&&exports&&!exports.nodeType&&exports,k=F[typeof window]&&
window||this,t=G&&F[typeof module]&&module&&!module.nodeType&&"object"==typeof global&&global;!t||t.global!==t&&t.window!==t&&t.self!==t||(k=t);if(G&&!K)N(k,G);else{var L=k.JSON,Q=k.JSON3,M=!1,A=N(k,k.JSON3={noConflict:function(){M||(M=!0,k.JSON=L,k.JSON3=Q,L=Q=null);return A}});k.JSON={parse:A.parse,stringify:A.stringify}}K&&define(function(){return A})}).call(this);*/

if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0)
                 ? Math.ceil(from)
                 : Math.floor(from);
        if (from < 0)
            from += len;
 
        for (; from < len; from++)
        {
            if (from in this &&
                    this[from] === elt)
                return from;
        }
        return -1;
    };
}


//    array.map - http://tech.pro/tutorial/1834/working-with-es5-javascript-array-functions-in-modern-and-legacy-browsers#map
         
if (!Array.prototype.map)
{
    Array.prototype.map = function(fun /*, thisArg */)
    {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this),
            len = t.length >>> 0;
        if (typeof fun !== "function") {
            throw new TypeError();
        }

        var res = new Array(len);
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
            if (i in t)
                res[i] = fun.call(thisArg, t[i], i, t);
        }

        return res;
    };
}

//    Object.keys - https://gist.github.com/jonfalcon/4715325
if (!Object.keys) {
    Object.keys = (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;
 
        return function (obj) {
            if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
 
            var result = [];
 
            for (var prop in obj) {
                if (hasOwnProperty.call(obj, prop)) result.push(prop);
            }
 
            if (hasDontEnumBug) {
                for (var i=0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
                }
            }
            return result;
        }
    })()
};

//    function bind - https://gist.github.com/dsingleton/1312328
Function.prototype.bind = (function() {}).bind || function(b) {
    if (typeof this !== "function") {
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    function c() {}
    var a = [].slice,
        f = a.call(arguments, 1),
        e = this,
        d = function() {
            return e.apply(this instanceof c ? this : b || window, f.concat(a.call(arguments)));
        };
    c.prototype = this.prototype;
    d.prototype = new c();
    return d;
};

//    Array.forEach - http://javascript.boxsheep.com/polyfills/Array-prototype-forEach/
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, arg) {
        var arr = Object(this),
            len = arr.length >>> 0,
            thisArg = arg ? arg : undefined,
            i;
        if (typeof fn !== 'function') {
            throw new TypeError();
        }
        for (i = 0; i < len; i += 1) {
            if (arr.hasOwnProperty(i)) {
                fn.call(thisArg, arr[i], i, arr);
            }
        }
        return undefined;
    };
}


if (!Array.prototype.some) {
    Array.prototype.some = function (func) {
        for (var i = 0; i < this.length; i++) {
            if (func(this[i])) return true;
        }
        return false;
    };
}



(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function () {
    'use strict';

    var table = [],
        poly = 0xEDB88320; // reverse polynomial

    // build the table
    function makeTable() {
        var c, n, k;

        for (n = 0; n < 256; n += 1) {
            c = n;
            for (k = 0; k < 8; k += 1) {
                if (c & 1) {
                    c = poly ^ (c >>> 1);
                } else {
                    c = c >>> 1;
                }
            }
            table[n] = c >>> 0;
        }
    }

    function strToArr(str) {
        // sweet hack to turn string into a 'byte' array
        return Array.prototype.map.call(str, function (c) {
            return c.charCodeAt(0);
        });
    }

    /*
     * Compute CRC of array directly.
     *
     * This is slower for repeated calls, so append mode is not supported.
     */
    function crcDirect(arr) {
        var crc = -1, // initial contents of LFBSR
            i, j, l, temp;

        for (i = 0, l = arr.length; i < l; i += 1) {
            temp = (crc ^ arr[i]) & 0xff;

            // read 8 bits one at a time
            for (j = 0; j < 8; j += 1) {
                if ((temp & 1) === 1) {
                    temp = (temp >>> 1) ^ poly;
                } else {
                    temp = (temp >>> 1);
                }
            }
            crc = (crc >>> 8) ^ temp;
        }

        // flip bits
        return crc ^ -1;
    }

    /*
     * Compute CRC with the help of a pre-calculated table.
     *
     * This supports append mode, if the second parameter is set.
     */
    function crcTable(arr, append) {
        var crc, i, l;

        // if we're in append mode, don't reset crc
        // if arr is null or undefined, reset table and return
        if (typeof crcTable.crc === 'undefined' || !append || !arr) {
            crcTable.crc = 0 ^ -1;

            if (!arr) {
                return;
            }
        }

        // store in temp variable for minor speed gain
        crc = crcTable.crc;

        for (i = 0, l = arr.length; i < l; i += 1) {
            crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
        }

        crcTable.crc = crc;

        return crc ^ -1;
    }

    // build the table
    // this isn't that costly, and most uses will be for table assisted mode
    makeTable();

    module.exports = function (val, direct) {
        var val = (typeof val === 'string') ? strToArr(val) : val,
            ret = direct ? crcDirect(val) : crcTable(val);

        // convert to 2's complement hex
        return (ret >>> 0).toString(16);
    };
    module.exports.direct = crcDirect;
    module.exports.table = crcTable;
}());

},{}],2:[function(require,module,exports){
(function () {
    'use strict';

    module.exports = {
        'inflate': require('./lib/rawinflate.js'),
        'deflate': require('./lib/rawdeflate.js')
    };
}());

},{"./lib/rawdeflate.js":3,"./lib/rawinflate.js":4}],3:[function(require,module,exports){
/*
 * $Id: rawdeflate.js,v 0.3 2009/03/01 19:05:05 dankogai Exp dankogai $
 *
 * Original:
 *   http://www.onicos.com/staff/iz/amuse/javascript/expert/deflate.txt
 */

/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.1
 * LastModified: Dec 25 1999
 */

/* Interface:
 * data = deflate(src);
 */

(function () {
    /* constant parameters */
    var WSIZE = 32768, // Sliding Window size
        STORED_BLOCK = 0,
        STATIC_TREES = 1,
        DYN_TREES = 2,

    /* for deflate */
        DEFAULT_LEVEL = 6,
        FULL_SEARCH = false,
        INBUFSIZ = 32768, // Input buffer size
        //INBUF_EXTRA = 64, // Extra buffer
        OUTBUFSIZ = 1024 * 8,
        window_size = 2 * WSIZE,
        MIN_MATCH = 3,
        MAX_MATCH = 258,
        BITS = 16,
    // for SMALL_MEM
        LIT_BUFSIZE = 0x2000,
//        HASH_BITS = 13,
    //for MEDIUM_MEM
    //    LIT_BUFSIZE = 0x4000,
    //    HASH_BITS = 14,
    // for BIG_MEM
    //    LIT_BUFSIZE = 0x8000,
        HASH_BITS = 15,
        DIST_BUFSIZE = LIT_BUFSIZE,
        HASH_SIZE = 1 << HASH_BITS,
        HASH_MASK = HASH_SIZE - 1,
        WMASK = WSIZE - 1,
        NIL = 0, // Tail of hash chains
        TOO_FAR = 4096,
        MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1,
        MAX_DIST = WSIZE - MIN_LOOKAHEAD,
        SMALLEST = 1,
        MAX_BITS = 15,
        MAX_BL_BITS = 7,
        LENGTH_CODES = 29,
        LITERALS = 256,
        END_BLOCK = 256,
        L_CODES = LITERALS + 1 + LENGTH_CODES,
        D_CODES = 30,
        BL_CODES = 19,
        REP_3_6 = 16,
        REPZ_3_10 = 17,
        REPZ_11_138 = 18,
        HEAP_SIZE = 2 * L_CODES + 1,
        H_SHIFT = parseInt((HASH_BITS + MIN_MATCH - 1) / MIN_MATCH, 10),

    /* variables */
        free_queue,
        qhead,
        qtail,
        initflag,
        outbuf = null,
        outcnt,
        outoff,
        complete,
        window,
        d_buf,
        l_buf,
        prev,
        bi_buf,
        bi_valid,
        block_start,
        ins_h,
        hash_head,
        prev_match,
        match_available,
        match_length,
        prev_length,
        strstart,
        match_start,
        eofile,
        lookahead,
        max_chain_length,
        max_lazy_match,
        compr_level,
        good_match,
        nice_match,
        dyn_ltree,
        dyn_dtree,
        static_ltree,
        static_dtree,
        bl_tree,
        l_desc,
        d_desc,
        bl_desc,
        bl_count,
        heap,
        heap_len,
        heap_max,
        depth,
        length_code,
        dist_code,
        base_length,
        base_dist,
        flag_buf,
        last_lit,
        last_dist,
        last_flags,
        flags,
        flag_bit,
        opt_len,
        static_len,
        deflate_data,
        deflate_pos;

    if (LIT_BUFSIZE > INBUFSIZ) {
        console.error("error: INBUFSIZ is too small");
    }
    if ((WSIZE << 1) > (1 << BITS)) {
        console.error("error: WSIZE is too large");
    }
    if (HASH_BITS > BITS - 1) {
        console.error("error: HASH_BITS is too large");
    }
    if (HASH_BITS < 8 || MAX_MATCH !== 258) {
        console.error("error: Code too clever");
    }

    /* objects (deflate) */

    function DeflateCT() {
        this.fc = 0; // frequency count or bit string
        this.dl = 0; // father node in Huffman tree or length of bit string
    }

    function DeflateTreeDesc() {
        this.dyn_tree = null; // the dynamic tree
        this.static_tree = null; // corresponding static tree or NULL
        this.extra_bits = null; // extra bits for each code or NULL
        this.extra_base = 0; // base index for extra_bits
        this.elems = 0; // max number of elements in the tree
        this.max_length = 0; // max bit length for the codes
        this.max_code = 0; // largest code with non zero frequency
    }

    /* Values for max_lazy_match, good_match and max_chain_length, depending on
     * the desired pack level (0..9). The values given below have been tuned to
     * exclude worst case performance for pathological files. Better values may be
     * found for specific files.
     */
    function DeflateConfiguration(a, b, c, d) {
        this.good_length = a; // reduce lazy search above this match length
        this.max_lazy = b; // do not perform lazy search above this match length
        this.nice_length = c; // quit search above this match length
        this.max_chain = d;
    }

    function DeflateBuffer() {
        this.next = null;
        this.len = 0;
        this.ptr = []; // new Array(OUTBUFSIZ); // ptr.length is never read
        this.off = 0;
    }

    /* constant tables */
    var extra_lbits = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    var extra_dbits = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    var extra_blbits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];
    var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var configuration_table = [
        new DeflateConfiguration(0, 0, 0, 0),
        new DeflateConfiguration(4, 4, 8, 4),
        new DeflateConfiguration(4, 5, 16, 8),
        new DeflateConfiguration(4, 6, 32, 32),
        new DeflateConfiguration(4, 4, 16, 16),
        new DeflateConfiguration(8, 16, 32, 32),
        new DeflateConfiguration(8, 16, 128, 128),
        new DeflateConfiguration(8, 32, 128, 256),
        new DeflateConfiguration(32, 128, 258, 1024),
        new DeflateConfiguration(32, 258, 258, 4096)
    ];


    /* routines (deflate) */

    function deflate_start(level) {
        var i;

        if (!level) {
            level = DEFAULT_LEVEL;
        } else if (level < 1) {
            level = 1;
        } else if (level > 9) {
            level = 9;
        }

        compr_level = level;
        initflag = false;
        eofile = false;
        if (outbuf !== null) {
            return;
        }

        free_queue = qhead = qtail = null;
        outbuf = []; // new Array(OUTBUFSIZ); // outbuf.length never called
        window = []; // new Array(window_size); // window.length never called
        d_buf = []; // new Array(DIST_BUFSIZE); // d_buf.length never called
        l_buf = []; // new Array(INBUFSIZ + INBUF_EXTRA); // l_buf.length never called
        prev = []; // new Array(1 << BITS); // prev.length never called

        dyn_ltree = [];
        for (i = 0; i < HEAP_SIZE; i++) {
            dyn_ltree[i] = new DeflateCT();
        }
        dyn_dtree = [];
        for (i = 0; i < 2 * D_CODES + 1; i++) {
            dyn_dtree[i] = new DeflateCT();
        }
        static_ltree = [];
        for (i = 0; i < L_CODES + 2; i++) {
            static_ltree[i] = new DeflateCT();
        }
        static_dtree = [];
        for (i = 0; i < D_CODES; i++) {
            static_dtree[i] = new DeflateCT();
        }
        bl_tree = [];
        for (i = 0; i < 2 * BL_CODES + 1; i++) {
            bl_tree[i] = new DeflateCT();
        }
        l_desc = new DeflateTreeDesc();
        d_desc = new DeflateTreeDesc();
        bl_desc = new DeflateTreeDesc();
        bl_count = []; // new Array(MAX_BITS+1); // bl_count.length never called
        heap = []; // new Array(2*L_CODES+1); // heap.length never called
        depth = []; // new Array(2*L_CODES+1); // depth.length never called
        length_code = []; // new Array(MAX_MATCH-MIN_MATCH+1); // length_code.length never called
        dist_code = []; // new Array(512); // dist_code.length never called
        base_length = []; // new Array(LENGTH_CODES); // base_length.length never called
        base_dist = []; // new Array(D_CODES); // base_dist.length never called
        flag_buf = []; // new Array(parseInt(LIT_BUFSIZE / 8, 10)); // flag_buf.length never called
    }

    function deflate_end() {
        free_queue = qhead = qtail = null;
        outbuf = null;
        window = null;
        d_buf = null;
        l_buf = null;
        prev = null;
        dyn_ltree = null;
        dyn_dtree = null;
        static_ltree = null;
        static_dtree = null;
        bl_tree = null;
        l_desc = null;
        d_desc = null;
        bl_desc = null;
        bl_count = null;
        heap = null;
        depth = null;
        length_code = null;
        dist_code = null;
        base_length = null;
        base_dist = null;
        flag_buf = null;
    }

    function reuse_queue(p) {
        p.next = free_queue;
        free_queue = p;
    }

    function new_queue() {
        var p;

        if (free_queue !== null) {
            p = free_queue;
            free_queue = free_queue.next;
        } else {
            p = new DeflateBuffer();
        }
        p.next = null;
        p.len = p.off = 0;

        return p;
    }

    function head1(i) {
        return prev[WSIZE + i];
    }

    function head2(i, val) {
        return (prev[WSIZE + i] = val);
    }

    /* put_byte is used for the compressed output, put_ubyte for the
     * uncompressed output. However unlzw() uses window for its
     * suffix table instead of its output buffer, so it does not use put_ubyte
     * (to be cleaned up).
     */
    function put_byte(c) {
        outbuf[outoff + outcnt++] = c;
        if (outoff + outcnt === OUTBUFSIZ) {
            qoutbuf();
        }
    }

    /* Output a 16 bit value, lsb first */
    function put_short(w) {
        w &= 0xffff;
        if (outoff + outcnt < OUTBUFSIZ - 2) {
            outbuf[outoff + outcnt++] = (w & 0xff);
            outbuf[outoff + outcnt++] = (w >>> 8);
        } else {
            put_byte(w & 0xff);
            put_byte(w >>> 8);
        }
    }

    /* ==========================================================================
     * Insert string s in the dictionary and set match_head to the previous head
     * of the hash chain (the most recent string with same hash key). Return
     * the previous length of the hash chain.
     * IN  assertion: all calls to to INSERT_STRING are made with consecutive
     *    input characters and the first MIN_MATCH bytes of s are valid
     *    (except for the last MIN_MATCH-1 bytes of the input file).
     */
    function INSERT_STRING() {
        ins_h = ((ins_h << H_SHIFT) ^ (window[strstart + MIN_MATCH - 1] & 0xff)) & HASH_MASK;
        hash_head = head1(ins_h);
        prev[strstart & WMASK] = hash_head;
        head2(ins_h, strstart);
    }

    /* Send a code of the given tree. c and tree must not have side effects */
    function SEND_CODE(c, tree) {
        send_bits(tree[c].fc, tree[c].dl);
    }

    /* Mapping from a distance to a distance code. dist is the distance - 1 and
     * must not have side effects. dist_code[256] and dist_code[257] are never
     * used.
     */
    function D_CODE(dist) {
        return (dist < 256 ? dist_code[dist] : dist_code[256 + (dist >> 7)]) & 0xff;
    }

    /* ==========================================================================
     * Compares to subtrees, using the tree depth as tie breaker when
     * the subtrees have equal frequency. This minimizes the worst case length.
     */
    function SMALLER(tree, n, m) {
        return tree[n].fc < tree[m].fc || (tree[n].fc === tree[m].fc && depth[n] <= depth[m]);
    }

    /* ==========================================================================
     * read string data
     */
    function read_buff(buff, offset, n) {
        var i;
        for (i = 0; i < n && deflate_pos < deflate_data.length; i++) {
            buff[offset + i] = deflate_data[deflate_pos++] & 0xff;
        }
        return i;
    }

    /* ==========================================================================
     * Initialize the "longest match" routines for a new file
     */
    function lm_init() {
        var j;

        // Initialize the hash table. */
        for (j = 0; j < HASH_SIZE; j++) {
            // head2(j, NIL);
            prev[WSIZE + j] = 0;
        }
        // prev will be initialized on the fly */

        // Set the default configuration parameters:
        max_lazy_match = configuration_table[compr_level].max_lazy;
        good_match = configuration_table[compr_level].good_length;
        if (!FULL_SEARCH) {
            nice_match = configuration_table[compr_level].nice_length;
        }
        max_chain_length = configuration_table[compr_level].max_chain;

        strstart = 0;
        block_start = 0;

        lookahead = read_buff(window, 0, 2 * WSIZE);
        if (lookahead <= 0) {
            eofile = true;
            lookahead = 0;
            return;
        }
        eofile = false;
        // Make sure that we always have enough lookahead. This is important
        // if input comes from a device such as a tty.
        while (lookahead < MIN_LOOKAHEAD && !eofile) {
            fill_window();
        }

        // If lookahead < MIN_MATCH, ins_h is garbage, but this is
        // not important since only literal bytes will be emitted.
        ins_h = 0;
        for (j = 0; j < MIN_MATCH - 1; j++) {
            // UPDATE_HASH(ins_h, window[j]);
            ins_h = ((ins_h << H_SHIFT) ^ (window[j] & 0xff)) & HASH_MASK;
        }
    }

    /* ==========================================================================
     * Set match_start to the longest match starting at the given string and
     * return its length. Matches shorter or equal to prev_length are discarded,
     * in which case the result is equal to prev_length and match_start is
     * garbage.
     * IN assertions: cur_match is the head of the hash chain for the current
     *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
     */
    function longest_match(cur_match) {
        var chain_length = max_chain_length; // max hash chain length
        var scanp = strstart; // current string
        var matchp; // matched string
        var len; // length of current match
        var best_len = prev_length; // best match length so far

        // Stop when cur_match becomes <= limit. To simplify the code,
        // we prevent matches with the string of window index 0.
        var limit = (strstart > MAX_DIST ? strstart - MAX_DIST : NIL);

        var strendp = strstart + MAX_MATCH;
        var scan_end1 = window[scanp + best_len - 1];
        var scan_end = window[scanp + best_len];

        var i, broke;

        // Do not waste too much time if we already have a good match: */
        if (prev_length >= good_match) {
            chain_length >>= 2;
        }

        // Assert(encoder->strstart <= window_size-MIN_LOOKAHEAD, "insufficient lookahead");

        do {
            // Assert(cur_match < encoder->strstart, "no future");
            matchp = cur_match;

            // Skip to next match if the match length cannot increase
            // or if the match length is less than 2:
            if (window[matchp + best_len] !== scan_end  ||
                    window[matchp + best_len - 1] !== scan_end1 ||
                    window[matchp] !== window[scanp] ||
                    window[++matchp] !== window[scanp + 1]) {
                continue;
            }

            // The check at best_len-1 can be removed because it will be made
            // again later. (This heuristic is not always a win.)
            // It is not necessary to compare scan[2] and match[2] since they
            // are always equal when the other bytes match, given that
            // the hash keys are equal and that HASH_BITS >= 8.
            scanp += 2;
            matchp++;

            // We check for insufficient lookahead only every 8th comparison;
            // the 256th check will be made at strstart+258.
            while (scanp < strendp) {
                broke = false;
                for (i = 0; i < 8; i += 1) {
                    scanp += 1;
                    matchp += 1;
                    if (window[scanp] !== window[matchp]) {
                        broke = true;
                        break;
                    }
                }

                if (broke) {
                    break;
                }
            }

            len = MAX_MATCH - (strendp - scanp);
            scanp = strendp - MAX_MATCH;

            if (len > best_len) {
                match_start = cur_match;
                best_len = len;
                if (FULL_SEARCH) {
                    if (len >= MAX_MATCH) {
                        break;
                    }
                } else {
                    if (len >= nice_match) {
                        break;
                    }
                }

                scan_end1 = window[scanp + best_len - 1];
                scan_end = window[scanp + best_len];
            }
        } while ((cur_match = prev[cur_match & WMASK]) > limit && --chain_length !== 0);

        return best_len;
    }

    /* ==========================================================================
     * Fill the window when the lookahead becomes insufficient.
     * Updates strstart and lookahead, and sets eofile if end of input file.
     * IN assertion: lookahead < MIN_LOOKAHEAD && strstart + lookahead > 0
     * OUT assertions: at least one byte has been read, or eofile is set;
     *    file reads are performed for at least two bytes (required for the
     *    translate_eol option).
     */
    function fill_window() {
        var n, m;

     // Amount of free space at the end of the window.
        var more = window_size - lookahead - strstart;

        // If the window is almost full and there is insufficient lookahead,
        // move the upper half to the lower one to make room in the upper half.
        if (more === -1) {
            // Very unlikely, but possible on 16 bit machine if strstart == 0
            // and lookahead == 1 (input done one byte at time)
            more--;
        } else if (strstart >= WSIZE + MAX_DIST) {
            // By the IN assertion, the window is not empty so we can't confuse
            // more == 0 with more == 64K on a 16 bit machine.
            // Assert(window_size == (ulg)2*WSIZE, "no sliding with BIG_MEM");

            // System.arraycopy(window, WSIZE, window, 0, WSIZE);
            for (n = 0; n < WSIZE; n++) {
                window[n] = window[n + WSIZE];
            }

            match_start -= WSIZE;
            strstart    -= WSIZE; /* we now have strstart >= MAX_DIST: */
            block_start -= WSIZE;

            for (n = 0; n < HASH_SIZE; n++) {
                m = head1(n);
                head2(n, m >= WSIZE ? m - WSIZE : NIL);
            }
            for (n = 0; n < WSIZE; n++) {
            // If n is not on any hash chain, prev[n] is garbage but
            // its value will never be used.
                m = prev[n];
                prev[n] = (m >= WSIZE ? m - WSIZE : NIL);
            }
            more += WSIZE;
        }
        // At this point, more >= 2
        if (!eofile) {
            n = read_buff(window, strstart + lookahead, more);
            if (n <= 0) {
                eofile = true;
            } else {
                lookahead += n;
            }
        }
    }

    /* ==========================================================================
     * Processes a new input file and return its compressed length. This
     * function does not perform lazy evaluationof matches and inserts
     * new strings in the dictionary only for unmatched strings or for short
     * matches. It is used only for the fast compression options.
     */
    function deflate_fast() {
        while (lookahead !== 0 && qhead === null) {
            var flush; // set if current block must be flushed

            // Insert the string window[strstart .. strstart+2] in the
            // dictionary, and set hash_head to the head of the hash chain:
            INSERT_STRING();

            // Find the longest match, discarding those <= prev_length.
            // At this point we have always match_length < MIN_MATCH
            if (hash_head !== NIL && strstart - hash_head <= MAX_DIST) {
                // To simplify the code, we prevent matches with the string
                // of window index 0 (in particular we have to avoid a match
                // of the string with itself at the start of the input file).
                match_length = longest_match(hash_head);
                // longest_match() sets match_start */
                if (match_length > lookahead) {
                    match_length = lookahead;
                }
            }
            if (match_length >= MIN_MATCH) {
                // check_match(strstart, match_start, match_length);

                flush = ct_tally(strstart - match_start, match_length - MIN_MATCH);
                lookahead -= match_length;

                // Insert new strings in the hash table only if the match length
                // is not too large. This saves time but degrades compression.
                if (match_length <= max_lazy_match) {
                    match_length--; // string at strstart already in hash table
                    do {
                        strstart++;
                        INSERT_STRING();
                        // strstart never exceeds WSIZE-MAX_MATCH, so there are
                        // always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
                        // these bytes are garbage, but it does not matter since
                        // the next lookahead bytes will be emitted as literals.
                    } while (--match_length !== 0);
                    strstart++;
                } else {
                    strstart += match_length;
                    match_length = 0;
                    ins_h = window[strstart] & 0xff;
                    // UPDATE_HASH(ins_h, window[strstart + 1]);
                    ins_h = ((ins_h << H_SHIFT) ^ (window[strstart + 1] & 0xff)) & HASH_MASK;

                //#if MIN_MATCH !== 3
                //        Call UPDATE_HASH() MIN_MATCH-3 more times
                //#endif

                }
            } else {
                // No match, output a literal byte */
                flush = ct_tally(0, window[strstart] & 0xff);
                lookahead--;
                strstart++;
            }
            if (flush) {
                flush_block(0);
                block_start = strstart;
            }

            // Make sure that we always have enough lookahead, except
            // at the end of the input file. We need MAX_MATCH bytes
            // for the next match, plus MIN_MATCH bytes to insert the
            // string following the next match.
            while (lookahead < MIN_LOOKAHEAD && !eofile) {
                fill_window();
            }
        }
    }

    function deflate_better() {
        // Process the input block. */
        while (lookahead !== 0 && qhead === null) {
            // Insert the string window[strstart .. strstart+2] in the
            // dictionary, and set hash_head to the head of the hash chain:
            INSERT_STRING();

            // Find the longest match, discarding those <= prev_length.
            prev_length = match_length;
            prev_match = match_start;
            match_length = MIN_MATCH - 1;

            if (hash_head !== NIL && prev_length < max_lazy_match && strstart - hash_head <= MAX_DIST) {
                // To simplify the code, we prevent matches with the string
                // of window index 0 (in particular we have to avoid a match
                // of the string with itself at the start of the input file).
                match_length = longest_match(hash_head);
                // longest_match() sets match_start */
                if (match_length > lookahead) {
                    match_length = lookahead;
                }

                // Ignore a length 3 match if it is too distant: */
                if (match_length === MIN_MATCH && strstart - match_start > TOO_FAR) {
                    // If prev_match is also MIN_MATCH, match_start is garbage
                    // but we will ignore the current match anyway.
                    match_length--;
                }
            }
            // If there was a match at the previous step and the current
            // match is not better, output the previous match:
            if (prev_length >= MIN_MATCH && match_length <= prev_length) {
                var flush; // set if current block must be flushed

                // check_match(strstart - 1, prev_match, prev_length);
                flush = ct_tally(strstart - 1 - prev_match, prev_length - MIN_MATCH);

                // Insert in hash table all strings up to the end of the match.
                // strstart-1 and strstart are already inserted.
                lookahead -= prev_length - 1;
                prev_length -= 2;
                do {
                    strstart++;
                    INSERT_STRING();
                    // strstart never exceeds WSIZE-MAX_MATCH, so there are
                    // always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
                    // these bytes are garbage, but it does not matter since the
                    // next lookahead bytes will always be emitted as literals.
                } while (--prev_length !== 0);
                match_available = false;
                match_length = MIN_MATCH - 1;
                strstart++;
                if (flush) {
                    flush_block(0);
                    block_start = strstart;
                }
            } else if (match_available) {
                // If there was no match at the previous position, output a
                // single literal. If there was a match but the current match
                // is longer, truncate the previous match to a single literal.
                if (ct_tally(0, window[strstart - 1] & 0xff)) {
                    flush_block(0);
                    block_start = strstart;
                }
                strstart++;
                lookahead--;
            } else {
                // There is no previous match to compare with, wait for
                // the next step to decide.
                match_available = true;
                strstart++;
                lookahead--;
            }

            // Make sure that we always have enough lookahead, except
            // at the end of the input file. We need MAX_MATCH bytes
            // for the next match, plus MIN_MATCH bytes to insert the
            // string following the next match.
            while (lookahead < MIN_LOOKAHEAD && !eofile) {
                fill_window();
            }
        }
    }

    function init_deflate() {
        if (eofile) {
            return;
        }
        bi_buf = 0;
        bi_valid = 0;
        ct_init();
        lm_init();

        qhead = null;
        outcnt = 0;
        outoff = 0;

        if (compr_level <= 3) {
            prev_length = MIN_MATCH - 1;
            match_length = 0;
        } else {
            match_length = MIN_MATCH - 1;
            match_available = false;
        }

        complete = false;
    }

    /* ==========================================================================
     * Same as above, but achieves better compression. We use a lazy
     * evaluation for matches: a match is finally adopted only if there is
     * no better match at the next window position.
     */
    function deflate_internal(buff, off, buff_size) {
        var n;

        if (!initflag) {
            init_deflate();
            initflag = true;
            if (lookahead === 0) { // empty
                complete = true;
                return 0;
            }
        }

        n = qcopy(buff, off, buff_size);
        if (n === buff_size) {
            return buff_size;
        }

        if (complete) {
            return n;
        }

        if (compr_level <= 3) {
            // optimized for speed
            deflate_fast();
        } else {
            deflate_better();
        }

        if (lookahead === 0) {
            if (match_available) {
                ct_tally(0, window[strstart - 1] & 0xff);
            }
            flush_block(1);
            complete = true;
        }

        return n + qcopy(buff, n + off, buff_size - n);
    }

    function qcopy(buff, off, buff_size) {
        var n, i, j;

        n = 0;
        while (qhead !== null && n < buff_size) {
            i = buff_size - n;
            if (i > qhead.len) {
                i = qhead.len;
            }
            // System.arraycopy(qhead.ptr, qhead.off, buff, off + n, i);
            for (j = 0; j < i; j++) {
                buff[off + n + j] = qhead.ptr[qhead.off + j];
            }

            qhead.off += i;
            qhead.len -= i;
            n += i;
            if (qhead.len === 0) {
                var p;
                p = qhead;
                qhead = qhead.next;
                reuse_queue(p);
            }
        }

        if (n === buff_size) {
            return n;
        }

        if (outoff < outcnt) {
            i = buff_size - n;
            if (i > outcnt - outoff) {
                i = outcnt - outoff;
            }
            // System.arraycopy(outbuf, outoff, buff, off + n, i);
            for (j = 0; j < i; j++) {
                buff[off + n + j] = outbuf[outoff + j];
            }
            outoff += i;
            n += i;
            if (outcnt === outoff) {
                outcnt = outoff = 0;
            }
        }
        return n;
    }

    /* ==========================================================================
     * Allocate the match buffer, initialize the various tables and save the
     * location of the internal file attribute (ascii/binary) and method
     * (DEFLATE/STORE).
     */
    function ct_init() {
        var n; // iterates over tree elements
        var bits; // bit counter
        var length; // length value
        var code; // code value
        var dist; // distance index

        if (static_dtree[0].dl !== 0) {
            return; // ct_init already called
        }

        l_desc.dyn_tree = dyn_ltree;
        l_desc.static_tree = static_ltree;
        l_desc.extra_bits = extra_lbits;
        l_desc.extra_base = LITERALS + 1;
        l_desc.elems = L_CODES;
        l_desc.max_length = MAX_BITS;
        l_desc.max_code = 0;

        d_desc.dyn_tree = dyn_dtree;
        d_desc.static_tree = static_dtree;
        d_desc.extra_bits = extra_dbits;
        d_desc.extra_base = 0;
        d_desc.elems = D_CODES;
        d_desc.max_length = MAX_BITS;
        d_desc.max_code = 0;

        bl_desc.dyn_tree = bl_tree;
        bl_desc.static_tree = null;
        bl_desc.extra_bits = extra_blbits;
        bl_desc.extra_base = 0;
        bl_desc.elems = BL_CODES;
        bl_desc.max_length = MAX_BL_BITS;
        bl_desc.max_code = 0;

     // Initialize the mapping length (0..255) -> length code (0..28)
        length = 0;
        for (code = 0; code < LENGTH_CODES - 1; code++) {
            base_length[code] = length;
            for (n = 0; n < (1 << extra_lbits[code]); n++) {
                length_code[length++] = code;
            }
        }
     // Assert (length === 256, "ct_init: length !== 256");

        // Note that the length 255 (match length 258) can be represented
        // in two different ways: code 284 + 5 bits or code 285, so we
        // overwrite length_code[255] to use the best encoding:
        length_code[length - 1] = code;

        // Initialize the mapping dist (0..32K) -> dist code (0..29) */
        dist = 0;
        for (code = 0; code < 16; code++) {
            base_dist[code] = dist;
            for (n = 0; n < (1 << extra_dbits[code]); n++) {
                dist_code[dist++] = code;
            }
        }
        // Assert (dist === 256, "ct_init: dist !== 256");
        // from now on, all distances are divided by 128
        for (dist >>= 7; code < D_CODES; code++) {
            base_dist[code] = dist << 7;
            for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
                dist_code[256 + dist++] = code;
            }
        }
        // Assert (dist === 256, "ct_init: 256+dist !== 512");

        // Construct the codes of the static literal tree
        for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
        }
        n = 0;
        while (n <= 143) {
            static_ltree[n++].dl = 8;
            bl_count[8]++;
        }
        while (n <= 255) {
            static_ltree[n++].dl = 9;
            bl_count[9]++;
        }
        while (n <= 279) {
            static_ltree[n++].dl = 7;
            bl_count[7]++;
        }
        while (n <= 287) {
            static_ltree[n++].dl = 8;
            bl_count[8]++;
        }
        // Codes 286 and 287 do not exist, but we must include them in the
        // tree construction to get a canonical Huffman tree (longest code
        // all ones)
        gen_codes(static_ltree, L_CODES + 1);

        // The static distance tree is trivial: */
        for (n = 0; n < D_CODES; n++) {
            static_dtree[n].dl = 5;
            static_dtree[n].fc = bi_reverse(n, 5);
        }

        // Initialize the first block of the first file:
        init_block();
    }

    /* ==========================================================================
     * Initialize a new block.
     */
    function init_block() {
        var n; // iterates over tree elements

        // Initialize the trees.
        for (n = 0; n < L_CODES;  n++) {
            dyn_ltree[n].fc = 0;
        }
        for (n = 0; n < D_CODES;  n++) {
            dyn_dtree[n].fc = 0;
        }
        for (n = 0; n < BL_CODES; n++) {
            bl_tree[n].fc = 0;
        }

        dyn_ltree[END_BLOCK].fc = 1;
        opt_len = static_len = 0;
        last_lit = last_dist = last_flags = 0;
        flags = 0;
        flag_bit = 1;
    }

    /* ==========================================================================
     * Restore the heap property by moving down the tree starting at node k,
     * exchanging a node with the smallest of its two sons if necessary, stopping
     * when the heap property is re-established (each father smaller than its
     * two sons).
     *
     * @param tree- tree to restore
     * @param k- node to move down
     */
    function pqdownheap(tree, k) {
        var v = heap[k],
            j = k << 1; // left son of k

        while (j <= heap_len) {
            // Set j to the smallest of the two sons:
            if (j < heap_len && SMALLER(tree, heap[j + 1], heap[j])) {
                j++;
            }

            // Exit if v is smaller than both sons
            if (SMALLER(tree, v, heap[j])) {
                break;
            }

            // Exchange v with the smallest son
            heap[k] = heap[j];
            k = j;

            // And continue down the tree, setting j to the left son of k
            j <<= 1;
        }
        heap[k] = v;
    }

    /* ==========================================================================
     * Compute the optimal bit lengths for a tree and update the total bit length
     * for the current block.
     * IN assertion: the fields freq and dad are set, heap[heap_max] and
     *    above are the tree nodes sorted by increasing frequency.
     * OUT assertions: the field len is set to the optimal bit length, the
     *     array bl_count contains the frequencies for each bit length.
     *     The length opt_len is updated; static_len is also updated if stree is
     *     not null.
     */
    function gen_bitlen(desc) { // the tree descriptor
        var tree = desc.dyn_tree;
        var extra = desc.extra_bits;
        var base = desc.extra_base;
        var max_code = desc.max_code;
        var max_length = desc.max_length;
        var stree = desc.static_tree;
        var h; // heap index
        var n, m; // iterate over the tree elements
        var bits; // bit length
        var xbits; // extra bits
        var f; // frequency
        var overflow = 0; // number of elements with bit length too large

        for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
        }

        // In a first pass, compute the optimal bit lengths (which may
        // overflow in the case of the bit length tree).
        tree[heap[heap_max]].dl = 0; // root of the heap

        for (h = heap_max + 1; h < HEAP_SIZE; h++) {
            n = heap[h];
            bits = tree[tree[n].dl].dl + 1;
            if (bits > max_length) {
                bits = max_length;
                overflow++;
            }
            tree[n].dl = bits;
            // We overwrite tree[n].dl which is no longer needed

            if (n > max_code) {
                continue; // not a leaf node
            }

            bl_count[bits]++;
            xbits = 0;
            if (n >= base) {
                xbits = extra[n - base];
            }
            f = tree[n].fc;
            opt_len += f * (bits + xbits);
            if (stree !== null) {
                static_len += f * (stree[n].dl + xbits);
            }
        }
        if (overflow === 0) {
            return;
        }

        // This happens for example on obj2 and pic of the Calgary corpus

        // Find the first bit length which could increase:
        do {
            bits = max_length - 1;
            while (bl_count[bits] === 0) {
                bits--;
            }
            bl_count[bits]--; // move one leaf down the tree
            bl_count[bits + 1] += 2; // move one overflow item as its brother
            bl_count[max_length]--;
            // The brother of the overflow item also moves one step up,
            // but this does not affect bl_count[max_length]
            overflow -= 2;
        } while (overflow > 0);

        // Now recompute all bit lengths, scanning in increasing frequency.
        // h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
        // lengths instead of fixing only the wrong ones. This idea is taken
        // from 'ar' written by Haruhiko Okumura.)
        for (bits = max_length; bits !== 0; bits--) {
            n = bl_count[bits];
            while (n !== 0) {
                m = heap[--h];
                if (m > max_code) {
                    continue;
                }
                if (tree[m].dl !== bits) {
                    opt_len += (bits - tree[m].dl) * tree[m].fc;
                    tree[m].fc = bits;
                }
                n--;
            }
        }
    }

      /* ==========================================================================
       * Generate the codes for a given tree and bit counts (which need not be
       * optimal).
       * IN assertion: the array bl_count contains the bit length statistics for
       * the given tree and the field len is set for all tree elements.
       * OUT assertion: the field code is set for all tree elements of non
       *     zero code length.
       * @param tree- the tree to decorate
       * @param max_code- largest code with non-zero frequency
       */
    function gen_codes(tree, max_code) {
        var next_code = []; // new Array(MAX_BITS + 1); // next code value for each bit length
        var code = 0; // running code value
        var bits; // bit index
        var n; // code index

        // The distribution counts are first used to generate the code values
        // without bit reversal.
        for (bits = 1; bits <= MAX_BITS; bits++) {
            code = ((code + bl_count[bits - 1]) << 1);
            next_code[bits] = code;
        }

        // Check that the bit counts in bl_count are consistent. The last code
        // must be all ones.
        // Assert (code + encoder->bl_count[MAX_BITS]-1 === (1<<MAX_BITS)-1, "inconsistent bit counts");
        // Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

        for (n = 0; n <= max_code; n++) {
            var len = tree[n].dl;
            if (len === 0) {
                continue;
            }
            // Now reverse the bits
            tree[n].fc = bi_reverse(next_code[len]++, len);

            // Tracec(tree !== static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ", n, (isgraph(n) ? n : ' '), len, tree[n].fc, next_code[len]-1));
        }
    }

    /* ==========================================================================
     * Construct one Huffman tree and assigns the code bit strings and lengths.
     * Update the total bit length for the current block.
     * IN assertion: the field freq is set for all tree elements.
     * OUT assertions: the fields len and code are set to the optimal bit length
     *     and corresponding code. The length opt_len is updated; static_len is
     *     also updated if stree is not null. The field max_code is set.
     */
    function build_tree(desc) { // the tree descriptor
        var tree = desc.dyn_tree;
        var stree = desc.static_tree;
        var elems = desc.elems;
        var n, m; // iterate over heap elements
        var max_code = -1; // largest code with non zero frequency
        var node = elems; // next internal node of the tree

        // Construct the initial heap, with least frequent element in
        // heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
        // heap[0] is not used.
        heap_len = 0;
        heap_max = HEAP_SIZE;

        for (n = 0; n < elems; n++) {
            if (tree[n].fc !== 0) {
                heap[++heap_len] = max_code = n;
                depth[n] = 0;
            } else {
                tree[n].dl = 0;
            }
        }

        // The pkzip format requires that at least one distance code exists,
        // and that at least one bit should be sent even if there is only one
        // possible code. So to avoid special checks later on we force at least
        // two codes of non zero frequency.
        while (heap_len < 2) {
            var xnew = heap[++heap_len] = (max_code < 2 ? ++max_code : 0);
            tree[xnew].fc = 1;
            depth[xnew] = 0;
            opt_len--;
            if (stree !== null) {
                static_len -= stree[xnew].dl;
            }
            // new is 0 or 1 so it does not have extra bits
        }
        desc.max_code = max_code;

        // The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
        // establish sub-heaps of increasing lengths:
        for (n = heap_len >> 1; n >= 1; n--) {
            pqdownheap(tree, n);
        }

        // Construct the Huffman tree by repeatedly combining the least two
        // frequent nodes.
        do {
            n = heap[SMALLEST];
            heap[SMALLEST] = heap[heap_len--];
            pqdownheap(tree, SMALLEST);

            m = heap[SMALLEST]; // m = node of next least frequency

            // keep the nodes sorted by frequency
            heap[--heap_max] = n;
            heap[--heap_max] = m;

            // Create a new node father of n and m
            tree[node].fc = tree[n].fc + tree[m].fc;
            //    depth[node] = (char)(MAX(depth[n], depth[m]) + 1);
            if (depth[n] > depth[m] + 1) {
                depth[node] = depth[n];
            } else {
                depth[node] = depth[m] + 1;
            }
            tree[n].dl = tree[m].dl = node;

            // and insert the new node in the heap
            heap[SMALLEST] = node++;
            pqdownheap(tree, SMALLEST);

        } while (heap_len >= 2);

        heap[--heap_max] = heap[SMALLEST];

        // At this point, the fields freq and dad are set. We can now
        // generate the bit lengths.
        gen_bitlen(desc);

        // The field len is now set, we can generate the bit codes
        gen_codes(tree, max_code);
    }

    /* ==========================================================================
     * Scan a literal or distance tree to determine the frequencies of the codes
     * in the bit length tree. Updates opt_len to take into account the repeat
     * counts. (The contribution of the bit length codes will be added later
     * during the construction of bl_tree.)
     *
     * @param tree- the tree to be scanned
     * @param max_code- and its largest code of non zero frequency
     */
    function scan_tree(tree, max_code) {
        var n, // iterates over all tree elements
            prevlen = -1, // last emitted length
            curlen, // length of current code
            nextlen = tree[0].dl, // length of next code
            count = 0, // repeat count of the current code
            max_count = 7, // max repeat count
            min_count = 4; // min repeat count

        if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
        }
        tree[max_code + 1].dl = 0xffff; // guard

        for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[n + 1].dl;
            if (++count < max_count && curlen === nextlen) {
                continue;
            } else if (count < min_count) {
                bl_tree[curlen].fc += count;
            } else if (curlen !== 0) {
                if (curlen !== prevlen) {
                    bl_tree[curlen].fc++;
                }
                bl_tree[REP_3_6].fc++;
            } else if (count <= 10) {
                bl_tree[REPZ_3_10].fc++;
            } else {
                bl_tree[REPZ_11_138].fc++;
            }
            count = 0; prevlen = curlen;
            if (nextlen === 0) {
                max_count = 138;
                min_count = 3;
            } else if (curlen === nextlen) {
                max_count = 6;
                min_count = 3;
            } else {
                max_count = 7;
                min_count = 4;
            }
        }
    }

    /* ==========================================================================
     * Send a literal or distance tree in compressed form, using the codes in
     * bl_tree.
     *
     * @param tree- the tree to be scanned
     * @param max_code- and its largest code of non zero frequency
     */
    function send_tree(tree, max_code) {
        var n; // iterates over all tree elements
        var prevlen = -1; // last emitted length
        var curlen; // length of current code
        var nextlen = tree[0].dl; // length of next code
        var count = 0; // repeat count of the current code
        var max_count = 7; // max repeat count
        var min_count = 4; // min repeat count

        // tree[max_code+1].dl = -1; */  /* guard already set */
        if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
        }

        for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[n + 1].dl;
            if (++count < max_count && curlen === nextlen) {
                continue;
            } else if (count < min_count) {
                do {
                    SEND_CODE(curlen, bl_tree);
                } while (--count !== 0);
            } else if (curlen !== 0) {
                if (curlen !== prevlen) {
                    SEND_CODE(curlen, bl_tree);
                    count--;
                }
            // Assert(count >= 3 && count <= 6, " 3_6?");
                SEND_CODE(REP_3_6, bl_tree);
                send_bits(count - 3, 2);
            } else if (count <= 10) {
                SEND_CODE(REPZ_3_10, bl_tree);
                send_bits(count - 3, 3);
            } else {
                SEND_CODE(REPZ_11_138, bl_tree);
                send_bits(count - 11, 7);
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
                max_count = 138;
                min_count = 3;
            } else if (curlen === nextlen) {
                max_count = 6;
                min_count = 3;
            } else {
                max_count = 7;
                min_count = 4;
            }
        }
    }

    /* ==========================================================================
     * Construct the Huffman tree for the bit lengths and return the index in
     * bl_order of the last bit length code to send.
     */
    function build_bl_tree() {
        var max_blindex; // index of last bit length code of non zero freq

        // Determine the bit length frequencies for literal and distance trees
        scan_tree(dyn_ltree, l_desc.max_code);
        scan_tree(dyn_dtree, d_desc.max_code);

        // Build the bit length tree:
        build_tree(bl_desc);
        // opt_len now includes the length of the tree representations, except
        // the lengths of the bit lengths codes and the 5+5+4 bits for the counts.

        // Determine the number of bit length codes to send. The pkzip format
        // requires that at least 4 bit length codes be sent. (appnote.txt says
        // 3 but the actual value used is 4.)
        for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
            if (bl_tree[bl_order[max_blindex]].dl !== 0) {
                break;
            }
        }
        // Update opt_len to include the bit length tree and counts */
        opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
        // Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
        // encoder->opt_len, encoder->static_len));

        return max_blindex;
    }

    /* ==========================================================================
     * Send the header for a block using dynamic Huffman trees: the counts, the
     * lengths of the bit length codes, the literal tree and the distance tree.
     * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
     */
    function send_all_trees(lcodes, dcodes, blcodes) { // number of codes for each tree
        var rank; // index in bl_order

        // Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
        // Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES, "too many codes");
        // Tracev((stderr, "\nbl counts: "));
        send_bits(lcodes - 257, 5); // not +255 as stated in appnote.txt
        send_bits(dcodes - 1,   5);
        send_bits(blcodes - 4,  4); // not -3 as stated in appnote.txt
        for (rank = 0; rank < blcodes; rank++) {
            // Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
            send_bits(bl_tree[bl_order[rank]].dl, 3);
        }

        // send the literal tree
        send_tree(dyn_ltree, lcodes - 1);

        // send the distance tree
        send_tree(dyn_dtree, dcodes - 1);
    }

    /* ==========================================================================
     * Determine the best encoding for the current block: dynamic trees, static
     * trees or store, and output the encoded block to the zip file.
     */
    function flush_block(eof) { // true if this is the last block for a file
        var opt_lenb, static_lenb, // opt_len and static_len in bytes
            max_blindex, // index of last bit length code of non zero freq
            stored_len, // length of input block
            i;

        stored_len = strstart - block_start;
        flag_buf[last_flags] = flags; // Save the flags for the last 8 items

        // Construct the literal and distance trees
        build_tree(l_desc);
        // Tracev((stderr, "\nlit data: dyn %ld, stat %ld",
        // encoder->opt_len, encoder->static_len));

        build_tree(d_desc);
        // Tracev((stderr, "\ndist data: dyn %ld, stat %ld",
        // encoder->opt_len, encoder->static_len));
        // At this point, opt_len and static_len are the total bit lengths of
        // the compressed block data, excluding the tree representations.

        // Build the bit length tree for the above two trees, and get the index
        // in bl_order of the last bit length code to send.
        max_blindex = build_bl_tree();

     // Determine the best encoding. Compute first the block length in bytes
        opt_lenb = (opt_len + 3 + 7) >> 3;
        static_lenb = (static_len + 3 + 7) >> 3;

    //  Trace((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u dist %u ", opt_lenb, encoder->opt_len, static_lenb, encoder->static_len, stored_len, encoder->last_lit, encoder->last_dist));

        if (static_lenb <= opt_lenb) {
            opt_lenb = static_lenb;
        }
        if (stored_len + 4 <= opt_lenb && block_start >= 0) { // 4: two words for the lengths
            // The test buf !== NULL is only necessary if LIT_BUFSIZE > WSIZE.
            // Otherwise we can't have processed more than WSIZE input bytes since
            // the last block flush, because compression would have been
            // successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
            // transform a block into a stored block.
            send_bits((STORED_BLOCK << 1) + eof, 3);  /* send block type */
            bi_windup();         /* align on byte boundary */
            put_short(stored_len);
            put_short(~stored_len);

            // copy block
            /*
                p = &window[block_start];
                for (i = 0; i < stored_len; i++) {
                    put_byte(p[i]);
                }
            */
            for (i = 0; i < stored_len; i++) {
                put_byte(window[block_start + i]);
            }
        } else if (static_lenb === opt_lenb) {
            send_bits((STATIC_TREES << 1) + eof, 3);
            compress_block(static_ltree, static_dtree);
        } else {
            send_bits((DYN_TREES << 1) + eof, 3);
            send_all_trees(l_desc.max_code + 1, d_desc.max_code + 1, max_blindex + 1);
            compress_block(dyn_ltree, dyn_dtree);
        }

        init_block();

        if (eof !== 0) {
            bi_windup();
        }
    }

    /* ==========================================================================
     * Save the match info and tally the frequency counts. Return true if
     * the current block must be flushed.
     *
     * @param dist- distance of matched string
     * @param lc- (match length - MIN_MATCH) or unmatched char (if dist === 0)
     */
    function ct_tally(dist, lc) {
        l_buf[last_lit++] = lc;
        if (dist === 0) {
            // lc is the unmatched char
            dyn_ltree[lc].fc++;
        } else {
            // Here, lc is the match length - MIN_MATCH
            dist--; // dist = match distance - 1
            // Assert((ush)dist < (ush)MAX_DIST && (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) && (ush)D_CODE(dist) < (ush)D_CODES,  "ct_tally: bad match");

            dyn_ltree[length_code[lc] + LITERALS + 1].fc++;
            dyn_dtree[D_CODE(dist)].fc++;

            d_buf[last_dist++] = dist;
            flags |= flag_bit;
        }
        flag_bit <<= 1;

        // Output the flags if they fill a byte
        if ((last_lit & 7) === 0) {
            flag_buf[last_flags++] = flags;
            flags = 0;
            flag_bit = 1;
        }
        // Try to guess if it is profitable to stop the current block here
        if (compr_level > 2 && (last_lit & 0xfff) === 0) {
            // Compute an upper bound for the compressed length
            var out_length = last_lit * 8;
            var in_length = strstart - block_start;
            var dcode;

            for (dcode = 0; dcode < D_CODES; dcode++) {
                out_length += dyn_dtree[dcode].fc * (5 + extra_dbits[dcode]);
            }
            out_length >>= 3;
            // Trace((stderr,"\nlast_lit %u, last_dist %u, in %ld, out ~%ld(%ld%%) ", encoder->last_lit, encoder->last_dist, in_length, out_length, 100L - out_length*100L/in_length));
            if (last_dist < parseInt(last_lit / 2, 10) && out_length < parseInt(in_length / 2, 10)) {
                return true;
            }
        }
        return (last_lit === LIT_BUFSIZE - 1 || last_dist === DIST_BUFSIZE);
        // We avoid equality with LIT_BUFSIZE because of wraparound at 64K
        // on 16 bit machines and because stored blocks are restricted to
        // 64K-1 bytes.
    }

      /* ==========================================================================
       * Send the block data compressed using the given Huffman trees
       *
       * @param ltree- literal tree
       * @param dtree- distance tree
       */
    function compress_block(ltree, dtree) {
        var dist; // distance of matched string
        var lc; // match length or unmatched char (if dist === 0)
        var lx = 0; // running index in l_buf
        var dx = 0; // running index in d_buf
        var fx = 0; // running index in flag_buf
        var flag = 0; // current flags
        var code; // the code to send
        var extra; // number of extra bits to send

        if (last_lit !== 0) {
            do {
                if ((lx & 7) === 0) {
                    flag = flag_buf[fx++];
                }
                lc = l_buf[lx++] & 0xff;
                if ((flag & 1) === 0) {
                    SEND_CODE(lc, ltree); /* send a literal byte */
                    //    Tracecv(isgraph(lc), (stderr," '%c' ", lc));
                } else {
                    // Here, lc is the match length - MIN_MATCH
                    code = length_code[lc];
                    SEND_CODE(code + LITERALS + 1, ltree); // send the length code
                    extra = extra_lbits[code];
                    if (extra !== 0) {
                        lc -= base_length[code];
                        send_bits(lc, extra); // send the extra length bits
                    }
                    dist = d_buf[dx++];
                    // Here, dist is the match distance - 1
                    code = D_CODE(dist);
                    //    Assert (code < D_CODES, "bad d_code");

                    SEND_CODE(code, dtree); // send the distance code
                    extra = extra_dbits[code];
                    if (extra !== 0) {
                        dist -= base_dist[code];
                        send_bits(dist, extra); // send the extra distance bits
                    }
                } // literal or match pair ?
                flag >>= 1;
            } while (lx < last_lit);
        }

        SEND_CODE(END_BLOCK, ltree);
    }

    /* ==========================================================================
     * Send a value on a given number of bits.
     * IN assertion: length <= 16 and value fits in length bits.
     *
     * @param value- value to send
     * @param length- number of bits
     */
    var Buf_size = 16; // bit size of bi_buf
    function send_bits(value, length) {
        // If not enough room in bi_buf, use (valid) bits from bi_buf and
        // (16 - bi_valid) bits from value, leaving (width - (16-bi_valid))
        // unused bits in value.
        if (bi_valid > Buf_size - length) {
            bi_buf |= (value << bi_valid);
            put_short(bi_buf);
            bi_buf = (value >> (Buf_size - bi_valid));
            bi_valid += length - Buf_size;
        } else {
            bi_buf |= value << bi_valid;
            bi_valid += length;
        }
    }

    /* ==========================================================================
     * Reverse the first len bits of a code, using straightforward code (a faster
     * method would use a table)
     * IN assertion: 1 <= len <= 15
     *
     * @param code- the value to invert
     * @param len- its bit length
     */
    function bi_reverse(code, len) {
        var res = 0;
        do {
            res |= code & 1;
            code >>= 1;
            res <<= 1;
        } while (--len > 0);
        return res >> 1;
    }

    /* ==========================================================================
     * Write out any remaining bits in an incomplete byte.
     */
    function bi_windup() {
        if (bi_valid > 8) {
            put_short(bi_buf);
        } else if (bi_valid > 0) {
            put_byte(bi_buf);
        }
        bi_buf = 0;
        bi_valid = 0;
    }

    function qoutbuf() {
        var q, i;
        if (outcnt !== 0) {
            q = new_queue();
            if (qhead === null) {
                qhead = qtail = q;
            } else {
                qtail = qtail.next = q;
            }
            q.len = outcnt - outoff;
            // System.arraycopy(outbuf, outoff, q.ptr, 0, q.len);
            for (i = 0; i < q.len; i++) {
                q.ptr[i] = outbuf[outoff + i];
            }
            outcnt = outoff = 0;
        }
    }

    function deflate(arr, level) {
        var i, j, buff;

        deflate_data = arr;
        deflate_pos = 0;
        if (typeof level === "undefined") {
            level = DEFAULT_LEVEL;
        }
        deflate_start(level);

        buff = [];

        do {
            i = deflate_internal(buff, buff.length, 1024);
        } while (i > 0);

        deflate_data = null; // G.C.
        return buff;
    }

    module.exports = deflate;
    module.exports.DEFAULT_LEVEL = DEFAULT_LEVEL;
}());

},{}],4:[function(require,module,exports){
/*
 * $Id: rawinflate.js,v 0.2 2009/03/01 18:32:24 dankogai Exp $
 *
 * original:
 * http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
 */

/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.0.1
 * LastModified: Dec 25 1999
 */

/* Interface:
 * data = inflate(src);
 */

(function () {
    /* constant parameters */
    var WSIZE = 32768, // Sliding Window size
        STORED_BLOCK = 0,
        STATIC_TREES = 1,
        DYN_TREES = 2,

    /* for inflate */
        lbits = 9, // bits in base literal/length lookup table
        dbits = 6, // bits in base distance lookup table

    /* variables (inflate) */
        slide,
        wp, // current position in slide
        fixed_tl = null, // inflate static
        fixed_td, // inflate static
        fixed_bl, // inflate static
        fixed_bd, // inflate static
        bit_buf, // bit buffer
        bit_len, // bits in bit buffer
        method,
        eof,
        copy_leng,
        copy_dist,
        tl, // literal length decoder table
        td, // literal distance decoder table
        bl, // number of bits decoded by tl
        bd, // number of bits decoded by td

        inflate_data,
        inflate_pos,


/* constant tables (inflate) */
        MASK_BITS = [
            0x0000,
            0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
            0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff
        ],
        // Tables for deflate from PKZIP's appnote.txt.
        // Copy lengths for literal codes 257..285
        cplens = [
            3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
            35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
        ],
/* note: see note #13 above about the 258 in this list. */
        // Extra bits for literal codes 257..285
        cplext = [
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
            3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99 // 99==invalid
        ],
        // Copy offsets for distance codes 0..29
        cpdist = [
            1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
            257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
            8193, 12289, 16385, 24577
        ],
        // Extra bits for distance codes
        cpdext = [
            0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
            7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
            12, 12, 13, 13
        ],
        // Order of the bit length code lengths
        border = [
            16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
        ];
    /* objects (inflate) */

    function HuftList() {
        this.next = null;
        this.list = null;
    }

    function HuftNode() {
        this.e = 0; // number of extra bits or operation
        this.b = 0; // number of bits in this code or subcode

        // union
        this.n = 0; // literal, length base, or distance base
        this.t = null; // (HuftNode) pointer to next level of table
    }

    /*
     * @param b-  code lengths in bits (all assumed <= BMAX)
     * @param n- number of codes (assumed <= N_MAX)
     * @param s- number of simple-valued codes (0..s-1)
     * @param d- list of base values for non-simple codes
     * @param e- list of extra bits for non-simple codes
     * @param mm- maximum lookup bits
     */
    function HuftBuild(b, n, s, d, e, mm) {
        this.BMAX = 16; // maximum bit length of any code
        this.N_MAX = 288; // maximum number of codes in any set
        this.status = 0; // 0: success, 1: incomplete table, 2: bad input
        this.root = null; // (HuftList) starting table
        this.m = 0; // maximum lookup bits, returns actual

    /* Given a list of code lengths and a maximum table size, make a set of
       tables to decode that set of codes. Return zero on success, one if
       the given code set is incomplete (the tables are still built in this
       case), two if the input is invalid (all zero length codes or an
       oversubscribed set of lengths), and three if not enough memory.
       The code with value 256 is special, and the tables are constructed
       so that no bits beyond that code are fetched when that code is
       decoded. */
        var a; // counter for codes of length k
        var c = [];
        var el; // length of EOB code (value 256)
        var f; // i repeats in table every f entries
        var g; // maximum code length
        var h; // table level
        var i; // counter, current code
        var j; // counter
        var k; // number of bits in current code
        var lx = [];
        var p; // pointer into c[], b[], or v[]
        var pidx; // index of p
        var q; // (HuftNode) points to current table
        var r = new HuftNode(); // table entry for structure assignment
        var u = [];
        var v = [];
        var w;
        var x = [];
        var xp; // pointer into x or c
        var y; // number of dummy codes added
        var z; // number of entries in current table
        var o;
        var tail; // (HuftList)

        tail = this.root = null;

        // bit length count table
        for (i = 0; i < this.BMAX + 1; i++) {
            c[i] = 0;
        }
        // stack of bits per table
        for (i = 0; i < this.BMAX + 1; i++) {
            lx[i] = 0;
        }
        // HuftNode[BMAX][]  table stack
        for (i = 0; i < this.BMAX; i++) {
            u[i] = null;
        }
        // values in order of bit length
        for (i = 0; i < this.N_MAX; i++) {
            v[i] = 0;
        }
        // bit offsets, then code stack
        for (i = 0; i < this.BMAX + 1; i++) {
            x[i] = 0;
        }

        // Generate counts for each bit length
        el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
        p = b; pidx = 0;
        i = n;
        do {
            c[p[pidx]]++; // assume all entries <= BMAX
            pidx++;
        } while (--i > 0);
        if (c[0] === n) { // null input--all zero length codes
            this.root = null;
            this.m = 0;
            this.status = 0;
            return;
        }

        // Find minimum and maximum length, bound *m by those
        for (j = 1; j <= this.BMAX; j++) {
            if (c[j] !== 0) {
                break;
            }
        }
        k = j; // minimum code length
        if (mm < j) {
            mm = j;
        }
        for (i = this.BMAX; i !== 0; i--) {
            if (c[i] !== 0) {
                break;
            }
        }
        g = i; // maximum code length
        if (mm > i) {
            mm = i;
        }

        // Adjust last length count to fill out codes, if needed
        for (y = 1 << j; j < i; j++, y <<= 1) {
            if ((y -= c[j]) < 0) {
                this.status = 2; // bad input: more codes than bits
                this.m = mm;
                return;
            }
        }
        if ((y -= c[i]) < 0) {
            this.status = 2;
            this.m = mm;
            return;
        }
        c[i] += y;

        // Generate starting offsets into the value table for each length
        x[1] = j = 0;
        p = c;
        pidx = 1;
        xp = 2;
        while (--i > 0) { // note that i == g from above
            x[xp++] = (j += p[pidx++]);
        }

        // Make a table of values in order of bit lengths
        p = b; pidx = 0;
        i = 0;
        do {
            if ((j = p[pidx++]) !== 0) {
                v[x[j]++] = i;
            }
        } while (++i < n);
        n = x[g]; // set n to length of v

        // Generate the Huffman codes and for each, make the table entries
        x[0] = i = 0; // first Huffman code is zero
        p = v; pidx = 0; // grab values in bit order
        h = -1; // no tables yet--level -1
        w = lx[0] = 0; // no bits decoded yet
        q = null; // ditto
        z = 0; // ditto

        // go through the bit lengths (k already is bits in shortest code)
        for (null; k <= g; k++) {
            a = c[k];
            while (a-- > 0) {
                // here i is the Huffman code of length k bits for value p[pidx]
                // make tables up to required level
                while (k > w + lx[1 + h]) {
                    w += lx[1 + h]; // add bits already decoded
                    h++;

                    // compute minimum size table less than or equal to *m bits
                    z = (z = g - w) > mm ? mm : z; // upper limit
                    if ((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
                        // too few codes for k-w bit table
                        f -= a + 1; // deduct codes from patterns left
                        xp = k;
                        while (++j < z) { // try smaller tables up to z bits
                            if ((f <<= 1) <= c[++xp]) {
                                break; // enough codes to use up j bits
                            }
                            f -= c[xp]; // else deduct codes from patterns
                        }
                    }
                    if (w + j > el && w < el) {
                        j = el - w; // make EOB code end at table
                    }
                    z = 1 << j; // table entries for j-bit table
                    lx[1 + h] = j; // set table size in stack

                    // allocate and link in new table
                    q = [];
                    for (o = 0; o < z; o++) {
                        q[o] = new HuftNode();
                    }

                    if (!tail) {
                        tail = this.root = new HuftList();
                    } else {
                        tail = tail.next = new HuftList();
                    }
                    tail.next = null;
                    tail.list = q;
                    u[h] = q; // table starts after link

                    /* connect to last table, if there is one */
                    if (h > 0) {
                        x[h] = i; // save pattern for backing up
                        r.b = lx[h]; // bits to dump before this table
                        r.e = 16 + j; // bits in this table
                        r.t = q; // pointer to this table
                        j = (i & ((1 << w) - 1)) >> (w - lx[h]);
                        u[h - 1][j].e = r.e;
                        u[h - 1][j].b = r.b;
                        u[h - 1][j].n = r.n;
                        u[h - 1][j].t = r.t;
                    }
                }

                // set up table entry in r
                r.b = k - w;
                if (pidx >= n) {
                    r.e = 99; // out of values--invalid code
                } else if (p[pidx] < s) {
                    r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
                    r.n = p[pidx++]; // simple code is just the value
                } else {
                    r.e = e[p[pidx] - s]; // non-simple--look up in lists
                    r.n = d[p[pidx++] - s];
                }

                // fill code-like entries with r //
                f = 1 << (k - w);
                for (j = i >> w; j < z; j += f) {
                    q[j].e = r.e;
                    q[j].b = r.b;
                    q[j].n = r.n;
                    q[j].t = r.t;
                }

                // backwards increment the k-bit code i
                for (j = 1 << (k - 1); (i & j) !== 0; j >>= 1) {
                    i ^= j;
                }
                i ^= j;

                // backup over finished tables
                while ((i & ((1 << w) - 1)) !== x[h]) {
                    w -= lx[h]; // don't need to update q
                    h--;
                }
            }
        }

        /* return actual size of base table */
        this.m = lx[1];

        /* Return true (1) if we were given an incomplete table */
        this.status = ((y !== 0 && g !== 1) ? 1 : 0);
    }


    /* routines (inflate) */

    function GET_BYTE() {
        if (inflate_data.length === inflate_pos) {
            return -1;
        }
        return inflate_data[inflate_pos++] & 0xff;
    }

    function NEEDBITS(n) {
        while (bit_len < n) {
            bit_buf |= GET_BYTE() << bit_len;
            bit_len += 8;
        }
    }

    function GETBITS(n) {
        return bit_buf & MASK_BITS[n];
    }

    function DUMPBITS(n) {
        bit_buf >>= n;
        bit_len -= n;
    }

    function inflate_codes(buff, off, size) {
        // inflate (decompress) the codes in a deflated (compressed) block.
        // Return an error code or zero if it all goes ok.
        var e; // table entry flag/number of extra bits
        var t; // (HuftNode) pointer to table entry
        var n;

        if (size === 0) {
            return 0;
        }

        // inflate the coded data
        n = 0;
        for (;;) { // do until end of block
            NEEDBITS(bl);
            t = tl.list[GETBITS(bl)];
            e = t.e;
            while (e > 16) {
                if (e === 99) {
                    return -1;
                }
                DUMPBITS(t.b);
                e -= 16;
                NEEDBITS(e);
                t = t.t[GETBITS(e)];
                e = t.e;
            }
            DUMPBITS(t.b);

            if (e === 16) { // then it's a literal
                wp &= WSIZE - 1;
                buff[off + n++] = slide[wp++] = t.n;
                if (n === size) {
                    return size;
                }
                continue;
            }

            // exit if end of block
            if (e === 15) {
                break;
            }

            // it's an EOB or a length

            // get length of block to copy
            NEEDBITS(e);
            copy_leng = t.n + GETBITS(e);
            DUMPBITS(e);

            // decode distance of block to copy
            NEEDBITS(bd);
            t = td.list[GETBITS(bd)];
            e = t.e;

            while (e > 16) {
                if (e === 99) {
                    return -1;
                }
                DUMPBITS(t.b);
                e -= 16;
                NEEDBITS(e);
                t = t.t[GETBITS(e)];
                e = t.e;
            }
            DUMPBITS(t.b);
            NEEDBITS(e);
            copy_dist = wp - t.n - GETBITS(e);
            DUMPBITS(e);

            // do the copy
            while (copy_leng > 0 && n < size) {
                copy_leng--;
                copy_dist &= WSIZE - 1;
                wp &= WSIZE - 1;
                buff[off + n++] = slide[wp++] = slide[copy_dist++];
            }

            if (n === size) {
                return size;
            }
        }

        method = -1; // done
        return n;
    }

    function inflate_stored(buff, off, size) {
        /* "decompress" an inflated type 0 (stored) block. */
        var n;

        // go to byte boundary
        n = bit_len & 7;
        DUMPBITS(n);

        // get the length and its complement
        NEEDBITS(16);
        n = GETBITS(16);
        DUMPBITS(16);
        NEEDBITS(16);
        if (n !== ((~bit_buf) & 0xffff)) {
            return -1; // error in compressed data
        }
        DUMPBITS(16);

        // read and output the compressed data
        copy_leng = n;

        n = 0;
        while (copy_leng > 0 && n < size) {
            copy_leng--;
            wp &= WSIZE - 1;
            NEEDBITS(8);
            buff[off + n++] = slide[wp++] = GETBITS(8);
            DUMPBITS(8);
        }

        if (copy_leng === 0) {
            method = -1; // done
        }
        return n;
    }

    function inflate_fixed(buff, off, size) {
        // decompress an inflated type 1 (fixed Huffman codes) block.  We should
        // either replace this with a custom decoder, or at least precompute the
        // Huffman tables.

        // if first time, set up tables for fixed blocks
        if (!fixed_tl) {
            var i; // temporary variable
            var l = []; // 288 length list for huft_build (initialized below)
            var h; // HuftBuild

            // literal table
            for (i = 0; i < 144; i++) {
                l[i] = 8;
            }
            for (null; i < 256; i++) {
                l[i] = 9;
            }
            for (null; i < 280; i++) {
                l[i] = 7;
            }
            for (null; i < 288; i++) { // make a complete, but wrong code set
                l[i] = 8;
            }
            fixed_bl = 7;

            h = new HuftBuild(l, 288, 257, cplens, cplext, fixed_bl);
            if (h.status !== 0) {
                console.error("HufBuild error: " + h.status);
                return -1;
            }
            fixed_tl = h.root;
            fixed_bl = h.m;

            // distance table
            for (i = 0; i < 30; i++) { // make an incomplete code set
                l[i] = 5;
            }
            fixed_bd = 5;

            h = new HuftBuild(l, 30, 0, cpdist, cpdext, fixed_bd);
            if (h.status > 1) {
                fixed_tl = null;
                console.error("HufBuild error: " + h.status);
                return -1;
            }
            fixed_td = h.root;
            fixed_bd = h.m;
        }

        tl = fixed_tl;
        td = fixed_td;
        bl = fixed_bl;
        bd = fixed_bd;
        return inflate_codes(buff, off, size);
    }

    function inflate_dynamic(buff, off, size) {
        // decompress an inflated type 2 (dynamic Huffman codes) block.
        var i; // temporary variables
        var j;
        var l; // last length
        var n; // number of lengths to get
        var t; // (HuftNode) literal/length code table
        var nb; // number of bit length codes
        var nl; // number of literal/length codes
        var nd; // number of distance codes
        var ll = [];
        var h; // (HuftBuild)

        // literal/length and distance code lengths
        for (i = 0; i < 286 + 30; i++) {
            ll[i] = 0;
        }

        // read in table lengths
        NEEDBITS(5);
        nl = 257 + GETBITS(5); // number of literal/length codes
        DUMPBITS(5);
        NEEDBITS(5);
        nd = 1 + GETBITS(5); // number of distance codes
        DUMPBITS(5);
        NEEDBITS(4);
        nb = 4 + GETBITS(4); // number of bit length codes
        DUMPBITS(4);
        if (nl > 286 || nd > 30) {
            return -1; // bad lengths
        }

        // read in bit-length-code lengths
        for (j = 0; j < nb; j++) {
            NEEDBITS(3);
            ll[border[j]] = GETBITS(3);
            DUMPBITS(3);
        }
        for (null; j < 19; j++) {
            ll[border[j]] = 0;
        }

        // build decoding table for trees--single level, 7 bit lookup
        bl = 7;
        h = new HuftBuild(ll, 19, 19, null, null, bl);
        if (h.status !== 0) {
            return -1; // incomplete code set
        }

        tl = h.root;
        bl = h.m;

        // read in literal and distance code lengths
        n = nl + nd;
        i = l = 0;
        while (i < n) {
            NEEDBITS(bl);
            t = tl.list[GETBITS(bl)];
            j = t.b;
            DUMPBITS(j);
            j = t.n;
            if (j < 16) { // length of code in bits (0..15)
                ll[i++] = l = j; // save last length in l
            } else if (j === 16) { // repeat last length 3 to 6 times
                NEEDBITS(2);
                j = 3 + GETBITS(2);
                DUMPBITS(2);
                if (i + j > n) {
                    return -1;
                }
                while (j-- > 0) {
                    ll[i++] = l;
                }
            } else if (j === 17) { // 3 to 10 zero length codes
                NEEDBITS(3);
                j = 3 + GETBITS(3);
                DUMPBITS(3);
                if (i + j > n) {
                    return -1;
                }
                while (j-- > 0) {
                    ll[i++] = 0;
                }
                l = 0;
            } else { // j === 18: 11 to 138 zero length codes
                NEEDBITS(7);
                j = 11 + GETBITS(7);
                DUMPBITS(7);
                if (i + j > n) {
                    return -1;
                }
                while (j-- > 0) {
                    ll[i++] = 0;
                }
                l = 0;
            }
        }

        // build the decoding tables for literal/length and distance codes
        bl = lbits;
        h = new HuftBuild(ll, nl, 257, cplens, cplext, bl);
        if (bl === 0) { // no literals or lengths
            h.status = 1;
        }
        if (h.status !== 0) {
            if (h.status !== 1) {
                return -1; // incomplete code set
            }
            // **incomplete literal tree**
        }
        tl = h.root;
        bl = h.m;

        for (i = 0; i < nd; i++) {
            ll[i] = ll[i + nl];
        }
        bd = dbits;
        h = new HuftBuild(ll, nd, 0, cpdist, cpdext, bd);
        td = h.root;
        bd = h.m;

        if (bd === 0 && nl > 257) { // lengths but no distances
            // **incomplete distance tree**
            return -1;
        }
/*
        if (h.status === 1) {
            // **incomplete distance tree**
        }
*/
        if (h.status !== 0) {
            return -1;
        }

        // decompress until an end-of-block code
        return inflate_codes(buff, off, size);
    }

    function inflate_start() {
        if (!slide) {
            slide = []; // new Array(2 * WSIZE); // slide.length is never called
        }
        wp = 0;
        bit_buf = 0;
        bit_len = 0;
        method = -1;
        eof = false;
        copy_leng = copy_dist = 0;
        tl = null;
    }

    function inflate_internal(buff, off, size) {
        // decompress an inflated entry
        var n, i;

        n = 0;
        while (n < size) {
            if (eof && method === -1) {
                return n;
            }

            if (copy_leng > 0) {
                if (method !== STORED_BLOCK) {
                    // STATIC_TREES or DYN_TREES
                    while (copy_leng > 0 && n < size) {
                        copy_leng--;
                        copy_dist &= WSIZE - 1;
                        wp &= WSIZE - 1;
                        buff[off + n++] = slide[wp++] = slide[copy_dist++];
                    }
                } else {
                    while (copy_leng > 0 && n < size) {
                        copy_leng--;
                        wp &= WSIZE - 1;
                        NEEDBITS(8);
                        buff[off + n++] = slide[wp++] = GETBITS(8);
                        DUMPBITS(8);
                    }
                    if (copy_leng === 0) {
                        method = -1; // done
                    }
                }
                if (n === size) {
                    return n;
                }
            }

            if (method === -1) {
                if (eof) {
                    break;
                }

                // read in last block bit
                NEEDBITS(1);
                if (GETBITS(1) !== 0) {
                    eof = true;
                }
                DUMPBITS(1);

                // read in block type
                NEEDBITS(2);
                method = GETBITS(2);
                DUMPBITS(2);
                tl = null;
                copy_leng = 0;
            }

            switch (method) {
            case STORED_BLOCK:
                i = inflate_stored(buff, off + n, size - n);
                break;

            case STATIC_TREES:
                if (tl) {
                    i = inflate_codes(buff, off + n, size - n);
                } else {
                    i = inflate_fixed(buff, off + n, size - n);
                }
                break;

            case DYN_TREES:
                if (tl) {
                    i = inflate_codes(buff, off + n, size - n);
                } else {
                    i = inflate_dynamic(buff, off + n, size - n);
                }
                break;

            default: // error
                i = -1;
                break;
            }

            if (i === -1) {
                if (eof) {
                    return 0;
                }
                return -1;
            }
            n += i;
        }
        return n;
    }

    function inflate(arr) {
        var buff = [], i;

        inflate_start();
        inflate_data = arr;
        inflate_pos = 0;

        do {
            i = inflate_internal(buff, buff.length, 1024);
        } while (i > 0);
        inflate_data = null; // G.C.
        return buff;
    }

    module.exports = inflate;
}());

},{}],5:[function(require,module,exports){
(function () {
    'use strict';

    var crc32 = require('crc32'),
        deflate = require('deflate-js'),
        // magic numbers marking this file as GZIP
        ID1 = 0x1F,
        ID2 = 0x8B,
        compressionMethods = {
            'deflate': 8
        },
        possibleFlags = {
            'FTEXT': 0x01,
            'FHCRC': 0x02,
            'FEXTRA': 0x04,
            'FNAME': 0x08,
            'FCOMMENT': 0x10
        },
        osMap = {
            'fat': 0, // FAT file system (DOS, OS/2, NT) + PKZIPW 2.50 VFAT, NTFS
            'amiga': 1, // Amiga
            'vmz': 2, // VMS (VAX or Alpha AXP)
            'unix': 3, // Unix
            'vm/cms': 4, // VM/CMS
            'atari': 5, // Atari
            'hpfs': 6, // HPFS file system (OS/2, NT 3.x)
            'macintosh': 7, // Macintosh
            'z-system': 8, // Z-System
            'cplm': 9, // CP/M
            'tops-20': 10, // TOPS-20
            'ntfs': 11, // NTFS file system (NT)
            'qdos': 12, // SMS/QDOS
            'acorn': 13, // Acorn RISC OS
            'vfat': 14, // VFAT file system (Win95, NT)
            'vms': 15, // MVS (code also taken for PRIMOS)
            'beos': 16, // BeOS (BeBox or PowerMac)
            'tandem': 17, // Tandem/NSK
            'theos': 18 // THEOS
        },
        os = 'unix',
        DEFAULT_LEVEL = 6;

    function putByte(n, arr) {
        arr.push(n & 0xFF);
    }

    // LSB first
    function putShort(n, arr) {
        arr.push(n & 0xFF);
        arr.push(n >>> 8);
    }

    // LSB first
    function putLong(n, arr) {
        putShort(n & 0xffff, arr);
        putShort(n >>> 16, arr);
    }

    function putString(s, arr) {
        var i, len = s.length;
        for (i = 0; i < len; i += 1) {
            putByte(s.charCodeAt(i), arr);
        }
    }

    function readByte(arr) {
        return arr.shift();
    }

    function readShort(arr) {
        return arr.shift() | (arr.shift() << 8);
    }

    function readLong(arr) {
        var n1 = readShort(arr),
            n2 = readShort(arr);

        // JavaScript can't handle bits in the position 32
        // we'll emulate this by removing the left-most bit (if it exists)
        // and add it back in via multiplication, which does work
        if (n2 > 32768) {
            n2 -= 32768;

            return ((n2 << 16) | n1) + 32768 * Math.pow(2, 16);
        }

        return (n2 << 16) | n1;
    }

    function readString(arr) {
        var charArr = [];

        // turn all bytes into chars until the terminating null
        while (arr[0] !== 0) {
            charArr.push(String.fromCharCode(arr.shift()));
        }

        // throw away terminating null
        arr.shift();

        // join all characters into a cohesive string
        return charArr.join('');
    }

    /*
     * Reads n number of bytes and return as an array.
     *
     * @param arr- Array of bytes to read from
     * @param n- Number of bytes to read
     */
    function readBytes(arr, n) {
        var i, ret = [];
        for (i = 0; i < n; i += 1) {
            ret.push(arr.shift());
        }

        return ret;
    }

    /*
     * ZIPs a file in GZIP format. The format is as given by the spec, found at:
     * http://www.gzip.org/zlib/rfc-gzip.html
     *
     * Omitted parts in this implementation:
     */
    function zip(data, options) {
        var flags = 0,
            level,
            crc, out = [];

        if (!options) {
            options = {};
        }
        level = options.level || DEFAULT_LEVEL;

        if (typeof data === 'string') {
            data = Array.prototype.map.call(data, function (char) {
                return char.charCodeAt(0);
            });
        }

        // magic number marking this file as GZIP
        putByte(ID1, out);
        putByte(ID2, out);

        putByte(compressionMethods['deflate'], out);

        if (options.name) {
            flags |= possibleFlags['FNAME'];
        }

        putByte(flags, out);
        putLong(options.timestamp || parseInt(Date.now() / 1000, 10), out);

        // put deflate args (extra flags)
        if (level === 1) {
            // fastest algorithm
            putByte(4, out);
        } else if (level === 9) {
            // maximum compression (fastest algorithm)
            putByte(2, out);
        } else {
            putByte(0, out);
        }

        // OS identifier
        putByte(osMap[os], out);

        if (options.name) {
            // ignore the directory part
            putString(options.name.substring(options.name.lastIndexOf('/') + 1), out);

            // terminating null
            putByte(0, out);
        }

        deflate.deflate(data, level).forEach(function (byte) {
            putByte(byte, out);
        });

        putLong(parseInt(crc32(data), 16), out);
        putLong(data.length, out);

        return out;
    }

    function unzip(data, options) {
        // start with a copy of the array
        var arr = Array.prototype.slice.call(data, 0),
            t,
            compressionMethod,
            flags,
            mtime,
            xFlags,
            key,
            os,
            crc,
            size,
            res;

        // check the first two bytes for the magic numbers
        if (readByte(arr) !== ID1 || readByte(arr) !== ID2) {
            throw 'Not a GZIP file';
        }

        t = readByte(arr);
        t = Object.keys(compressionMethods).some(function (key) {
            compressionMethod = key;
            return compressionMethods[key] === t;
        });

        if (!t) {
            throw 'Unsupported compression method';
        }

        flags = readByte(arr);
        mtime = readLong(arr);
        xFlags = readByte(arr);
        t = readByte(arr);
        Object.keys(osMap).some(function (key) {
            if (osMap[key] === t) {
                os = key;
                return true;
            }
        });

        // just throw away the bytes for now
        if (flags & possibleFlags['FEXTRA']) {
            t = readShort(arr);
            readBytes(arr, t);
        }

        // just throw away for now
        if (flags & possibleFlags['FNAME']) {
            readString(arr);
        }

        // just throw away for now
        if (flags & possibleFlags['FCOMMENT']) {
            readString(arr);
        }

        // just throw away for now
        if (flags & possibleFlags['FHCRC']) {
            readShort(arr);
        }

        if (compressionMethod === 'deflate') {
            // give deflate everything but the last 8 bytes
            // the last 8 bytes are for the CRC32 checksum and filesize
            res = deflate.inflate(arr.splice(0, arr.length - 8));
        }

        if (flags & possibleFlags['FTEXT']) {
            res = Array.prototype.map.call(res, function (byte) {
                return String.fromCharCode(byte);
            }).join('');
        }

        crc = readLong(arr);
        if (crc !== parseInt(crc32(res), 16)) {
            throw 'Checksum does not match';
        }

        size = readLong(arr);
        if (size !== res.length) {
            throw 'Size of decompressed file not correct';
        }

        return res;
    }

    module.exports = {
        zip: zip,
        unzip: unzip,
        DEFAULT_LEVEL: DEFAULT_LEVEL
    };
}());

},{"crc32":1,"deflate-js":2}],6:[function(require,module,exports){
var gzipjs = require('gzip-js');

var key = "4cPw3ZyC";

var Crypto = {};

Crypto.sha1_hmac = function (msg, key) {
    "use strict";
    var oKeyPad, iKeyPad, iPadRes, bytes, i, len;
    if (key.length > 64) {
        // keys longer than blocksize are shortened
        key = Crypto.sha1(key, true);
    }

    bytes = [];
    len = key.length;
    for (i = 0; i < 64; ++i) {
        bytes[i] = len > i ? key.charCodeAt(i) : 0x00;
    }

    oKeyPad = "";
    iKeyPad = "";

    for (i = 0; i < 64; ++i) {
        oKeyPad += String.fromCharCode(bytes[i] ^ 0x5C);
        iKeyPad += String.fromCharCode(bytes[i] ^ 0x36);
    }

    iPadRes = Crypto.sha1(iKeyPad + msg, true);

    return Crypto.sha1(oKeyPad + iPadRes);
};

Crypto.sha1 = function (msg, raw) {
    function rotate_left(n,s) {
        var t4 = ( n<<s ) | (n>>>(32-s));
        return t4;
    }

    function lsb_hex(val) {
        var str="";
        var i;
        var vh;
        var vl;

        for( i=0; i<=6; i+=2 ) {
            vh = (val>>>(i*4+4))&0x0f;
            vl = (val>>>(i*4))&0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    }

    function cvt_hex(val, raw) {
        var str="";
        var i;
        var v;

        for( i=7; i>=0; i-- ) {
            v = (val>>>(i*4))&0x0f;
            str += raw ? String.fromCharCode(v) : v.toString(16);
        }
        return str;
    }

    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var result, rawResult;

    var msg_len = msg.length;

    var word_array = [];
    for( i=0; i<msg_len-3; i+=4 ) {
        j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
        msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
        word_array.push( j );
    }

    switch( msg_len % 4 ) {
        case 0:
            i = 0x080000000;
        break;
        case 1:
            i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
        break;

        case 2:
            i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
        break;

        case 3:
            i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8    | 0x80;
        break;
    }

    word_array.push( i );

    while( (word_array.length % 16) != 14 ) word_array.push( 0 );

    word_array.push( msg_len>>>29 );
    word_array.push( (msg_len<<3)&0x0ffffffff );

    for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
        for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
        for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for( i= 0; i<=19; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        for( i=20; i<=39; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        for( i=40; i<=59; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        for( i=60; i<=79; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    result = (cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4)).toLowerCase();

    if (!raw) {
        return result;
    }

    rawResult = "";
    while (result.length) {
        rawResult += String.fromCharCode(parseInt(result.substr(0, 2), 16));
        result = result.substr(2);
    }
    return rawResult;
};


var readBinary = function(path) {
    var sh = WScript.CreateObject("WScript.Shell");
    var posh = sh.Exec('powershell -noninteractive -noprofile -Command -');
    var stdin = posh.StdIn;
    stdin.WriteLine('[System.IO.File]::ReadAllBytes("'+path+'") -join \',\'');
    stdin.Close();
    var c = posh.StdOut.ReadAll().split(',');
    var h = [];
    posh.StdErr.ReadAll()
    for (var i = 0; i < c.length; i++) h.push(parseInt(c[i]));
    //var d = "";
    //for (var i = 0; i < c.length; i++) {
    //    d += ('0' + (c[i] & 0xFF).toString(16)).slice(-2).toUpperCase()+((i+1)%16==0?'\n':' ');
    //}
    //WScript.Echo(d);
    return h;
};

var writeBinary = function(path,bytes,isString) {
    var sh = WScript.CreateObject("WScript.Shell");
    var posh = sh.Exec('powershell -noninteractive -noprofile -Command -');
    var stdin = posh.StdIn;
    var b = bytes;
    if (!isString) b = bytes.join(',');
    stdin.WriteLine('[System.IO.File]::WriteAllBytes("'+path+'",@([byte]'+b+')) -join \',\'');
    stdin.Close();
    posh.StdOut.ReadAll();
    posh.StdErr.ReadAll();
};

var testBinary = function() {
    var sh = WScript.CreateObject("WScript.Shell");
    var posh = sh.Exec('powershell -noninteractive -noprofile -Command -');
    var stdin = posh.StdIn;
    stdin.Close();
    posh.StdOut.ReadAll();
    posh.StdErr.ReadAll();
};

// Codepage conversion table
var _c=[199,252,233,226,228,224,229,231,234,235,232,239,238,236,196,197,
        201,230,198,244,246,242,251,249,255,214,220,162,163,165,8359,402,
        225,237,243,250,241,209,170,186,191,8976,172,189,188,161,171,187,
        9617,9618,9619,9474,9508,9569,9570,9558,9557,9571,9553,9559,9565,9564,9563,9488,
        9492,9524,9516,9500,9472,9532,9566,9567,9562,9556,9577,9574,9568,9552,9580,9575,
        9576,9572,9573,9561,9560,9554,9555,9579,9578,9496,9484,9608,9604,9612,9616,9600,
        945,223,915,960,931,963,181,964,934,920,937,948,8734,966,949,8745,
        8801,177,8805,8804,8992,8993,247,8776,176,8729,183,8730,8319,178,9632,160],
    _w=[],
    _r=[];

// Create forward lookup to write & reverse lookup to read
for(var i=0, l=256; i<l; i++) {
    var c = (i<128) ? i : _c[i-128];
    _w[i] = c;
    _r[c] = i;
}

// Read binary data from disk    
function binFileToArray(fileName){
    var binArray = [];
    var inStream = new ActiveXObject("ADODB.Stream");
    inStream.Type = 2;
    inStream.CharSet = '437';
    inStream.Open();
    inStream.LoadFromFile(fileName);
    var inString = inStream.ReadText();
    inStream.Close();
    for(var i=0, l=inString.length; i<l; i++) {
        binArray.push(_r[inString.charCodeAt(i)]);
    }
    return binArray;
}

// Write binary data to disk
function binArrayToFile(binArray, fileName){
    var outStream = new ActiveXObject('ADODB.Stream');
    var outString = '';
    for(var i=0, l=binArray.length; i<l; i++) {
        outString += String.fromCharCode(_w[binArray.charCodeAt(i)]);
    }
    outStream.Type = 2;
    outStream.CharSet = '437';
    outStream.Open();
    outStream.WriteText(outString);
    outStream.SaveToFile(fileName, 2);
    outStream.Close();
}


// le 1er argument concerne le mode choisit (correspond au call du batch)
var m = WScript.arguments(0);

// on récupère l'objet qui nous permettra d'écrire et de lire des fichiers
var fso = new ActiveXObject("Scripting.FileSystemObject");

if (m == ":JSON.extract") {

    /** dans ce mode, on a besoin d'au moins 3 arguments
     * 1er argument => la clé
     * le 2ème => le fichier d'entrée
     * le 3ème => le fichier de sortie
     */
    if (WScript.arguments.length <= 3) WScript.Quit(3);

    // on essai
    try {

        // on récupère le fichier d'entrée
        var fileIn = fso.OpenTextFile(WScript.arguments(2), 1, true);

        // contiendra les données parsées
        var data = null;

        // on essai de parser
        try {
            data = JSON.parse(fileIn.ReadAll());

        // on n'a pas réussi à parser
        } catch (e) {
            fileIn.close();          // on ferme le fichier correctement
            WScript.Echo(e.message); // on envoi un message sur la console
            WScript.Quit(2);         // on définit la variable errorlevel dans la console
                                     // et on quitte le script ici avec code d'erreur 2
        }
        fileIn.close(); // on ferme le fichier correctement

        // on regarde si la clé se trouve bien dans l'objet (non récursif)
        if (typeof data[WScript.arguments(1)] === 'undefined') WScript.Quit(1);

        // on récupère le fichier de sortie
        var fileOut = fso.OpenTextFile(WScript.arguments(3), 2, true);

        // on écrit les données contenues dans la sous-clé
        fileOut.write(JSON.stringify(data[WScript.arguments(1)], null, '  '));

        // on ferme le fichier correctement
        fileOut.close();

    // une erreur est survenue
    } catch (e) {

        WScript.Echo(e.message); // on envoi un message sur la console
        WScript.Quit(4);         // on définit la variable errorlevel dans la console
                                 // et on quitte le script ici avec code d'erreur 2
    }

    WScript.Quit(0); // et on quitte le script ici avec code d'erreur 0 (tout s'est bien passé)

} else if (m == ":JSON.format") {

    /** dans ce mode, on a besoin d'au moins 6 arguments
     * 1er argument => la clé
     * le 2ème => le fichier d'entrée
     * le 3ème => le fichier de sortie
     * le 4ème => le format (i.e. "$1:$2")
     * le 5ème => la sous-clé 1 qui remplacera "$1"
     * le 6ème => la sous-clé 2 qui remplacera "$2"
     * ...
     * le nème => la sous-clé n qui remplacera "$n"
     */
    if (WScript.arguments.length <= 6) WScript.Quit(3);

    // on essai
    try {

        // on récupère le fichier d'entrée
        var fileIn = fso.OpenTextFile(WScript.arguments(2), 1, true);

        // contiendra les données parsées
        var data = null;

        // on essai de parser
        try {
            data = JSON.parse(fileIn.ReadAll());

        // on n'a pas réussi à parser
        } catch (e) {
            fileIn.close();          // on ferme le fichier correctement
            WScript.Echo(e.message); // on envoi un message sur la console
            WScript.Quit(2);         // on définit la variable errorlevel dans la console
                                     // et on quitte le script ici avec code d'erreur 2
        }
        fileIn.close(); // on ferme le fichier correctement

        // on regarde si la clé se trouve bien dans l'objet (non récursif)
        if (typeof data[WScript.arguments(1)] === 'undefined') WScript.Quit(1);

        // contiendra tout ce qui a été récupéré
        var out = "";

        // une fonction pour pouvoir faire de la récusion plus facilement
        var _fn = function(k) {

            var format = WScript.arguments(4); // on récupère le format de base
            var o = 0; // permet juste de savoir si on a trouvé une propriété

            // on itère sur chaque propriété
            for (var i in k) {

                // on regarde si la propriété appartient bien à l'objet
                if (k.hasOwnProperty.call(k, i)) {

                    // on regarde si cette propriété est l'une des propriétés que l'on cherche
                    for (var j = 5; j < WScript.arguments.length; j++) {

                        // si oui, on remplace dans le format par la valeur
                        if (i == WScript.arguments(j)) {
                            format = format.replace(new RegExp('\\$' + (j - 4), 'g'), k[i]);
                            o = 1; // on a trouvé une propriété
                        }

                    }
                }
            }

            // si on n'a pas trouvé de propriété, on continue de chercher dans l'objet à partir de cette clé
            if (o == 0) {
                for (var i in k) {
                    if (k.hasOwnProperty.call(k, i)) {
                        _fn(k[i]);
                    }
                }
            }

            // sinon on ajoute ce qu'on a réussi à récupérer
            else out += format + '\r\n';
        };

        // on appelle la fonction avec les données parsées
        _fn(data[WScript.arguments(1)]);

        // on récupère le fichier de sortie
        var fileOut = fso.OpenTextFile(WScript.arguments(3), 2, true);

        // on écrit ce qu'on a trouvé
        fileOut.write(out);

        // on ferme le fichier
        fileOut.close();

    // une erreur est survenue
    } catch (e) {

        WScript.Echo(e.message); // on envoi un message sur la console
        WScript.Quit(4);         // on définit la variable errorlevel dans la console
                                 // et on quitte le script ici avec code d'erreur 2
    }

    WScript.Quit(0); // tout s'est bien passé

} else if (m == ":JSON.replace") {

    /** dans ce mode, on a besoin d'au moins 5 arguments
     * 1er argument => la clé
     * le 2ème => le fichier d'entrée
     * le 3ème => le fichier de sortie
     * le 4ème => la valeur
     * le 5ème => 0 => on laisse comme c'était avant, 1 => on répare le JSON
     */
    if (WScript.arguments.length <= 5) WScript.Quit(3);

    var g = WScript.arguments(5); // contient le 5ème argument
    var h = 0; // si h==1 alors le JSON est cassé sauf qu'on laisse tel quel
    var s = 0; // si s==1 alors on doit laisser la virgule à la fin

    // on essai
    try {

        // on récupère le fichier d'entrée
        var fileIn = fso.OpenTextFile(WScript.arguments(2), 1, true);

        // contiendra les données parsées
        var data = null;

        var c = fileIn.ReadAll(); // on lit le fichier

        // on essai de parser
        try {
            data = JSON.parse(c);

        // on n'a pas réussi à parser
        } catch (e) {

            // on essai de réparer
            try {
                var f = c.replace(/(,)(?:[\s\n\r]*)$(?![\r\n])/g, '');
                data = JSON.parse("[" + f + "]");
                if (g == 0) h = 1;
                if (f != c && h == 1) s = 1;

            // on n'a pas réussi à réparer
            } catch (e) {
                fileIn.close();          // on ferme le fichier correctement
                WScript.Echo(e.message); // on envoi un message sur la console
                WScript.Quit(2);         // on définit la variable errorlevel dans la console
                                         // et on quitte le script ici avec code d'erreur 2
            }
        }
        fileIn.close(); // on ferme le fichier correctement

        var v = WScript.arguments(4); // on récupère la valeur
        var _fn = function(k) {

            // on itère sur chaque propriété
            for (var i in k) {

                // on regarde si la propriété appartient bien à l'objet
                if (k.hasOwnProperty.call(k, i)) {

                    // si la propriété correspond à la clé qu'on cherche
                    if (i == WScript.arguments(1)) {

                        // on remplace par la valeur
                        if (!isNaN(v)) k[i] = parseFloat(v);
                        else k[i] = v;

                    } else _fn(k[i]); // sinon on continue à chercher
                }
            }
        };

        // on appelle la fonction avec les données
        _fn(data);

        // on récupère le fichier de sortie
        var fileOut = fso.OpenTextFile(WScript.arguments(3), 2, true);

        // on écrit les données en préservant ou pas le format de départ
        var d = JSON.stringify(data, null, '  ');
        var dd = h == 1 ? d.slice(1, -1) : d;
        if (h == 1 && s == 1) dd = dd.replace(/(?:[\s\n\r]*)$(?![\r\n])/g, '') + ',';
        fileOut.write(dd);

        // on ferme le fichier correctement
        fileOut.close();

    // une erreur est survenue
    } catch (e) {

        WScript.Echo(e.message); // on envoi un message sur la console
        WScript.Quit(4); // on définit la variable errorlevel dans la console
        // et on quitte le script ici avec code d'erreur 2
    }

    WScript.Quit(0); // tout s'est bien passé

} else if (m == ":JSON.clean") {

    /** dans ce mode, on a besoin d'au moins 3 arguments
     * le 1er argument => le fichier d'entrée
     * le 2ème => le fichier de sortie
     * le 3ème => 0 => on laisse comme c'était avant, 1 => on répare le JSON
     * [le 4ème] => la clé où l'on veut encapsuler tout l'objet (optionnel)
     */
    if (WScript.arguments.length <= 3) WScript.Quit(3);

    var g = WScript.arguments(3); // contient le 5ème argument
    var h = 0; // si h==1 alors le JSON est cassé sauf qu'on laisse tel quel
    var s = 0; // si s==1 alors on doit laisser la virgule à la fin

    // on essai
    try {

        // on récupère le fichier d'entrée
        var fileIn = fso.OpenTextFile(WScript.arguments(1), 1, true);

        // contiendra les données parsées
        var data = null;

        var c = fileIn.ReadAll(); // on lit le fichier

        // on essai de parser
        try {
            data = JSON.parse(c);

        // on n'a pas réussi à parser
        } catch (e) {

            // on essai de réparer
            try {
                var f = c.replace(/(,)(?:[\s\n\r]*)$(?![\r\n])/g, '');
                data = JSON.parse("[" + f + "]");
                if (g == 0) h = 1;
                if (f != c && h == 1) s = 1;

            // on n'a pas réussi à réparer
            } catch (e) {
                fileIn.close();          // on ferme le fichier correctement
                WScript.Echo(e.message); // on envoi un message sur la console
                WScript.Quit(2);         // on définit la variable errorlevel dans la console
                                         // et on quitte le script ici avec code d'erreur 2
            }
        }
        fileIn.close(); // on ferme le fichier correctement

        // on essai d'encapusler l'objet
        if (WScript.arguments.length >= 5) {
            var datad = {};
            datad[WScript.arguments(4)] = data;
            data = datad;
        }

        // on récupère le fichier de sortie
        var fileOut = fso.OpenTextFile(WScript.arguments(2), 2, true);

        // on écrit les données en préservant ou pas le format de départ
        var d = JSON.stringify(data, null, '  ');
        var dd = h == 1 ? d.slice(1, -1) : d;
        if (h == 1 && s == 1) dd = dd.replace(/(?:[\s\n\r]*)$(?![\r\n])/g, '') + ',';
        fileOut.write(dd);

        // on ferme le fichier correctement
        fileOut.close();

    // une erreur est survenue
    } catch (e) {

        WScript.Echo(e.message); // on envoi un message sur la console
        WScript.Quit(4);         // on définit la variable errorlevel dans la console
                                 // et on quitte le script ici avec code d'erreur 2
    }

    WScript.Quit(0); // tout s'est bien passé

} else if (m == ":GZIP.unpack") {

    /** dans ce mode, on a besoin d'au moins 2 arguments
     * le 1er argument => le fichier d'entrée
     * le 2ème => le fichier de sortie
     */
    if (WScript.arguments.length <= 2) WScript.Quit(3);
    
    if (!fso.FileExists(WScript.arguments(1))) WScript.Quit(5);
    
    // on unpack et on écrit ça dans le fichier de sortie
    var out = gzipjs.unzip(readBinary(WScript.arguments(1)));
    writeBinary(WScript.arguments(2),out);
    
    WScript.Quit(0); // tout s'est bien passé

} else if (m == ":GZIP.pack") {

    /** dans ce mode, on a besoin d'au moins 2 arguments
     * le 1er argument => le fichier d'entrée
     * le 2ème => le fichier de sortie
     */
    if (WScript.arguments.length <= 2) WScript.Quit(3);
    
    if (!fso.FileExists(WScript.arguments(1))) WScript.Quit(5);

    var out = gzipjs.zip(readBinary(WScript.arguments(1)),{
        level: 6,
        timestamp: 5
    });
    out[4]=0;
    out[8]=4;
    out[9]=0;
    writeBinary(WScript.arguments(2),out);
    
    WScript.Quit(0); // tout s'est bien passé
    
} else if (m == ":MAGIE.unpack") {

    /** dans ce mode, on a besoin d'au moins 2 arguments
     * le 1er argument => le fichier d'entrée
     * le 2ème => le fichier de sortie
     */
    if (WScript.arguments.length <= 2) WScript.Quit(3);
    
    if (!fso.FileExists(WScript.arguments(1))) WScript.Quit(5);
    
    var spc = "                               ---->";
    var p = 100/6;
    var pi = 1;
    
    testBinary();
    
    var binary = readBinary(WScript.arguments(1));
    WScript.Echo("[33m"+spc+" Read Binary ("+(p*(pi++)).toFixed(1)+"%)[31m");
    
    // on unpack et on écrit ça dans le fichier de sortie
    var out = gzipjs.unzip(binary);
    
    WScript.Echo("[33m"+spc+" UnPack File("+(p*(pi++)).toFixed(1)+"%)[31m");
    
    var rawdata = String.fromCharCode.apply(null,out);
    WScript.Echo("[33m"+spc+" Binary to String ("+(p*(pi++)).toFixed(1)+"%)[31m");
    
    var d = rawdata.indexOf('\n');
    if (d < 0) WScript.Quit(6);
    var id = rawdata.substring(0,d);
    var data = {};
    try {
        data = JSON.parse(rawdata.substring(d+1));
        WScript.Echo("[33m"+spc+" Parse Data ("+(p*(pi++)).toFixed(1)+"%)[31m");
    } catch(e) {
        WScript.Quit(7);
    }

    var jdata = "";
    try {
        jdata = JSON.stringify(data, null, '  ');
    } catch(e) {
        WScript.Echo(e.message);
    }
    WScript.Echo("[33m"+spc+" Stringify Data ("+(p*(pi++)).toFixed(1)+"%)[31m");
    
    binArrayToFile(jdata,WScript.arguments(2));
    
    //writeBinary(WScript.arguments(2),ajdata,true);
    
    WScript.Echo("[33m"+spc+" Write Data (100%)[31m");

    WScript.Quit(0); // tout s'est bien passé

} else if (m == ":MAGIE.pack") {

    /** dans ce mode, on a besoin d'au moins 2 arguments
     * le 1er argument => le fichier d'entrée
     * le 2ème => le fichier de sortie
     */
    if (WScript.arguments.length <= 2) WScript.Quit(3);

    if (!fso.FileExists(WScript.arguments(1))) WScript.Quit(5);
    
    testBinary();
    
    var spc = "                               ---->";
    var p = 100/9;
    var pi = 1;
    
    WScript.Echo("[33m"+spc+" Preparation (0%)[31m");
	
    // on essai
    try {

        // on récupère le fichier d'entrée
        var binary = readBinary(WScript.arguments(1));
        WScript.Echo("[33m"+spc+" Read Binary ("+(p*(pi++)).toFixed(1)+"%)[31m");
        
        var rawdata = String.fromCharCode.apply(null,binary);
        WScript.Echo("[33m"+spc+" Binary to String ("+(p*(pi++)).toFixed(1)+"%)[31m");
        
        var data = {};
        var jdata = "";

        // on essai de parser
        try {
            data = JSON.parse(rawdata);
            WScript.Echo("[33m"+spc+" Parse JSON ("+(p*(pi++)).toFixed(1)+"%)[31m");

        // on n'a pas réussi à parser
        } catch (e) {
            WScript.Echo(e.message); // on envoi un message sur la console
            WScript.Quit(2);         // on définit la variable errorlevel dans la console
                                     // et on quitte le script ici avec code d'erreur 2
        }
        
        try {
            jdata = JSON.stringify(data);
        } catch(e) {
            WScript.Echo(e.message);
        }
        WScript.Echo("[33m"+spc+" Stringify Data ("+(p*(pi++)).toFixed(1)+"%)[31m");
        
        // on calcule la signature
        var sig = Crypto.sha1_hmac(jdata,key)+'\n';
        
        WScript.Echo("[33m"+spc+" Compute Signature HMAC_SHA1 ("+(p*(pi++)).toFixed(1)+"%)[31m");
        
        var bytes = [];
        var l = jdata.length;
        for (var i = 0; i < l; i++) bytes.push(jdata.charCodeAt(i));
        
        WScript.Echo("[33m"+spc+" JSON Data to Binary ("+(p*(pi++)).toFixed(1)+"%)[31m");
        
        // on ajoute la signature
        bytes = sig.split('').map(function(x){return x.charCodeAt(0);}).concat(bytes);
        
        WScript.Echo("[33m"+spc+" Concat Binary and Signature ("+(p*(pi++)).toFixed(1)+"%)[31m");
        
        // on pack
        var out = gzipjs.zip(bytes,{
            level: 6,
            timestamp: 5
        });
        out[4]=0;
        out[8]=4;
        out[9]=0;
        
        WScript.Echo("[33m"+spc+" Pack Data ("+(p*(pi++)).toFixed(1)+"%)[31m");
		
		binArrayToFile(String.fromCharCode.apply(null,out),WScript.arguments(2));
    
        //writeBinary(WScript.arguments(2),out);
        
        WScript.Echo("[33m"+spc+" Write Binary (100%)[31m");
        
    // une erreur est survenue
    } catch (e) {

        WScript.Echo(e.message); // on envoi un message sur la console
        WScript.Quit(4);         // on définit la variable errorlevel dans la console
                                 // et on quitte le script ici avec code d'erreur 2
    }
    
    WScript.Quit(0); // tout s'est bien passé

}



},{"gzip-js":5}]},{},[6]);
