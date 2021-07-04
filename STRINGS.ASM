                page    66,132
;=======================================================================
; STRINGS.COM - a set of string handling functions for batch files.
;
; Syntax:
;       STRINGS [/H][/M][/Pc ][var = ] function arg1 [, arg2] [, arg3]
;
;       /?   - Print help message
;       /M   - Use master environment block
;       /Q   - Suppress output to console
;       /Pc  - Use c as parse character instead of ','
;       /Bxx - Use xx as for base (base 10 default)
;       /I   - Install as TSR
;       /U   - Uninstall 
;
; Revision History:
;
;       Version 2.0     New version with many more commands.
;       Version 2.1     Fixed READ bug
;                       Fixed Parse bug
;                       Added check for 386Max mem arenas
;                       Changed env search default
;
;       Version 2.2     Fixed 2FCheck bug
;                       Fixed ASK bug
;                       Fixed FILENAME bug
;                       Fixed Install check
;
;       Version 2.3     Added sharing flags to file operations
;                       Added check for internal cmd hook 
;                       Fixed read across boundry bug
;
;       Version 2.4     Fixed print time at 12 noon bug.
;                       Added xlate from graphics = to char = on cmdline
;
;       Version 2.5     Mod file open code to handle CD-ROMs
;
;=======================================================================
;
;Equates
;
RES_STACK	equ	offset end_of_resident+512
TRANS_STACK	equ	offset end_of_code+512
VAR_SIZE        equ     128                     ;Max size of variables
DATABUFF_SIZE   equ     2048                    ;Size of file data buffer
MAX_PARAMS	equ	10			;Max number of parameters
DEF_PARSE_CHAR	equ	","			;Default parse character

;------------------------------------------------------------------------
;Code segment
;------------------------------------------------------------------------
	        code    segment
	        assume  cs:code

	        org     2ch
local_environment       dw      ?               ;Word containing the seg
	                                        ;  of the prog's env. blk.
	        org     80h
command_tail    db      ?                       ;Offset of the cmd tail.

	        org     100h

entry:          jmp     initialize
program         db      13,10,"STRINGS "
version		db	"2.5 "
copyright       db      "Copyright 1991-1993, 1995 "
		db	"Douglas Boling",10,13
                db      "First published in PC Magazine,"
		db	" December 29, 1992",13,10,0,"$",1Ah

		even				;Start data on word bndry
dos_version     dw      0
ems_version	dw	-1			
xms_version	dw	-1
databuff_ptr    dw      0                       ;Ptr to file data buffer
saved_ss	dw	0			;SS:SP saved on during
saved_sp	dw	0			;  multiplex execution
saved_ssint	dw	0			;SS:SP saved on during
saved_spint	dw	0			;  interrupt function.
int2fh		dd	-1			;Old mux int vector
xms_serv	dd	-1			;Entry pt for ext mem drvr

masterenv_seg 	dw      0                       ;Segment of master env
localenv_seg 	dw      0                       ;Segment of local env

num_params	dw	0			;Number of parameters passed
dest_var_val    dw      0
dest_var_name   dw      0                       ;Buffer pointers to parsed
cmd_value       dw      0                       ;  command line variables.
var1_value      dw      0                       ;  These pointers must be
var2_value      dw      0                       ;  kept in this order.
var3_value      dw      0                       
var4_value      dw      0
var5_value      dw      0                      
var6_value      dw      0
var7_value      dw      0
var8_value      dw      0
var9_value      dw      0
var10_value     dw      0

get_cmd		db	0			;Claim command flag
multiplex_id	db	0dbh			;Mux id 
number_base	dw	10			;Base for num conversion
parse_char      db      DEF_PARSE_CHAR          ;Char used to parse command
quiet_flag	db	0			;Flag to suppress output
console_out     db      1                       ;Flag for con out.
use_mastenv     db      0                       ;Flag to use master env
help_flag	db	0			;Forces help message
install_flag	db	0			;Install as TSR
remove_flag	db	0			;Remove
installed	db	0			;Installed as TSR flag

fill_char       db      " "                     ;Char used to fill zeros
equalsub_char   db      0cdh

strings_namelen	dw	7			;Length of strings name
strings_name	db	"STRINGS",0,0		;Name of program
shell_var       db      "COMSPEC",0,0		;Extra zero needed, don't del
shell_name      db      "COMMAND",0,0		;Cmd shell file name
shell_namlen    db      7			;Length of shell filename
ems_header	db	'EMMXXXX0'		;Expanded mem drvr header
;
; Table of command line switches and the corrsponding jump table
;
cmd_switches	db	"h?mqpbiu"		;Letters of valid commands.
cmd_switch_end	=	$
cmd_jmp_tbl	dw	offset switch_help 	;This jump table is used to
		dw	offset switch_help  	;  call the routines that
		dw	offset switch_master    ;  process the command line
		dw	offset switch_quiet	;  arguments
		dw	offset switch_pchar 
		dw	offset switch_base
		dw	offset switch_install
		dw	offset switch_remove
;
; Table of commands
;
command_table   db      "LEFT",0                ;String functions
	        db      "RIGHT",0
	        db      "MID",0
	        db      "LENGTH",0
	        db      "FIND",0
	        db      "FINDC",0
	        db      "LOWER",0
	        db      "UPPER",0
	        db      "CHAR",0
	        db      "VAL",0
	        db      "FILEDRIVE",0
	        db      "FILEDIR",0
	        db      "FILENAME",0
	        db      "FILEEXT",0
	        db      "PARSE",0
	        db      "ADDCOMMAS",0
	        db      "REPEAT",0

	        db      "READ",0                ;File functions
	        db      "WRITE",0
	        db      "FILESIZE",0
	        db      "LINESIZE",0
	        db      "TRUENAME",0
		db	"FILEDATE",0		
		db	"FILETIME",0		

	        db      "VER",0                 ;System functions
	        db      "ASK",0
		db	"INWIN",0
		db	"2FCHECK",0
	        db      "ENVFREE",0
	        db      "ENVSIZE",0
	        db      "MASTERVAR",0
	        db      "LOCALVAR",0
		db	"TRUEVER",0		
		db	"FILES",0		
		db	"LASTDRIVE",0
		db	"CODEPAGE",0
		db	"COUNTRY",0
		db	"BIOSDATE",0
		db	"GETKEY",0
		db	"LOCALENV",0
		db	"MASTERENV",0

	        db      "ADD",0                 ;Math functions
	        db      "SUB",0
	        db      "MUL",0
	        db      "DIV",0
	        db      "AND",0
	        db      "OR",0
	        db      "XOR",0
	        db      "NOT",0
	        db      "CONVERT",0

		db	"PEEK",0		;Progamming functions
		db	"POKE",0
		db	"IN",0
		db	"OUT",0
		db	"INTERRUPT",0
		db	"SCAN",0

		db	"DAY",0			;Time/Date functions
		db	"MONTH",0
		db	"DATE",0
		db	"TIME",0

		db	"MEMTOTAL",0		;Memory status functions
		db	"MEMFREE",0
		db	"XMSTOTAL",0
		db	"XMSFREE",0
		db	"XMSVER",0
		db	"EMSTOTAL",0
		db	"EMSFREE",0
		db	"EMSVER",0
		db	"UMBLARGE",0

		db	"STRINGSVER",0		;Support functions
		db	"INSTALLED",0
		db	"HELP",0
	        db      0                       ;End of list flag
;
; Jump table for commands
;
jump_table      dw      offset left_str
	        dw      offset right_str
	        dw      offset mid_str
	        dw      offset length_str
	        dw      offset find_str
	        dw      offset findc_str
	        dw      offset lower_str
	        dw      offset upper_str
	        dw      offset char_str
	        dw      offset val_str
	        dw      offset filedrive_str
	        dw      offset filedir_str
	        dw      offset filename_str
	        dw      offset fileext_str
	        dw      offset parse_str	;New
	        dw      offset commas_str	;New
	        dw      offset repeat_str	;New

	        dw      offset readrec_file
	        dw      offset writerec_file
	        dw      offset filesize_file
	        dw      offset numrec_file
	        dw      offset truename_file
	        dw      offset filedate_file	;New
	        dw      offset filetime_file	;New
	
	        dw      offset ver_sys
	        dw      offset ask2_sys
		dw	offset inwin_sys
		dw	offset int2fcheck_sys
	        dw      offset envfree_sys
	        dw      offset envsize_sys
	        dw      offset mastervar_sys
	        dw      offset localvar_sys	    
	        dw      offset truever_sys	;New
	        dw      offset files_sys	;New
	        dw      offset lastdrive_sys	;New
	        dw      offset codepage_sys	;New
	        dw      offset country_sys	;New
        	dw      offset biosdate_sys	;New
        	dw      offset getkey_sys	;New
        	dw      offset localenv_sys	;New
        	dw      offset masterenv_sys	;New

	        dw      offset add_num
	        dw      offset sub_num
	        dw      offset mul_num
	        dw      offset div_num
	        dw      offset and_num		;New
	        dw      offset or_num		;New
	        dw      offset xor_num		;New
	        dw      offset not_num		;New
	        dw      offset convert_num	;New

	        dw      offset peek_prog	;New
	        dw      offset poke_prog	;New
	        dw      offset in_prog		;New
	        dw      offset out_prog		;New
	        dw      offset interrupt_prog	;New
	        dw      offset scan_prog	;New

	        dw      offset day_time		;New
	        dw      offset month_time	;New
	        dw      offset date_time	;New
	        dw      offset time_time	;New

	        dw      offset totalmem_mem	;New
	        dw      offset freemem_mem	;New
	        dw      offset totalext_mem	;New
	        dw      offset freeext_mem	;New
	        dw      offset extver_mem	;New
	        dw      offset totalems_mem	;New
	        dw      offset freeems_mem	;New
	        dw      offset emsver_mem	;New
	        dw      offset freeumb_mem	;New

	        dw      offset ver_strings	;New
	        dw      offset inst_strings	;New
	        dw      offset help_strings	;New
jump_table_end  =       $

int2fname_tbl  	db      "PRINT",0               ;Alias table for multiplex
	        db      "ASSIGN",0		;  interrupt install check
		db	"DRIVER",0
	        db      "SHARE",0
	        db      "NET",0
	        db      "NLS",0
	        db      "ANSI",0
		db	"DOSBOX",0
	        db      "HIMEM",0
	        db      "DOSKEY",0
	        db      "DISPLAY",0
	        db      "GRAPHTBL",0
	        db      "APPEND",0
	        db      0                       ;End of list flag

int2falias_tbl	db	1			;ID numbers of DOS programs
		db	6			;  that use the multiplex
		db	8			;  interrupt.
		db	10h
		db	11h
		db	14h
		db	1Ah
		db	40h
		db	43h
		db	48h
		db	0ADh
		db	0B0h
		db	0B7h


day_list	db	"Sunday",0
		db	"Monday",0
		db	"Tuesday",0
		db	"Wednesday",0
		db	"Thursday",0
		db	"Friday",0
		db	"Saturday",0,0

month_list	db	"January",0
		db	"February",0
		db	"March",0
		db	"April",0
		db	"May",0
		db	"June",0
		db	"July",0
		db	"August",0
		db	"September",0
		db	"October",0
		db	"November",0
		db	"December",0,0

infomsg2	db	"Removed",0		
errmsg0         db      "Need DOS " 
errmsg0ver	db	"2.0"
		db	" or greater",0
errmsg1         db      "Usage: STRINGS [/?][/M][/Q][/Pc][/Bn][/I][/U]"
		db	" [env var =]"
	        db      " FUNCTION [Params]",13,10,10
	        db      " /M  - Use master environment",13,10
	        db      " /Q  - Suppress output to screen",13,10
	        db      " /Pc - Use char c instead of ',' as the"
		db	" parse character",13,10
	        db      " /Bn - Use n as the number base",13,10
	        db      " /I  - Installs as resident code."
	        db      " DOS 3.3 or later required",13,10
	        db      " /U  - Uninstalls if resident",13,10
		db      10,"For a list of commands type STRINGS /?",0

errmsg2         db      "Not enought memory",0
errmsg3         db      "Unknown command line switch",0
errmsg6         db      "Illegal filename",0
errmsg7         db      "Line numbers must be greater than 0",0
errmsg8         db      "Line not found",0

errmsg10        db      "Multiply overflow error",0
errmsg11        db      "Divide by zero error",0
errmsg12        db      "Addition overflow",0
errmsg13        db      "Subtraction underflow",0
errmsg14        db      "Number too large",0
errmsg15        db      "Out of environment space",0
errmsg16        db      "Can't find environment",0
errmsg17	db	"No Expanded memory",0
errmsg18	db	"Required parameter missing",0
errmsg19	db	"No Extended memory",0
errmsg20	db	"String not found",0
errmsg21	db	"Not Installed",0
errmsg22	db	"Can",39,"t remove",0
errmsg23	db	"Already installed",0
errmsg24	db	"Base must be within 2-16",0
endmsg          db      13,10,0

doserr_tbl	dw	offset	doserr_00
	 	dw	offset	doserr_00
		dw	offset	doserr_02
		dw	offset	doserr_03
		dw	offset	doserr_04
		dw	offset	doserr_05
		dw	offset	doserr_00
		dw	offset	doserr_07
		dw	offset	doserr_00
		dw	offset	doserr_00
		dw	offset	doserr_10
		dw	offset	doserr_00
		dw	offset	doserr_12
		dw	offset	doserr_13
		dw	offset	doserr_00
		dw	offset	doserr_15
		dw	offset	doserr_00
		dw	offset	doserr_17
		dw	offset	doserr_18
		dw	offset	doserr_19
		dw	offset	doserr_20
		dw	offset	doserr_21
		dw	offset	doserr_22
		dw	offset	doserr_23
		dw	offset	doserr_00
		dw	offset	doserr_25
		dw	offset	doserr_26
		dw	offset	doserr_27
		dw	offset	doserr_00
		dw	offset	doserr_29
		dw	offset	doserr_30
		dw	offset	doserr_31
		dw	offset	doserr_32
		dw	offset	doserr_33
		dw	offset	doserr_34
doserr_tblend	=	$

doserr_00	db	"DOS Error",0
doserr_02	db	"File not found",0
doserr_03	db	"Path not found",0
doserr_04	db	"Too many open files",0
doserr_05	db	"Access denied",0
doserr_07	db	"Memory Corrupted",0
doserr_10	db	"Bad Environment block",0
doserr_12	db	"File Access Invalid",0
doserr_13	db	"Data Invalid",0
doserr_15	db	"Not a proper Disk",0
doserr_17	db	"Not same device",0
doserr_18	db	"No more files",0
doserr_19	db	"Disk Write Protected",0
doserr_20	db	"Unknown unit",0
doserr_21	db	"Drive not ready",0
doserr_22	db	"Unknown command",0
doserr_23	db	"CRC Data Error",0
doserr_25	db	"Disk Seek error",0
doserr_26	db	"Not a DOS disk",0
doserr_27	db	"Sector not found",0
doserr_29	db	"File Write fault",0
doserr_30	db	"File Read fault",0
doserr_31	db	"General failure",0
doserr_32	db	"File sharing violation",0
doserr_33	db	"File lock violation",0
doserr_34	db	"Illegal Disk change",0

;============================================================================
; Multiplex Interrupt handler
;============================================================================
muxint		proc	far
		assume	cs:code,ds:nothing,es:nothing
		cmp 	ax,0ae00h		;Chk for installed cmd
		je	mux_chkcmd
		cmp 	ax,0ae01h		;Chk for installed cmd
		je	mux_execute
		cmp	ah,cs:multiplex_id
		je	mux_instchk
mux_jmp:
 		jmp	cs:[int2fh]		;Jump to old interrupt
mux_instchk:
		mov	ax,-1
		push	cs
		pop	es
		iret
;
; This routine checks the cmd line for a valid Strings command.
;
mux_chkcmd:
		cld
		push	cx
		push	di
		push	si
		push	es
		
		lodsb				;Load cmd length 
		mov	cl,al
		xor	ch,ch

		mov	di,cs			;ES:DI points to my cmd
		mov	es,di			;  line buff
		mov	di,offset strings_name
		repe	cmpsb
		jne	mux_chk1
		cmp	byte ptr es:[di],0
		jne	mux_chk1

		mov	al,-1			;Claim command
		mov	di,81h			;Copy to my cmd buff
		mov	si,bx			;Point to cmd line
		inc	si
		mov	cl,ds:[si]		;Get length of cmd line
		inc	si			;Load cmd line length
		inc	cx
		cmp	cl,7fh			;Only allow 127 chars
		ja	mux_chk1
		rep	movsb
		jmp	short mux_chkexit
mux_chk1:
		xor	al,al			;Don't want command
mux_chkexit:
		pop	es
		pop	si
		pop	di
		pop	cx
		or	al,al			;See if we like cmd
		je	mux_jmp			;No, pass on.
		mov	cs:get_cmd,1		;Set accept cmd flag
		jmp	short mux_iret		;Yes, return.
;
; This routine executes the command line.
;
mux_execute:
		dec	cs:get_cmd		;See if Strings claimed
		jnz	mux_jmp			;  the command.
		push	ax
		mov	cs:saved_ss,ss
		mov	cs:saved_sp,sp
		mov	ax,cs
		cli
		mov	ss,ax
		mov	sp,RES_STACK
		sti

		push	bx
		push	cx
		push	dx
		push	di
		push	si
		push	bp
		push	ds
		push	es

		mov	ax,cs
		mov	ds,ax
		mov	es,ax
		assume	ds:code,es:code

		mov	si,offset 81h		;Remove name of program
		mov	di,si			;  from the command 
		xor	bl,bl			;  line.  1st, find the
		call	scan4char		;  name, the move the
		add	si,strings_namelen	;  ptr past it.
		xor	cx,cx
mux_x1:
		lodsb
		stosb
		inc	cx
		cmp	al,13
		jne	mux_x1
		mov	ds:[80h],cl

		call	main			;Showtime!

		cmp	remove_flag,0		;See if we should 
		je	mux_xexit		;  remove the program
		call	remove
		jnc	mux_xexit
		call	print_strcr		;Print error message
mux_xexit:
		pop	es
		pop	ds
		pop	bp
		pop	si
		pop	di
		pop	dx
		pop	cx
		pop	bx

		cli
		mov	ss,cs:saved_ss
		mov	sp,cs:saved_sp

		cmp	cs:remove_flag,0	;If remove, discard
		je	mux_xexit1		;  mem segment at the
		push	es			;  last moment.
		push	cs
		pop	es			;Get code segment
		mov	ah,49h			;Free mem
		int	21h
		pop	es
mux_xexit1:
		pop	ax
		mov	byte ptr ds:[si],0	;Tell cmd.com not to ex
mux_iret:
		iret
muxint		endp

;----------------------------------------------------------------------------
; Start of code.						    	
;----------------------------------------------------------------------------
main		proc    near
	        assume  cs:code,ds:code,es:code
	        cld                             ;Set string operations 'up.'

	        call    parse_cmdline           ;Parse command line
	        jc      main_error

	        mov     si,dest_var_name        ;Point to dest env var name
	        call    caps_string

	        mov     si,cmd_value            ;Point to command buffer
	        call    caps_string

		cmp	help_flag,0		;If help flag set, call
		je	main_1			;  help function to 
		call	help_strings		;  interpet command.
		jmp	short main_6
main_1:
		inc	cx
	        mov     di,offset command_table	;Search cmd table 
	        call    findstr
	        mov     si,offset errmsg1
	        jc      main_error

	        shl     bx,1                    ;Compute offset of routine to
	        call    [bx+offset jump_table]	;  call, then call routine
	        jc      main_error

	        mov     si,dest_var_val
	        cmp     console_out,0           ;See how to return result
	        je      main_3
	        cmp	byte ptr [si],0		;If no result, exit
	        je	main_6
        	call    print_strcr             ;Print result to screen
	        jmp     short main_6
main_3:
	        mov     di,dest_var_name
	        xchg    di,si

	        call    setenv                  ;Set environemnt variable.
	        jc      main_7
main_6:
	        xor     al,al                   ;Return code = 0
main_exit:
		ret				;Return
;
;Display error message.
;
main_7:
	        mov     si,offset errmsg15      ;Out of environment space
main_error:
	        push    cs
	        pop     ds
	        assume  ds:code

		push	si
		mov	si,offset program	;Print copyright msg
		call	print_strcr
		pop	si
	        call    print_strcr             ;print string
main_9:	
	        mov     al,01                   ;Terminate with RC = 1
	        jmp     short main_exit
main		endp

;=============================================================================
; String Functions
;=============================================================================
;-----------------------------------------------------------------------------
; RIGHT STR  returns the right n characters of the source string
;-----------------------------------------------------------------------------
right_str       proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var2_value           ;Convert 2nd parameter to hex
	        call    asc2hex
	        call    truncnum                ;Truncate number to string len

	        push    ax
	        mov     di,var1_value           ;Scan to end of string
	        call    find_end
	        pop     ax
right_str_2:
	        sub     di,ax
	        dec     di
	        cmp     di,var1_value
	        ja      right_str_3
	        mov     di,var1_value
right_str_3:
	        mov     si,dest_var_val
	        xchg    di,si
	        call    copy_string             ;Copy string to dest buffer
	        clc
	        ret
right_str       endp

;-----------------------------------------------------------------------------
; LEFT STR Returns the left n characters of the source string
;-----------------------------------------------------------------------------
left_str        proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var2_value           ;Convert 2nd parameter to hex
	        call    asc2hex
	        call    truncnum                ;Truncate number to string len

	        mov     si,var1_value
	        mov     bx,ax
	        mov     byte ptr [si+bx],0

	        mov     di,dest_var_val
	        call    copy_string             ;Copy string to dest buffer
	        clc
	        ret
left_str        endp

;-----------------------------------------------------------------------------
; MID STR Returns a string of n characters starting m characters from the
;         left of the source string
;-----------------------------------------------------------------------------
mid_str         proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var2_value           ;Convert 2nd parameter to hex
	        call    asc2hex
	        dec     ax
	        call    truncnum                ;Truncate num
	        mov     cx,ax                   ;Copy second parameter

	        mov     si,var3_value           ;Convert 3rd param to hex
	        cmp     byte ptr [si],0         ;See if no parameter
	        je      mid_str_0
	        call    asc2hex                 ;If no number, return max
	        jnc     mid_str_1               ;  value to insure remainder
mid_str_0:
	        mov     ax,VAR_SIZE             ;  of string returned.
mid_str_1:
	        call    truncnum                ;Truncate num

	        push    ax                      ;Save length of substring
	        xor     ax,ax
	        cmp     al,1                    ;Clear zero flag
	        mov     di,var1_value           ;Scan to new start of string
	        jcxz    mid_str_11
	        repne   scasb
mid_str_11:
	        pop     cx                      ;Pop length of substring
	        mov     si,di                   ;Copy ptr to start of substr
	        je      mid_str_2               ;If end of str found, end

	        repne   scasb                   ;Scan until end of substring
	        mov     byte ptr [di],0
mid_str_2:
	        mov     di,dest_var_val
	        call    copy_string             ;Copy string to dest buffer
	        clc
	        ret
mid_str         endp

;-----------------------------------------------------------------------------
; LENGTH STR Computes the length of the source string
;-----------------------------------------------------------------------------
length_str      proc    near
	        assume  cs:code,ds:code,es:code
	        mov     di,var1_value           ;Find_end also returns the
	        call    find_end                ;  length of the string in
	        mov     ax,cx                   ;  CX.
	        xor     dx,dx
	        mov     di,dest_var_val         ;Convert value to ASCII
	        call    hex2asc
	        clc
	        ret
length_str      endp

;-----------------------------------------------------------------------------
; UPPER STR Convert the source string to upper case
;-----------------------------------------------------------------------------
upper_str       proc    near
	        assume  cs:code,ds:code,es:code
	        mov     di,dest_var_val
	        mov     si,var1_value
	        push    di
	        call    copy_string             ;Copy string to dest buffer
	        pop     si
	        call    caps_string             ;Convert to upper case.
	        clc
	        ret
upper_str       endp

;-----------------------------------------------------------------------------
; LOWER STR Convert the source string to lower case
;-----------------------------------------------------------------------------
lower_str       proc    near
	        assume  cs:code,ds:code,es:code
	        mov     di,dest_var_val
	        mov     si,var1_value
	        push    di
	        call    copy_string             ;Copy string to dest buffer
	        pop     si
	        call    lc_string               ;Convert to lower case.
	        clc
	        ret
lower_str       endp

;-----------------------------------------------------------------------------
; CHAR STR Convert the source number to a ASCII character
; Revised in ver 2.0 to handle up to 10 numbers
;-----------------------------------------------------------------------------
char_str        proc    near
	        assume  cs:code,ds:code,es:code
		push	bp
	        mov     di,dest_var_val		;Get ptr to output buff
		mov	bp,offset var1_value	;Get ptr to var array
		mov	cx,num_params		;Get number of parameters
		or	cx,cx
		jne	charstr_1		
		mov	cx,1
charstr_1:
	        mov     si,[bp]			;Get ptr to variable
		inc	bp			;Point BP to next var
		inc	bp
	        call    asc2hex			;Convert ASCII num to
		stosb				;  hex num and store.
		loop	charstr_1
		xor     al,al                   ;Write number directly to
	        stosb                           ;  dest string.  Include
	        clc                             ;  zero for termination.
		pop	bp
	        ret
char_str        endp

;-----------------------------------------------------------------------------
; VAL STR Convert the source character to its HEX equivalent
; Revised in ver 2.0 to handle more than one character
;-----------------------------------------------------------------------------
val_str         proc    near
	        assume  cs:code,ds:code,es:code
	        mov     di,dest_var_val		;Get ptr to output buff
		mov	si,var1_value		;Get ptr to char string
valstr_1:
		lodsb				;Get character
		or	al,al
		je	valstr_2
		xor	ah,ah
		xor	dx,dx
	        call    hex2asc			;Convert character to
		mov	byte ptr [di-1],' '	;  ascii num and store.
		jmp	short valstr_1
		dec	di
valstr_2:
		xor     al,al                   ;Write number directly to
	        stosb                           ;  dest string.  Include
	        clc                             ;  zero for termination.
		ret
val_str         endp

;-----------------------------------------------------------------------------
; FILEDRIVE STR Return only the directory from a filename string
;-----------------------------------------------------------------------------
filedrive_str   proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Fully qualify filename
	        mov     di,dest_var_val         ;Point string to dest buff
	        call    parse_filename
		mov	byte ptr [di+2],0	;Terminate after drive spec
		clc
	        ret
filedrive_str   endp

;-----------------------------------------------------------------------------
; FILEDIR STR Return only the directory from a filename string
;-----------------------------------------------------------------------------
filedir_str     proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Fully qualify filename
	        mov     di,databuff_ptr         ;Use data buff as temp buff
	        call    parse_filename
		mov	si,dest_var_val
		xchg	si,di
		add	si,2			;Skip past drive stuff
	        mov     bx,di
		mov	dx,bx
		inc	dx
filedir_1:
	        lodsb
		stosb
	        cmp     al,'\'                  ;Mark start of filename or
	        jne     filedir_2               ;  directory.
	        mov     bx,di
filedir_2:
	        or      al,al			;See if at end of string
	        jne     filedir_1
filedir_3:
		cmp	bx,dx			;If root dir, don't delete
		je	filedir_4		;  lone \.
		dec	bx
filedir_4:
		mov	byte ptr [bx],0		;Terminate string at end of
		clc				;  directory
	        ret
filedir_str     endp

;-----------------------------------------------------------------------------
; FILENAME STR Return only the filename from a filename string
;-----------------------------------------------------------------------------
filename_str    proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Fully qualify filename
	        mov     di,databuff_ptr         ;Use data buff as temp buff
		call	get_filename
	        mov     di,dest_var_val		;Pt to dest buff
	        rep     movsb
		xor	al,al			;Terminate filename and
		stosb				;  clear error flag
	        ret
filename_str    endp

;-----------------------------------------------------------------------------
; FILEEXT STR Return only the filename extension from a filename string
;-----------------------------------------------------------------------------
fileext_str     proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Fully qualify filename
	        mov     di,databuff_ptr         ;Use 2nd buff as temp buff
	        call    parse_filename
	        mov     si,di
	        xor     bx,bx
fileext_1:
	        lodsb
	        cmp     al,'.'                  ;Mark start of filename or
	        jne     fileext_2               ;  directory.
	        mov     bx,si
fileext_2:
	        or      al,al
	        jne     fileext_1

	        or      bx,bx
	        je      fileext_3
	        mov     cx,si
	        sub     cx,bx                   ;Compute length
	        mov     di,dest_var_val
	        mov     si,bx
	        rep     movsb
		xor	al,al			;Terminate string
		stosb
fileext_3:
	        clc
	        ret
fileext_str     endp

;-----------------------------------------------------------------------------
; FIND STR  finds a string within another string.
; Exit:      AL - Return code if string not found
;            CF - Set if string not found
;-----------------------------------------------------------------------------
find_str        proc    near
	        mov     si,var1_value           ;To ignore case, capitalize
	        call    caps_string             ;  both strings, then call
	        mov     si,var2_value           ;  the findc function.
	        call    caps_string
	        call    findc_str
	        ret
find_str        endp

;-----------------------------------------------------------------------------
; FINDC STR  finds a string within another string, respects case.
; Exit:      AL - Return code if string not found
;            CF - Set if string not found
;-----------------------------------------------------------------------------
findc_str       proc    near
	        mov     di,var1_value           ;Get ptr to 1st string
	        push    di
	        call    find_end                ;Compute length
	        pop     si
	        push    cx                      ;Save length
	        mov     di,var2_value
	        mov     dx,di
	        call    find_end
	        mov     bx,cx                   ;Save length of search string
	        pop     cx                      ;Restore length of trg string
	        sub     cx,bx                   ;Sub length of search string.
	        jb      find_str_not_found
		inc	cx
find_str_1:
	        push    cx
	        mov     cx,bx                   ;Restore search str length
	        mov     di,dx                   ;Restore ptr to search str
	        push    si
	        repe    cmpsb                   ;Compare command
	        pop     si
	        pop     cx
	        je      find_str_found
	        inc     si                      ;Inc target string ptr
	        loop    find_str_1
find_str_not_found:
	        xor     ax,ax                   ;Set bad return code
	        jmp     short find_str_2
find_str_found:
	        mov     ax,si                   ;Copy offset
	        sub     ax,var1_value           ;Sub starting offset
	        inc     ax
find_str_2:
	        xor     dx,dx
	        mov     di,dest_var_val         ;Convert value to ASCII
	        call    hex2asc
	        clc
find_str_exit:
	        ret
findc_str       endp

;-----------------------------------------------------------------------------
; PARSE STR  Returns the nth token in a string
;-----------------------------------------------------------------------------
parse_str       proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var2_value           ;Convert 2nd param to hex
	        call    asc2hex
		mov	di,100h
		mov	cx,ax			;Save count
		sub	cx,1
		jb	parse_str_3
		mov	bx,var3_value
		mov	dl,[bx]			;Get parse char
		or	dl,dl
		jne	parse_str_0
		mov	dl,' '
parse_str_0:
		mov	si,var1_value		;Get ptr to string
		or	cx,cx			;Check count for 0
		je	parse_str_2
parse_str_1:
  		mov	bl,4			;Scan for char in DL
		call	scan4char
		jc	parse_str_exit
		inc	si
		loop	parse_str_1
parse_str_2:
		mov	di,si
  		mov	bl,4			;Scan for char in DL
		call	scan4char
		mov	byte ptr [si],0		;Term string
parse_str_3:
	        mov     si,dest_var_val         ;Get ptr to output buff
		xchg	si,di
		call	copy_string
parse_str_exit:
		clc
		ret
parse_str       endp

;-----------------------------------------------------------------------------
; COMMAS STR  Returns the nth token in a string
;-----------------------------------------------------------------------------
commas_str      proc    near
	        assume  cs:code,ds:code,es:code
		mov	di,var1_value
		call	find_end
		mov	ax,cx
		mov	cl,3
		div	cl
		mov	cl,ah			;Copy remainder
		xor	ch,ch
		mov	ah,al			;Save quotient
		mov	al,','

		mov	si,var1_value
	        mov     di,dest_var_val         ;Get ptr to output buff
		jcxz	commas_1
		rep	movsb
		jmp	commas_2
commas_1:
		mov	cl,ah
		jcxz	commas_str_exit
		jmp	short commas_4
		
commas_2:
		mov	cl,ah			;Get number of commas
		jcxz	commas_str_exit
commas_3:
		stosb				;Insert comma
commas_4:
		movsw				;Copy 3 digits
		movsb
		loop	commas_3
commas_str_exit:
		xor	al,al
		stosb
		clc
		ret
commas_str      endp

;-----------------------------------------------------------------------------
; REPEAT STR  Returns a string with n number of a character
;-----------------------------------------------------------------------------
repeat_str      proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var2_value           ;Get character to repeat
		mov	al,[si]
		push	ax
	        mov     si,var1_value           ;Convert 2nd param to hex
	        call    asc2hex
		mov	cx,ax
		pop	ax			;Get back repeat char
		or	dx,dx
		jne	repeat_error		;See if repeat number too
		cmp	cx,VAR_SIZE		;  big.
		jae	repeat_error
		mov	di,dest_var_val
		rep	stosb
		xor	al,al
		stosb
		clc
repeat_exit:
		ret
repeat_error:
		mov si,offset errmsg14		;Number too large
		stc
		jmp	short repeat_exit
repeat_str      endp

;=============================================================================
; File Functions
;=============================================================================
;-----------------------------------------------------------------------------
; READ REC returns record n from a file.
;-----------------------------------------------------------------------------
readrec_file    proc    near
	        assume  cs:code,ds:code,es:code
		mov	al,40h			;Read only, deny none
	        call    filename_open
	        jc      readrec_error

	        mov     si,var2_value           ;Convert 2nd param to record
	        call    asc2hex                 ;  number.

	        mov     si,offset errmsg8       ;Record not found.
		sub	ax,1
		sbb	dx,0
		jc	readrec_error1

	        call    findrec_file            ;Find record.
	        mov     ax,si                   ;Copy end of file flag.
	        mov     si,offset errmsg8       ;Record not found.
	        jc      readrec_error1          ;Error if record not found.

	        mov     si,dest_var_val
	        xchg    di,si
	        jcxz    readrec_2
readrec_1:
	        lodsb                           ;Copy record to destination
	        cmp     al,13                   ;  buffer.
	        je      readrec_3
	        stosb
	        loop    readrec_1
readrec_2:
	        or      ah,ah                   ;Check end of file flag
	        jne     readrec_3
	        mov     dx,databuff_ptr         ;If at end of data buffer.
	        mov     cx,VAR_SIZE             ;  read enough to complete
	        call    read_file               ;  record.
	        jc      readrec_error
	        mov     cx,ax                   ;Copy number of bytes read.
	        mov     si,dx			;Point to start of buffer
	        jmp     short readrec_1
readrec_3:
	        xor     al,al                   ;Append terminating zero
	        stosb
	        call    close_file              ;Close file
	        jc      readrec_error
readrec_exit:
	        ret
readrec_error:
		call	parse_doserr
	        jmp	short readrec_exit
readrec_error1:
	        call    close_file
	        stc
	        jmp     short readrec_exit
readrec_file    endp

;-----------------------------------------------------------------------------
; WRITE REC appends a string to the end of a file.
;-----------------------------------------------------------------------------
writerec_file   proc    near
	        assume  cs:code,ds:code,es:code
		mov	al,22h			;Read/Write, deny write 
	        call    filename_open		;Parse name. open file 
	        jnc     writerec_0              ;  no exist, create file.
	        call    create_file
	        jc      writerec_error
	        mov     si,1
	        jmp     short writerec_1
writerec_0:
	        xor     ax,ax                   ;Move file ptr to end of file
	        cwd
	        mov     cx,2                    ;Move pointer from end.
	        call    move_fileptr            ;Move file pointer
	        jc      writerec_error
	        mov     si,1
	        or      dx,dx
	        jne     writerec_01
	        or      ax,ax
	        je      writerec_1
writerec_01:
	        mov     ax,-1                   ;Move file ptr to last byte
	        cwd
	        mov     cx,2                    ;Move pointer from end.
	        call    move_fileptr            ;Move file pointer
	        jc      writerec_error
	        dec     si                      ;Clear EOF marker flag
	
	        mov     dx,dest_var_val         ;Read last char to check for
	        mov     cx,1                    ;  EOF marker
	        call    read_file
	        jc      writerec_error

	        mov     di,dx
	        cmp     byte ptr [di],1Ah
	        jne     writerec_1

	        mov     ax,-1                   ;See if last byte 1A EOF mark
	        cwd
	        mov     cx,2                    ;Move pointer from end.
	        call    move_fileptr            ;Move file pointer
	        jc      writerec_error
	        inc     si                      ;Set EOF marker flag
writerec_1:
	        mov     di,var2_value           ;Get length of string
	        mov     dx,di
	        call    find_end
	        dec     di                      ;Backup before zero
	        mov     ax,0a0dh
	        stosw
	        inc     cx
	        inc     cx
	        or      si,si
	        je      writerec_2
	        mov     al,1ah                  ;Append EOF marker
	        stosb
	        inc     cx
writerec_2:
	        call    write_file
	        jc      writerec_error

	        call    close_file              ;Close file
	        jc      writerec_error
writerec_exit:
	        mov     di,dest_var_val         ;Clear dest value.
	        mov     byte ptr [di],0
	        ret
writerec_error:
		call	parse_doserr		;Get msg for DOS error
	        jmp     short writerec_exit
writerec_error1:
	        call    close_file
	        stc
	        jmp     short writerec_exit
writerec_file   endp

;-----------------------------------------------------------------------------
; NUMREC FILE returns the number of records in a file.
;-----------------------------------------------------------------------------
numrec_file     proc    near
	        assume  cs:code,ds:code,es:code
	        call    filename_open		;Parse name. open file 
	        jc      numrec_error

	        mov     ax,-1                   ;Try to find large rec num
	        mov     dx,ax

	        call    findrec_file            ;Find record.
	        jnc     numrec_error1           ;Error if record found.

	        not     ax                      ;Compliment line count.  
	        not     dx
		sub	ax,1
		sbb	dx,0
		
	        mov     di,dest_var_val         ;Convert rec number to ASCII
	        call    hex2asc

	        call    close_file              ;Close file
	        jc      numrec_error
numrec_exit:
	        ret
numrec_error:
		call	parse_doserr		;Get msg for DOS error
	        jmp     short numrec_exit
numrec_error1:
	        call    close_file
	        jc      numrec_error
	        stc
	        jmp     short numrec_exit
numrec_file     endp

;-----------------------------------------------------------------------------
; FIND REC returns an offset to the Nth record of a file.
; Entry: DX,AX - Record to find
;        BX - Source File handle
; Exit:  DX,AX - Records remaing if end of file
;        CF - Set if record not found.
;        DI - Points to record.
;        CX - Number of bytes to end of data buffer
;        SI - Points to error message if CF set.
;-----------------------------------------------------------------------------
findrec_numl    equ     word ptr [bp-2]
findrec_numh    equ     word ptr [bp-4]
findrec_eof     equ     byte ptr [bp-5]
findrec_file    proc    near
	        assume  cs:code,ds:code,es:code
	        push    bp
	        mov     bp,sp
	        sub     sp,6

	        mov     si,offset errmsg8       ;Record not found
	        mov     findrec_eof,0           ;Clear end of file flag.
	        mov     findrec_numl,ax         ;Save record number.
	        mov     findrec_numh,dx
findrec_1:
	        mov     cx,databuff_ptr
	        xchg    cx,dx

	        mov     cx,DATABUFF_SIZE        ;Get size of data buffer
	        call    read_file               ;Read data from file.
	        jc      findrec_error

	        cmp     ax,cx                   ;See if buffer filled.  If
	        je      findrec_2               ;  not, end of file.
	        mov     findrec_eof,1           ;Set end of file flag.
findrec_2:
	        mov     cx,ax                   ;Copy num bytes read.
	        mov     di,dx                   ;Copy buffer ptr

	        mov     al,13                   ;Scan for CR

		mov	dx,findrec_numl		;Check for end
		or 	dx,findrec_numh
		je	findrec_5

		jmp	short findrec_4
findrec_3:
	        mov     dx,cx                   ;Save position in buffer
	        sub     findrec_numl,1          ;Decriment record count
	        sbb     findrec_numh,0

	        jne     findrec_4               ;See if record count = 0
	        cmp     findrec_numl,0
	        je      findrec_5
findrec_4:
	        repne   scasb
	        je      findrec_3
	        cmp     findrec_eof,1           ;If end of buffer, see if
	        jne     findrec_1               ;  end of file. Yes = exit
	        stc
	        jmp     short findrec_exit
findrec_5:
	        cmp     byte ptr [di],0ah       ;discard Line feed
	        jne     findrec_6
	        inc     di
	        dec     cx
findrec_6:
	        clc
findrec_exit:
	        mov     ah,findrec_eof
	        mov     al,0
	        mov     si,ax                   ;Save end of file flag

	        mov     ax,findrec_numl         ;Get record number.
	        mov     dx,findrec_numh

	        mov     sp,bp
	        pop     bp
	        ret
findrec_error:
		call	parse_doserr		;Get msg for DOS error
findrec_error1:
	        stc
	        jmp     short findrec_exit
findrec_file    endp

;-----------------------------------------------------------------------------
; FILE SIZE  returns the size of a file
;-----------------------------------------------------------------------------
filesize_file   proc    near
	        assume  cs:code,ds:code,es:code
		mov	al,40h			;Read only, deny none.
	        call    filename_open		;Parse name. open file 
	        mov     di,dest_var_val         ;Point DI to result buffer.
	        jc      filesize_error

	        xor     ax,ax                   ;Zero offset.
	        xor     dx,dx
	        mov     cl,2                    ;Move pointer from end.
	        call    move_fileptr            ;Move file pointer
	        jc      filesize_error

	        call    hex2asc                 ;Convert size to ASCII
	        call    close_file              ;Close file
	        jc      filesize_error
filesize_exit:
	        ret
filesize_error:
		call	parse_doserr		;Get msg for DOS error
		jmp	short filesize_exit		
filesize_file   endp

;-----------------------------------------------------------------------------
; TRUENAME FILE  returns the fully qualified name of a file.
;-----------------------------------------------------------------------------
truename_file   proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Fully qualify filename
	        mov     di,dest_var_val         ;Use dest buff as temp buff
	        call    parse_filename
		jnc	truename_1
		mov	si,offset errmsg6	;Illegal filename msg
truename_1:
	        ret
truename_file   endp

;-----------------------------------------------------------------------------
; FILE DATE  returns the date of a file
;-----------------------------------------------------------------------------
filedate_file   proc    near
	        assume  cs:code,ds:code,es:code
		mov	al,40h			;Read only, deny none.
	        call    filename_open
	        jc      filedate_error

		mov	ax,5700h		;Get file date/time
		int	21h
		jc	filedate_error
		push	bx			;Save file handle

		mov	ax,dx			;DX: yyyy yyym mmmd dddd
		shl	dx,1
		shl	dx,1
		shl	dx,1
		mov	dl,al			;DH:Months, DL:days 
		and	dx,0f1fh		;Clear off unneeded bits
		shr	ah,1			;Align years
		mov	cx,1980			;Set starting year
		add	cl,ah			;This fails in year 2048
	        mov     di,dest_var_val
		call 	print_date		;Write date

		pop	bx			;Restore file handle
		call    close_file              ;Close file
	        jc      filedate_error
filedate_exit:
	        ret
filedate_error:
		call	parse_doserr		;Get msg for DOS error
		jmp	short filedate_exit		
filedate_file   endp

;-----------------------------------------------------------------------------
; FILE TIME  returns the time of a file
;-----------------------------------------------------------------------------
filetime_file   proc    near
	        assume  cs:code,ds:code,es:code
		mov	al,40h			;Read only, deny none.
	        call    filename_open		;Parse name. open file 
	        jc      filetime_error

		mov	ax,5700h		;Get file date/time
		int	21h
		jc	filetime_error
		push	bx			;Save file handle
		mov	dh,cl			;CX: hhhh hmmm mmms ssss
		shl	dh,1			;Mul seconds by 2
		and	dh,3fh			;Mask off other bits

		rol	cx,1			;Roll hours to low byte
		rol	cx,1			;  but stop at 3 to
		rol	cx,1			;  copy now aligned 
		mov	al,ch			;  minute bits.

		rol	cx,1
		rol	cx,1
		mov	ch,al			;Get back minutes
		xchg	ch,cl
		and	cx,1f3fh		;Mask off sec bits

	        mov     di,dest_var_val
		call	print_time

		pop	bx			;Restore file handle
		call    close_file              ;Close file
	        jc      filetime_error
filetime_exit:
	        ret
filetime_error:
		call	parse_doserr		;Get msg for DOS error
		jmp	short filetime_exit		
filetime_file   endp

;=============================================================================
; System Functions
;=============================================================================
;-----------------------------------------------------------------------------
; VER SYS returns the DOS version number
;-----------------------------------------------------------------------------
ver_sys         proc    near
	        assume  cs:code,ds:code,es:code
	        mov     ax,dos_version		;Get DOS verison
	        mov     di,dest_var_val
	        call    printver		;Print version
	        clc
	        ret
ver_sys         endp

;-----------------------------------------------------------------------------
; ASK2 SYS prints a string then returns the user response.
;-----------------------------------------------------------------------------
ask2_sys        proc    near
	        assume  cs:code,ds:code,es:code
		mov	al,quiet_flag		;Save state of quiet flag
		push	ax
		mov	quiet_flag,0		;Clear quiet flag 
		xor	bx,bx			;Clear password flag
		mov	cx,VAR_SIZE - 1
		cmp	num_params,1
		jb      ask2_3
		je      ask2_2

	        mov     si,var3_value		;Chk for password flag
		call	asc2hex
		cmp	ax,2
		ja	ask2_1
		mov	bx,ax			;Copy password flag 
ask2_1:
		mov	si,var2_value		;Get max num of chars
		call	asc2hex
		mov	cx,ax
		cmp	cx,VAR_SIZE - 1
		mov	si,offset errmsg14	;Number too large
		ja	ask2_error
ask2_2:
	        mov     si,var1_value
	        call    print_str               ;Print prompt string
ask2_3:
		mov	di,dest_var_val
		call	read_console

	        mov     si,offset endmsg
	        call    print_str               ;Insert a CR-LF

	        clc
ask2_exit:
		pop	ax
		mov	quiet_flag,al
	        ret
ask2_error:
		stc
		jmp	short ask2_exit
ask2_sys        endp

;-----------------------------------------------------------------------------
; ENVFREE SYS returns the number of bytes free in the environment.
;-----------------------------------------------------------------------------
envfree_sys     proc    near
	        assume  cs:code,ds:code,es:code
	        push    es

	        mov     ax,masterenv_seg
		cmp	use_mastenv,0
		jne	envfree_0
		mov	ax,localenv_seg
envfree_0:
	        push    ax
	        dec     ax
	        mov     es,ax
	        mov     dx,es:[3]               ;Get size of env segment
	        mov     cl,4                    ;Convert paragraphs to bytes
	        shl     dx,cl
	        pop     es

	        mov     cx,dx
	        xor     ax,ax
	        xor     di,di
envfree_1:
	        repne   scasb                   ;Loop through the environment
	        cmp     byte ptr es:[di],al     ;  until the end of the
	        loopne  envfree_1               ;  env strings is found.
	        jcxz    envfree_2
	        mov     ax,dx
	        sub     ax,di
		dec	ax			;Sub byte for extra zero
envfree_2:
	        xor     dx,dx
	        pop     es
	        mov     di,dest_var_val
	        call    hex2asc
		clc
envfree_exit:
	        ret
envfree_sys     endp

;-----------------------------------------------------------------------------
; ENVSIZE SYS returns the size of the environment.
;-----------------------------------------------------------------------------
envsize_sys     proc    near
	        assume  cs:code,ds:code,es:code
	        push    es

	        mov     ax,masterenv_seg
		cmp	use_mastenv,0
		jne	envsize_1
		mov	ax,localenv_seg
envsize_1:
	        push    ax
	        dec     ax
	        mov     es,ax
	        mov     ax,es:[3]               ;Get size of env segment
	        mov     cl,4                    ;Convert paragraphs to bytes
	        shl     ax,cl
	        pop     es

	        xor     dx,dx
	        pop     es
	        mov     di,dest_var_val
	        call    hex2asc
	        clc
	        ret
envsize_sys     endp

;-----------------------------------------------------------------------------
; MASTERVAR SYS returns the value from a variable in the master environment.
;-----------------------------------------------------------------------------
mastervar_sys   proc    near
	        assume  cs:code,ds:code,es:code
	        push    ds
	        push    es

	        mov     ax,masterenv_seg
	        mov     di,var1_value		;Point to env var name
		call	getenvvar		;Get ptr to env var value
		jc	mastervar_exit		;CF = 1, var not found.

	        mov     di,cs:dest_var_val	;Copy var value to dest string
	        call    copy_string
	        clc
mastervar_exit:
	        pop     ds
	        pop     es
	        ret
mastervar_sys   endp

;-----------------------------------------------------------------------------
; LOCALVAR SYS returns the value from a variable in the local environment.
;-----------------------------------------------------------------------------
localvar_sys	proc    near
	        assume  cs:code,ds:code,es:code
	        push    ds
	        push    es

		mov	ax,localenv_seg
	        mov     di,var1_value		;Point to env var name
		call	getenvvar		;Get ptr to env var value
		jc	localvar_exit		;CF = 1, var not found.

	        mov     di,cs:dest_var_val	;Copy var value to dest string
	        call    copy_string
	        clc
localvar_exit:
	        pop     ds
	        pop     es
	        ret
localvar_sys	endp

;-----------------------------------------------------------------------
; INWIN SYS returns 1 if Windows currently running.
;-----------------------------------------------------------------------
inwin_sys	proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,1600h		;See if enhanced mode Win
		int	2fh
		or 	al,al
		jne	inwin_1

		mov	ax,4680h		;See if std or real Win
		int	2fh
		or 	al,al
		mov	al,0
		jne	inwin_2
inwin_1:
		mov	al,1			;Indicate Windows active
inwin_2:
		xor	ah,ah
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
	        clc
	        ret
inwin_sys	endp

;-----------------------------------------------------------------------
; INT2FCHECK Calls Interupt 2F (Multiplex) to determine if a program is 
;            loaded.
;-----------------------------------------------------------------------
int2fcheck_sys	proc    near
	        assume  cs:code,ds:code,es:code
		xor	ax,ax
		cmp	dos_version,300h	;Don't call 2F if DOS 2.x
		jb	int2fcheck_3

	        mov     si,var1_value           ;Point to 1st parameter
	        call    caps_string

	        mov     di,offset int2fname_tbl	;See if an alias is used in
	        call    findstr			;  place of a number.
	        jc      int2fcheck_1

	        mov     al,[bx+offset int2falias_tbl]
	        jmp     short int2fcheck_2
int2fcheck_1:
	        mov     si,var1_value           ;Convert 1st parameter to hex
	        call    asc2hex
	        mov     si,offset errmsg14      ;Number too large
		or	dx,dx
		jne	int2fcheck_error	;Make sure the number is 
		or	ah,ah			;  less than 256
		jne	int2fcheck_error
int2fcheck_2:
		xor	ah,ah
		xchg	ah,al			;Device number in AH 0 in AL
		cmp	ah,13h			;Don't call for device 13
		je	int2fcheck_3
		push	si
		push	bp
		pushf
		mov	saved_spint,sp
		int	2fh
		cli
		mov	bx,cs			;Assume nothing after blind
		mov	ds,bx			;  Int 2F call.  Restore stack
		mov	es,bx			;  and other registers.
		mov	ss,bx
		mov	sp,saved_spint
		sti
		popf
		pop	bp
		pop	si
int2fcheck_3:
		xor	ah,ah
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
	        clc
int2fcheck_exit:
	        ret
int2fcheck_error:
		stc
		jmp	short int2fcheck_exit
int2fcheck_sys	endp

;-----------------------------------------------------------------------
; FILES SYS  Returns the number of files that can be opened
;-----------------------------------------------------------------------
files_sys	proc    near
	        assume  cs:code,ds:code,es:code
		push	es
		mov	ah,52h			;Get list of lists
		int	21h
		les	bx,es:[bx+4]		;Get ptr to Sys File Table
		xor	ax,ax			;Clear count
files_1:
		mov	cx,es			;If ptr -1, no more 
		cmp	bx,-1			;  entries.
		je	files_3
files_2:
		add	ax,es:[bx+4]		;Add num of files in tbl
		les	bx,es:[bx]		;Get ptr to next file tbl
		jmp	short files_1
files_3:
		pop	es
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
	        clc
	        ret
files_sys	endp

;-----------------------------------------------------------------------
; LASTDRIVE SYS  Returns the last drive letter allowed by system
;-----------------------------------------------------------------------
lastdrive_sys	proc    near
		push	es
		mov	ah,52h			;Get list of lists
		int	21h
		mov	si,10h			;Assume 2.x offset
		cmp	dos_version,300h
		jb	lastdrive_1
		mov	si,1bh			;Assume 3.0 offset
		cmp	dos_version,310h
		jb	lastdrive_1
		mov	si,1bh			;Assume 3.1,2,3 offset
		cmp	dos_version,400h
		jb	lastdrive_1
		mov	si,21h			;Assume 4.x, 5.x offset
lastdrive_1:
		mov	al,es:[bx+si]		;Get lastdrive value
		add	ax,'@'			;Convert to letter
		pop	es
	        mov     di,dest_var_val
		mov	ah,':'
		stosw
		xor	al,al			;Append terminating 0
		stosb
	        clc
	        ret
lastdrive_sys	endp

;------------------------------------------------------------------------
; TRUEVER SYS returns the real DOS version number. DOS 5 or later
;------------------------------------------------------------------------
truever_sys     proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,dos_version		;Get std DOS version
		cmp	ax,500h
		jb	truever_1
		mov	ax,3306h		;Get real DOS version
		int	21h
		mov	ax,bx
		xchg	al,ah
truever_1:
	        mov     di,dest_var_val
	        call    printver		;Print version
	        clc
truever_exit:
	        ret
truever_sys     endp

;------------------------------------------------------------------------
; CODEPAGE SYS returns the active code page
;------------------------------------------------------------------------
codepage_sys    proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,31eh
		cmp	ax,dos_version		;See if DOS 3.3 
		ja	codepage_error
		mov	ax,6601h		;Get global code page
		int	21h
		mov	ax,bx    		;Get code page
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc			;Print code page
	        clc
codepage_exit:
	        ret
codepage_error:
		call	seterr0msg		;Error, not DOS 3.3
		jmp	short codepage_exit
codepage_sys    endp

;------------------------------------------------------------------------
; COUNTRY SYS returns the active code page
;------------------------------------------------------------------------
country_tbl	db	0,2,7,9,11,13,15,16,17,22
country_sys     proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,3800h		;Get country info
		mov	dx,databuff_ptr		;Point to data buffer
		int	21h
		xor	ah,ah
		cmp	al,-1
		jne	countrysys_1
		mov	ax,bx    		;Get country code
countrysys_1:
		cmp	num_params,0
		je	countrysys_4
		mov	si,var1_value
		call	asc2hex
		mov	si,databuff_ptr
		cmp	ax,9
		ja	countrysys_error
countrysys_2:
		mov	cl,al
		mov	bx,offset country_tbl
		xlat	
		add	si,ax
		mov	ax,[si]			;Get word
		or	cl,cl
		je	countrysys_4
		xor	ah,ah			;Other than 0, byte
		
		cmp	cl,5			;1,2,3,4,9 are
		jbe	countrysys_3		;  ASCIIZ strings
		cmp	cl,9
		je	countrysys_3
		jmp	short countrysys_4
countrysys_3:
	        mov     di,dest_var_val		;Copy string
		call	copy_string
		jmp	short countrysys_exit
countrysys_4:
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc			;Print code page
countrysys_exit:
	        clc
countrysys_exit1:
	        ret
countrysys_error:
		stc
		mov	si,offset errmsg14	;Number too large
		jmp	short countrysys_exit1
country_sys     endp

;------------------------------------------------------------------------
; BIOSDATE SYS returns the date of the ROM BIOS
;------------------------------------------------------------------------
biosdate_sys    proc    near
	        assume  cs:code,ds:code,es:code
		push	ds
		mov	si,0f000h		;ROM segment
		mov	ds,si
		mov	si,0fff5h		;Offset of date
		mov	di,cs:dest_var_val
		mov	cx,4			;Copy 8 bytes
		rep	movsw
		pop	ds
		xor	al,al			;Add terminating 0
		stosb
	        clc
	        ret
biosdate_sys    endp

;------------------------------------------------------------------------
; GETKEY SYS Waits for a key and returns the ASCII code and scan code 
;------------------------------------------------------------------------
getkey_sys      proc    near
	        assume  cs:code,ds:code,es:code
		call	getkey
	        mov     di,dest_var_val
		push	ax
		xor	ah,ah
		xor	dx,dx
	        call    hex2asc
		mov	byte ptr [di-1],' '	;Replace term 0 with space
		pop	ax
		xor	al,al
		xchg	al,ah
	        call    hex2asc
	        clc
	        ret
getkey_sys      endp

;------------------------------------------------------------------------
; LOCALENV SYS Returns the segment of the local env
;------------------------------------------------------------------------
localenv_sys    proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,localenv_seg
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc
	        clc
	        ret
localenv_sys    endp

;------------------------------------------------------------------------
; MASTERENV SYS Returns the segment of the master env
;------------------------------------------------------------------------
masterenv_sys   proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,masterenv_seg
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc
	        clc
	        ret
masterenv_sys   endp

;========================================================================
; Number Functions
;========================================================================
;------------------------------------------------------------------------
; ADD NUM returns the sum of a series of numbers
;------------------------------------------------------------------------
add_num         proc    near
	        assume  cs:code,ds:code,es:code
		mov	bx,offset addnum_callback
		call	process_nums		;Process vars
	        mov     si,offset errmsg12      ;Overflow message
	        ret
addnum_callback:
		add	si,ax			;Add number to running
		adc	di,dx			;  sum.
		ret
add_num         endp

;------------------------------------------------------------------------
; SUB NUM returns the difference of two numbers
;------------------------------------------------------------------------
sub_num         proc    near
	        assume  cs:code,ds:code,es:code
		mov	bx,offset subnum_callback
		call	process_nums		;Process vars
	        mov     si,offset errmsg13      ;Underflow message
	        ret
subnum_callback:
		sub	si,ax			;Add number to running
		sbb	di,dx			;  sum.
	        ret
sub_num         endp

;------------------------------------------------------------------------
; MUL NUM returns the product of two numbers
;------------------------------------------------------------------------
mul_num         proc    near
	        assume  cs:code,ds:code,es:code
		mov	bx,offset mulnum_callback
		call	process_nums		;Process vars
	        mov     si,offset errmsg13      ;Overflow message
mulnum_exit:
	        ret
mul_num_error:
	        stc
	        mov     si,offset errmsg10      ;Multiply overflow
	        stc
	        jmp     short mulnum_exit
mulnum_callback:
		push	bx
		push	cx
		push	dx
		push	bp
	        mov     cx,dx                   ;Copy numbers
	        mov     bx,ax
	        mul     cx                      ;32 bit multiply.
	        jc      mulcb_exit              ;Param 1 in DI,SI
	        mov     bp,ax                   ;Param 2 in CX,BX
	        mov     ax,di
	        mul     cx                      ;              DI   SI
	        or      ax,dx                   ;              CX   BX
	        jnz     mulcb_exit              ; ---------------------
	        mov     ax,di                   ;             (BX * SI)
	        mul     bx                      ;        (BX * DI)
	        jc      mulcb_exit              ;        (CX * SI)
	        add     bp,ax                   ; + (CX * DI)
	        mov     ax,si                   ; ---------------------
	        mul     bx                      ;              DX   AX
	        add     dx,bp
		mov	si,ax
		mov	di,dx
mulcb_exit:
		pop	bp
		pop	dx
		pop	cx
		pop	bx
		ret
mul_num         endp

;------------------------------------------------------------------------
; DIV NUM returns the quotient of two numbers
;------------------------------------------------------------------------
div_num         proc    near
	        assume  cs:code,ds:code,es:code
	        call    conv2num                ;Convert first two parms to
	        jc      div_num_exit            ;  32 bit numbers.
	        push    cx
	        or      cx,bx                   ;Prevent divide by zero
	        pop     cx
	        jz      div_num_error
div_num_1:
	        or      cx,cx                   ;Divide both numbers by 2
	        je      div_num_2               ;  until high word of
	        shr     dx,1                    ;  divisor (CX) is zero.
	        rcr     ax,1

	        shr     cx,1
	        rcr     bx,1
	        jmp     short div_num_1
div_num_2:
	        push    ax                      ;Save low word
	        mov     ax,dx
	        xor     dx,dx
	        div     bx                      ;Divide high word
	        mov     cx,ax                   ;Save high quotent
	        pop     ax
	        div     bx                      ;Divide low word
	        mov     dx,cx

	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
div_num_exit:
	        ret
div_num_error:
	        mov     si,offset errmsg11
	        stc
	        jmp     short div_num_exit
div_num         endp

;------------------------------------------------------------------------
; AND NUM returns the logical AND of two numbers
;------------------------------------------------------------------------
and_num         proc    near
	        assume  cs:code,ds:code,es:code
		mov	bx,offset andnum_callback
		call	process_nums		;Process vars
		mov	si,offset errmsg14	;Number too large
	        ret
andnum_callback:
		and	si,ax			;AND number 
		and	di,dx			;  
		ret
and_num         endp

;------------------------------------------------------------------------
; OR NUM returns the logical OR of two numbers
;------------------------------------------------------------------------
or_num          proc    near
	        assume  cs:code,ds:code,es:code
		mov	bx,offset ornum_callback
		call	process_nums		;Process vars
		mov	si,offset errmsg14	;Number too large
	        ret
ornum_callback:
		or 	si,ax			;OR number 
		or 	di,dx			;  
		ret
or_num          endp

;------------------------------------------------------------------------
; XOR NUM returns the logical exclusive OR of two numbers
;------------------------------------------------------------------------
xor_num         proc    near
	        assume  cs:code,ds:code,es:code
	        call    conv2num                ;Convert first two parms to
	        jc      xor_num_exit            ;  32 bit numbers.  Carry
	        xor     ax,bx                   ;  set, overflow.
	        xor     dx,cx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
xor_num_exit:
	        ret
xor_num         endp
        
;------------------------------------------------------------------------
; NOT NUM returns the inverse of a number
;------------------------------------------------------------------------
not_num         proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Convert 1st parameter to hex
	        call    asc2hex
	        mov     si,offset errmsg14      ;Number too large
	        jc      not_num_exit            ;If error, exit
	        not     ax
	        not     dx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
not_num_exit:
	        ret
not_num         endp

;------------------------------------------------------------------------
; CONVERT NUM converts a number to the base specified by 2nd param
;------------------------------------------------------------------------
convert_num     proc    near
	        assume  cs:code,ds:code,es:code
	        call    conv2num                ;Convert first two parms
		or	cx,cx
		jne	convertnum_error
		cmp	bx,16
		ja	convertnum_error
		cmp 	bl,1
		jbe	convertnum_error
		mov	number_base,bx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
convertnum_exit:
	        ret
convertnum_error:
		mov	si,offset errmsg14	;Number too large
		stc
		jmp	short convertnum_exit
convert_num     endp

;========================================================================
; Programming Functions
;========================================================================
;------------------------------------------------------------------------
; PEEK PROG Returns byte(s) from memory
;------------------------------------------------------------------------
peek_prog	proc    near
	        assume  cs:code,ds:code,es:code
		push	bp
	        call    conv2num                ;Convert first two parms to
	        jc      peek_prog_exit          ;  32 bit numbers.  
		mov	si,offset errmsg14
		or	dx,cx			;Check to see that neither
		jne	peek_prog_err1		;  number > 64K
		mov	cx,1			;Assume 1 byte peek
		mov	bp,0			;Assume byte size peek
	        mov     di,dest_var_val		;Pt to output buff
		mov	si,ax			;Save seg value

		cmp	num_params,3		;If 3rd param, it is the
		jb	peek_prog_1		;  number of bytes to
		push	ax			;  return
		push	bx
		push	si
		mov	si,var3_value
		call	asc2hex
		mov	cx,ax
		pop	si
		pop	bx
		pop	ax
		cmp	num_params,4		;If 4th param, it signals
		jb	peek_prog_1		;  word size peek
		mov	bp,1
		shr	cx,1
peek_prog_1:
		and	cx,003fh		;Allow only 64 bytes out
		jne	peek_prog_2
		mov	cx,1
peek_prog_2:
		push	es
		mov	es,si
		mov	ax,es:[bx]
		pop	es

		or 	bp,bp			;If word size, print
		je	peek_prog_3		;  high byte first.
		push	ax
		xor	al,al
		xchg	ah,al
		xor	dx,dx
		call	lead_zero
	        call    hex2asc                 ;Convert result to ASCII
		inc	bx
		dec	di
		pop	ax
peek_prog_3:
		xor	ah,ah
		xor	dx,dx
		call	lead_zero
	        call    hex2asc                 ;Convert result to ASCII
		inc	bx
		mov	byte ptr [di-1],' '	;Replace term 0 with space
		loop	peek_prog_1

		mov	byte ptr [di-1],0	;Restore term 0
peek_prog_exit:
		pop	bp
	        ret
peek_prog_err1:
		stc
		jmp	short peek_prog_exit
peek_prog	endp

;------------------------------------------------------------------------
; POKE PROG Writes a string of bytes to memory
;------------------------------------------------------------------------
poke_prog	proc    near
	        assume  cs:code,ds:code,es:code
	        call    conv2num                ;Convert first two parms to
	        jc      poke_prog_exit          ;  32 bit numbers.  
		mov	si,offset errmsg14	;Number too large
		or	dx,cx			;Check to see that neither
		jne	poke_prog_error		;  number > 64K

	        mov     si,offset errmsg18	;Not enough parameters
		mov	cx,num_params
		sub	cx,2
		jbe	poke_prog_error
	        mov     si,offset var3_value
		push	es
		mov	es,ax			;Load segment
		mov	di,bx			;Load offset
		cli		
poke_prog_1:
		push	si
		mov	si,[si]			;Get ptr to next var	
	        call 	asc2hex
		pop	si
	        jnc	poke_prog_3
poke_prog_2:
		sti
		pop	es
		mov	si,offset errmsg14	;Number too large
		stc	
		jmp	poke_prog_exit
poke_prog_3:
		or	dx,dx			;Check to see if poke
		jne	poke_prog_2		;  val > 256
		or	ah,ah
		jne	poke_prog_2

		stosb
		inc	si			;Move ptr to next var
		inc	si
		loop	poke_prog_1
		pop	es

	        mov     di,dest_var_val		;Zero return value
		mov	byte ptr [di],0
		clc
poke_prog_exit:
	        ret
poke_prog_error:
		stc
		jmp	short poke_prog_exit
poke_prog	endp

;------------------------------------------------------------------------
; IN PROG Returns a byte from an IO port.
;------------------------------------------------------------------------
in_prog		proc    near
	        assume  cs:code,ds:code,es:code
	        mov     si,var1_value           ;Convert 1st param to hex
	        call    asc2hex
	        mov     si,offset errmsg14      ;Number too large
	        jc      in_prog_exit            ;If error, exit

		or	dx,dx			;Make sure number not too
		jne	in_prog_error		;  big.

		mov	dx,ax
		in	al,dx

		xor	ah,ah
		xor	dx,dx
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
in_prog_exit:
	        ret
in_prog_error:
		stc
		jmp	short in_prog_exit
in_prog		endp

;------------------------------------------------------------------------
; OUT PROG Outputs a byte to an IO port.
;------------------------------------------------------------------------
out_prog	proc    near
	        assume  cs:code,ds:code,es:code
	        call    conv2num                ;Convert first two parms to
	        jc      out_prog_exit           ;  32 bit numbers.  
		mov	si,offset errmsg14	;Number too large
		or	dx,dx			;Check to see that neither
		jne	out_prog_error		;  number > 64K
		or	cx,cx
		jne	poke_prog_error
		or	bh,bh
		jne	poke_prog_error
		
		mov	dl,bl
		xchg	ax,dx
		out	dx,al
	        mov     di,dest_var_val		;Zero output
		mov	byte ptr [di],0
out_prog_exit:
	        ret
out_prog_error:
		stc
		jmp	short out_prog_exit
out_prog	endp
;------------------------------------------------------------------------
; INTERRUPT PROG Performs an system interrupt
; NOTE:  This routine contains self modifying code!!!
;------------------------------------------------------------------------
interrupt_prog	proc    near
	        assume  cs:code,ds:code,es:code
		push	bp
	        mov     si,var1_value           ;Convert 1st param to hex
	        call    asc2hex
	        jnc     intprog_0
intprog_error:
	        mov     si,offset errmsg14      ;Number too large
		stc
		jmp	short intprog_error
intprog_0:
		or	dl,dh			;Make sure number not too
		or	dl,ah			;  big.
		jne	intprog_error
		mov	si,offset intprog_opcode

		mov	[si+1],al		;Set interrupt number

		mov     bp,offset var1_value    ;Get ptr to array
		mov	cx,9
intprog_1:
		inc	bp
		inc	bp
		mov	si,[bp]			;Get ptr to next param
		call	asc2hex			;Convert to hex
		or	dx,dx			;Limit test
		jne	intprog_error
		mov	[bp],ax			;Save hex value
		loop	intprog_1		

		std				;Set direction down!
		mov	si,bp			;copy ptr to array
		lodsw
		mov	es,ax
		assume	es:nothing
		lodsw
		push	ax			;Save DS for later
		lodsw
		mov	bp,ax
		lodsw
		push	ax			;Save SI for later
		lodsw
		mov	di,ax
		lodsw
		mov	dx,ax
		lodsw
		mov	cx,ax
		lodsw
		mov	bx,ax
		lodsw
		pop	si
		pop	ds
intprog_2:
		cld				;For neatness
		assume	ds:nothing
		mov	cs:saved_ssint,ss
		mov	cs:saved_spint,sp		
intprog_opcode:
		int	2fh			;Perform interrupt

		cli
		mov	ss,cs:saved_ssint	;Restore stack
		mov	sp,cs:saved_spint
		sti
		pushf
		cld				;Set dir flag UP
		push	es
		push	di
		push	cs
		pop	es
		assume	es:code
		mov	di,offset var1_value
		stosw				;Save AX
		mov	ax,bx
		stosw
		mov	ax,cx
		stosw
		mov	ax,dx
		stosw
		pop	ax			;Get returned DI
		stosw
		mov	ax,si
		stosw
		mov	ax,bp
		stosw
		mov	ax,ds
		stosw
		pop	ax			;Get returned ES
		stosw
		pop	ax			;Get returned flags		
		stosw

		push	cs			;Reset DS = CS
		pop	ds
		assume	ds:code
		mov	si,offset var1_value
	        mov     di,dest_var_val		;Zero output
		mov	cx,10
intprog_3:
		lodsw				;Get reg value
		xor	dx,dx
		call	hex2asc			;Convert number
		mov	byte ptr [di-1],' '
		loop	intprog_3
		mov	byte ptr [di-1],0	;Restore last 0
		clc
intprog_exit:
		pop	bp
		ret
interrupt_prog	endp

;------------------------------------------------------------------------
; SCAN PROG Returns byte(s) from memory
;------------------------------------------------------------------------
scan_prog	proc    near
	        assume  cs:code,ds:code,es:code
		push	bp
		mov	bp,offset var3_value	;Get ptr to scan bytes
		mov	di,databuff_ptr		;Use file data buff
		mov	cx,num_params
		sub	cx,2
		jbe	scan_prog_error
		mov	bx,cx			;Save byte count
scan_prog_0:
	        mov     si,[bp]			;Get ptr to variable
		inc	bp			;Point BP to next var
		inc	bp
	        call    asc2hex			;Convert ASCII num to
		stosb				;  hex num and store.
		or	dx,dx
		jne	scan_prog_err1
		or	ah,ah
		jne	scan_prog_err1
		loop	scan_prog_0
		xor     al,al                   ;Term string
	        stosb
		mov	bp,bx			;Save scan str length

	        call    conv2num                ;Convert first two parms to
	        jc      scan_prog_exit          ;  32 bit numbers.  
		mov	si,offset errmsg14
		or	dx,cx			;Check to see that neither
		jne	scan_prog_err1		;  number > 64K
		push	es
		mov	es,ax			;Get segment
		mov	dx,databuff_ptr		;DX pts to scan string
		mov	cx,bx			;Scan remaining segment
		neg	cx
scan_prog_2:
		push	cx
		mov	di,bx			;Get mem offset 
		mov	si,dx			;Get scan str offset
		mov	cx,bp			;Get scan str length
		rep	cmpsb
		pop	cx
		je	scan_prog_3
		inc	bx
		loop	scan_prog_2
		pop	es
		mov	si,offset errmsg20	;String not found
		jmp	short scan_prog_error
scan_prog_3:
		pop	es
		xor	dx,dx
		mov	di,dest_var_val
		call	hex2asc
		mov	byte ptr [di-1],' '	;Replace 0 with space
		mov	ax,bx
		call	hex2asc
		clc
scan_prog_exit:
		pop	bp
	        ret
scan_prog_err1:
		mov	si,offset errmsg14	;Number too large
scan_prog_error:
		stc
		jmp	short scan_prog_exit
scan_prog	endp

;========================================================================
; Time and Date Functions
;========================================================================
;------------------------------------------------------------------------
; DAY TIME Returns the name of the current day
;------------------------------------------------------------------------
day_time	proc    near
	        assume  cs:code,ds:code,es:code
		cmp	num_params,1
		jae	day_time_1
		mov	ah,2ah			;Get system day
		int	21h
		xor	ah,ah
		jmp	short day_time_2
day_time_1:
	        mov     si,var1_value           ;Convert 1st parameter to hex
	        call    asc2hex
	        mov     si,offset errmsg14      ;Number too large
	        jc      day_time_exit           ;If error, exit
		or	dx,dx
		jne	day_time_error
		or	ax,ax
		je	day_time_error
		cmp	ax,7
		ja	day_time_error
		dec	ax
day_time_2:
		mov	bx,ax
		mov	di,offset day_list
		call	get_string
		
	        mov     si,cs:dest_var_val	
		xchg	si,di
	        call    copy_string
	        clc
day_time_exit:
		ret
day_time_error:
		stc
		jmp	short day_time_exit
day_time	endp

;------------------------------------------------------------------------
; MONTH TIME Returns the name of the current month
;------------------------------------------------------------------------
month_time	proc    near
	        assume  cs:code,ds:code,es:code
		cmp	num_params,1
		jae	month_time_1
		mov	ah,2ah			;Get system date
		int	21h
		mov	bl,dh
		xor	bh,bh
		jmp	short month_time_2
month_time_1:
	        mov     si,var1_value           ;Convert 1st parameter to hex
	        call    asc2hex
	        mov     si,offset errmsg14      ;Number too large
	        jc      month_time_exit           ;If error, exit
		or	dx,dx
		jne	month_time_error
		or	ax,ax
		je	month_time_error
		cmp	ax,12
		ja	month_time_error
		mov	bx,ax
month_time_2:
		dec	bx
		mov	di,offset month_list
		call	get_string
		
	        mov     si,cs:dest_var_val	
		xchg	si,di
	        call    copy_string
	        clc
month_time_exit:
		ret
month_time_error:
		stc
		jmp	short month_time_exit
month_time	endp

;-----------------------------------------------------------------------
; DATE TIME Returns the current date.  The date is returned either 
;           as Month xx, 199x or as mm-dd-yyyy depending on params.
;-----------------------------------------------------------------------
date_time	proc    near
	        assume  cs:code,ds:code,es:code

		xor	ax,ax			;Clear style flag
		cmp	num_params,1
		jb	date_time_1
	        mov     si,var1_value           ;Convert 1st parameter to hex
	        call    asc2hex
		jc	date_time_error
	        mov     si,offset errmsg14      ;Number too large
		or	dx,dx
		jne	date_time_error
		cmp	al,1
		ja	date_time_error
date_time_1:
		push	ax

		mov	ah,2ah			;Get system date
		int	21h
		xor	ah,ah
		pop	bx			;Get back style param

		cmp	bl,1
		je	date_time_2

		push	cx 			;Save year
		push	dx			;Save day of the month
		mov	bl,dh			;Copy month
		dec	bx
		mov	di,offset month_list
		call	get_string
		
	        mov     si,dest_var_val	
		xchg	si,di
	        call    copy_string
		mov	byte ptr [di-1],' '	;Change term 0 to space
		pop	ax			;Get day
		xor	ah,ah
		xor	dx,dx
	        call    hex2asc                 ;Convert day to ASCII
		mov	word ptr [di-1],' ,'	;Change term 0 to , space
		inc	di
		pop	ax			;Get year
		xor	dx,dx
	        call    hex2asc                 ;Convert year to ASCII
		jmp	short date_time_exit
date_time_2:
	        mov     di,dest_var_val
		call	print_date		;Print in mm-dd-yyyy fmt
date_time_exit:
	        clc
date_time_exit1:
		ret
date_time_error:
		stc
		jmp	short date_time_exit1
date_time	endp

;-----------------------------------------------------------------------
; TIME TIME Returns the current time.  
;-----------------------------------------------------------------------
time_time	proc    near
	        assume  cs:code,ds:code,es:code

	    	mov	ah,2ch			;Get system date
		int	21h

	        mov     di,dest_var_val	
		call	print_time		;Print in hh:mm:ss fmt
time_time_exit:
	        clc
time_time_exit1:
		ret
time_time_error:
		stc
		jmp	short time_time_exit1
time_time	endp

;=======================================================================
; Memory functions
;=======================================================================
;-----------------------------------------------------------------------
; TOTALMEM MEM  Returns the size of the largest blk of free conv mem
;-----------------------------------------------------------------------
totalmem_mem	proc    near
	        assume  cs:code,ds:code,es:code
		int	12h			;Get conv mem size
totalmem_2:
		mov	cx,1024			;Convert Kbytes
		mul	cx			;  to bytes
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
		ret
totalmem_mem	endp

;-----------------------------------------------------------------------
; FREEMEM MEM  Returns the size of the largest blk of free conv mem
;-----------------------------------------------------------------------
freemem_mem	proc    near
	        assume  cs:code,ds:code,es:code
		cmp	installed,0
		je	freemem_1
		mov	ah,48h
		mov	bx,-1			;Ask for all mem
		int	21h
		mov	ax,bx
		jmp	short freemem_2
freemem_1:
		mov	ax,ds:[2]		;Get end of mem ptr
		mov	bx,cs
		sub	ax,bx
freemem_2:
		mov	cx,16			;Convert paragraphs
		mul	cx			;  to bytes
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
		ret
freemem_mem	endp

;-----------------------------------------------------------------------
; FREEEXT MEM  Returns the size of extended memory
;-----------------------------------------------------------------------
freeext_mem	proc    near
	        assume  cs:code,ds:code,es:code
		cmp	xms_version,0		;See if mem driver
		je	freeext_1

		mov	ah,8
		call	ds:[xms_serv]		;Call driver
		jmp	short freeext_2
freeext_1:
		mov	ah,88h			;Get ext mem size
		int	15h			;   BIOS call
		jnc	freeext_2
		xor	ax,ax
freeext_2:
		mov	cx,1024			;Convert 1K to bytes
		mul	cx			
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
freeext_exit:
		ret
freeext_mem	endp

;-----------------------------------------------------------------------
; TOTALEXT MEM  Returns the size of extended memory
;-----------------------------------------------------------------------
totalext_mem	proc    near
	        assume  cs:code,ds:code,es:code
		cmp	xms_version,0		;See if mem driver
		je	totalext_1

		mov	ah,8
		call	ds:[xms_serv]		;Call driver
		mov	ax,dx
		jmp	short totalext_2
totalext_1:
		mov	ah,88h			;Get ext mem size
		int	15h			;   BIOS call
		jnc	totalext_2
		xor	ax,ax
totalext_2:
		mov	cx,1024			;Convert 1K to bytes
		mul	cx			
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
totalext_exit:
		ret
totalext_mem	endp

;-----------------------------------------------------------------------
; EXTVER MEM  Returns the version of the extended memory driver
; Check version again, since some driver change version reporting
; depending on the system environment.
;-----------------------------------------------------------------------
extver_mem	proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,xms_version		;See if mem driver
		or	ax,ax
		je	extver_1
		
		xor	ax,ax
		call	ds:[xms_serv]		;Get version number
		mov	bx,ax			;Version num returned
		shr	al,1			;  as BCD.  Convert
		shr	al,1			;  to std DOS format
		shr	al,1			;  of maj in AH and
		shr	al,1			;  minor in AL
		mov	ah,10
		mul	ah
		and	bl,0fh
		add	al,bl
		mov	ah,bh
extver_1:
	        mov     di,dest_var_val	
		call	printver
	        clc
extver_exit:
		ret
extver_mem	endp

;-----------------------------------------------------------------------
; TOTALEMS MEM  Returns the size of Expanded memory
;-----------------------------------------------------------------------
totalems_mem	proc    near
	        assume  cs:code,ds:code,es:code
		xor	ax,ax
		or	ax,ems_version
		je	totalems_1
		mov	ah,42h			;Get EMS Mem amounts
		int	67h			;Call driver
		mov	ax,dx
		mov	cx,16384		;Convert 16K pages 
		mul	cx			;  to bytes
totalems_1:
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
totalems_exit:
		ret
totalems_mem	endp

;-----------------------------------------------------------------------
; FREEEMS MEM  Returns the amount of free Expanded memory
;-----------------------------------------------------------------------
freeems_mem	proc    near
	        assume  cs:code,ds:code,es:code
		xor	ax,ax
		or	ax,ems_version
		je	freeems_1
		mov	ah,42h			;Get EMS Mem amounts
		int	67h			;Call driver
		mov	ax,bx
		mov	cx,16384		;Convert 16K pages 
		mul	cx			;  to bytes
freeems_1:
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
freeems_exit:
		ret
freeems_mem	endp

;-----------------------------------------------------------------------
; EMSVER MEM  Returns the version of the extended memory driver
; Check version again, since some driver change version reporting
; depending on the system environment.
;-----------------------------------------------------------------------
emsver_mem	proc    near
	        assume  cs:code,ds:code,es:code
		mov	ax,ems_version		;See if mem driver
		or	ax,ax
		je	emsver_1
		mov	ah,46h			;Get version
		int	67h
		or	ah,ah
		je	emsver_0
		xor	ax,ax
emsver_0:
		mov	bl,al			;Convert ver number
		shl	ax,1
		shl	ax,1
		shl	ax,1
		shl	ax,1
		mov	al,bl
		and	ax,0f0fh
emsver_1:
	        mov     di,dest_var_val	
		call	printver
	        clc
emsver_exit:
		ret
emsver_mem	endp

;-----------------------------------------------------------------------
; FREEUMB MEM  Returns the size of the largest free upper memory block 
;-----------------------------------------------------------------------
freeumb_mem	proc    near
	        assume  cs:code,ds:code,es:code
		cmp	dos_version,500h
		jae	freeumb_0

		cmp	xms_version,0
		mov	cx,0
		je	freeumb_3
		mov	dx,-1
		mov	ah,10h			;Request umb from drvr
		call	ds:[xms_serv]
		mov	cx,dx			;Save largest available
		jmp	short freeumb_3
freeumb_0:
		mov	ax,5800h		;Get allocation strat
		int	21h
		push	ax			;Save strategy
		mov	ax,5802h		;Get UMB link state
		int	21h
		xor	ah,ah
		push	ax			;Save link state
		mov	ax,5803h		;Link UMBs
		mov	bx,1
		int	21h
		jnc	freeumb_1
		call	check4xms		;See for ext mem drvr
		mov	cx,0
		jc	freeumb_2
		mov	dx,-1
		mov	ah,10h			;Request umb from drvr
		call	ds:[xms_serv]
		mov	cx,dx			;Save largest available
		jmp	short freeumb_2
freeumb_1:
		mov	ax,5801h		;Set mem alloc strat
		mov	bx,41h			;Best fit high only
		int	21h
		mov	ah,48h			;Alloc mem
		mov	bx,-1
		int	21h
		mov	cx,bx			;Save largest block
freeumb_2:
		pop	bx			;Get UMB link state
		mov	ax,5803h
		int	21h
		pop	bx			;Get mem alloc strat
		mov	ax,5801h
		int	21h
freeumb_3:
		mov	ax,cx
		mov	cx,16
		mul	cx
	        mov     di,dest_var_val	
		call	hex2asc
	        clc
freeumb_exit:			
		ret
freeumb_error:
		call	seterr0msg		;Error, not DOS 5.0
		jmp	short freeumb_exit
freeumb_mem	endp

;=======================================================================
; Program Support Functions
;=======================================================================
;-----------------------------------------------------------------------
; HELP STRINGS  Help function for the program ###
;-----------------------------------------------------------------------
help_tag1	db	"Function: ",0
help_tag2	db	" - Returns ",0
help_tag3	db	13,10,"Syntax:   STRINGS [dest var =] ",0
help_tag4	db	"  ",0
help_tag5	db	"This is a list of the available commands"
help_tag7	db	".",13,10,0
help_tag6	db	13,10,"For help on a specific command type:  "
		db	"STRINGS HELP Command",0
help_error	db	"Command Help not available once installed",0

help_strings	proc    near
	        assume  cs:code,ds:code,es:code
		push	bp

		mov	si,offset program	;Print copyright msg
		call	print_strcr

	        mov     si,cmd_value            ;Point to command buffer
		cmp	help_flag,0
		jne	help_1
		mov	si,var1_value
help_1:
		mov	bp,si
	        call    caps_string		;Search cmd table for
		inc	cx			;  function. If not
	        mov     di,offset command_table	;  found, print general
	        call    findstr			;  help message.
	        jc      help_3

		cmp	installed,0		;If installed, cmd help
		je	help_2			;  not loaded.
		mov	si,offset help_error
       		jmp	short help_7
help_2:
		mov	si,offset help_tag1	;Print lead in.
		call	print_str

		mov	si,bp
		call	print_str		;Print function name

		mov	si,offset help_tag2	;Print sep
		call	print_str

	        shl     bx,1			;Convert index into 
	        shl     bx,1			;  offset into help tbl

		mov	si,[bx+offset help_tbl]	;Print description
		call	print_str
		mov	si,offset help_tag7	;Print usage for fun
		call	print_str

		mov	si,offset help_tag3	;Print usage for fun
		call	print_str

	        mov     si,bp			;Get ptr to command
		call	print_str		;Print function name

		mov	si,offset help_tag4	;Print sep
		call	print_str

		mov	si,[bx + offset help_tbl + 2]
		call	print_strcr		;Print syntax
		jmp	short help_exit
help_3:
		mov	si,offset help_tag5	;Print global help msg
		call	print_strcr

		mov	si,offset command_table	;Print every cmd in 
		xor	bl,bl			;  the command table.
help_4:
		mov	di,dest_var_val
		mov	cx,6
help_5:
		push	cx
		call	copy_string		;Copy command
		dec	di
		mov	al,' '			;Print a cmd every
		neg	cx			;  15 columns.  Fill
		add	cx,13			;  in the space with
		rep	stosb			;  blanks.
		pop	cx
		mov	bl,[si]			;See if end of list
		or	bl,bl
		je	help_6
		loop	help_5
help_6:
		xor	al,al
		stosb
		push	si
		mov	si,dest_var_val
		call	print_strcr
		pop	si
		or	bl,bl
		jne	help_4

		cmp	installed,0		;If installed, don't tell
		jne	help_exit		;  user about cmd help.

		mov	si,offset help_tag6	;Print global help msg
help_7:
		call	print_strcr
help_exit:
		mov	di,dest_var_val
		xor	al,al
		stosb
		clc
		pop	bp
		ret
help_strings	endp

;-----------------------------------------------------------------------
; STRINGSVER  Returns the Strings version
;-----------------------------------------------------------------------
ver_strings	proc	near
		mov	si,offset version
		lodsb
		mov	ah,[si+1]
		mov	di,dest_var_val
		stosw
		mov	ax,0030h		;Add ASCII 0 and term
		stosw
		clc		
		ret
ver_strings	endp

;-----------------------------------------------------------------------
; STRINGSINST  Checks to see if Strings installed as TSR
;-----------------------------------------------------------------------
inst_strings	proc	near
		xor	ax,ax
		mov	dx,ax
		mov	al,installed
		mov	di,dest_var_val
		call	hex2asc
		clc		
		ret
inst_strings	endp

;=======================================================================
; Support Procedures
;=======================================================================
;-----------------------------------------------------------------------
;Read Console  Gets input from the user
; Entry:   CX - Max number of characters to read
;          BL - Set to prevent echo of input
;          DI - Ptr to output buffer
;-----------------------------------------------------------------------
readcon_keys	dw	27,4b00h,8,0
READCON_KEYCNT	equ	4
readcon_jmptbl	dw	offset readcon_echo
     		dw	offset readcon_bs
		dw	offset readcon_bs
		dw	offset readcon_esc

readcon_scur    equ     word ptr [bp-2]
readcon_sptr    equ     word ptr [bp-4]
readcon_cpos    equ     word ptr [bp-6]
readcon_scnt    equ     word ptr [bp-8]
readcon_pswf    equ     word ptr [bp-10]
		
read_console	proc	near
		push	bp
		mov	bp,sp
		sub	sp,10
		push	cx
		mov	ah,0fh			;Get display mode/page
		int	10h
		mov	ah,3			;Get init cursor pos
		int	10h
		pop	cx
		mov	readcon_scur,dx		;Save init cursor pos
		mov	readcon_cpos,0		;Position inside str
		mov	readcon_sptr,di		;Ptr to output buff 
		mov	readcon_scnt,cx		;Num chars to read 
		mov	readcon_pswf,bx		;Password flag
readcon_0:
		call	prog_idle		;Indicate idle
		mov	ah,6
		mov	dl,-1			;Get keyboard input
		int	21h
		jz	readcon_0		;No key, wait
		xor	ah,ah
		or	al,al			;If extended key get
		jne	readcon_1		;  another.

		mov	ah,6
		mov	dl,-1			;Get extended key
		int	21h			;  code.
		xor	ah,ah
		xchg	ah,al
readcon_1:
		cmp	al,13			;See if CR
		je	readcon_exit
		jcxz	readcon_3
		push	cx
		push	di
		mov	di,offset readcon_keys
		mov	cx,READCON_KEYCNT
		repne	scasw
		mov	si,cx
		pop	di
		pop	cx
		je	readcon_2

		dec	cx
		stosb				;Write char to buff		
		xor	si,si
		cmp	readcon_pswf,0
		je	readcon_2
		mov	al,'*'
		cmp	readcon_pswf,1
		je	readcon_2
		mov	al,' '
readcon_2:
		shl	si,1
		call	[si+offset readcon_jmptbl]
		jmp	short readcon_0
readcon_3:
		mov	al,7
		call	readcon_echo		;Beep the speaker
		jmp	short readcon_0
readcon_exit:
		xor	al,al			;Terminate string
		stosb
		clc
		mov	sp,bp
		pop	bp
		ret
;
; Process backspace
;
readcon_bs	proc	near
		cmp	cx,readcon_scnt		;If at start of buff,
		je	readcon_bsexit		;  ignore.
		push	ax
		call	readcon_lcur		;Backup cursor
		mov	al,' '
		call	readcon_echo		;Print space
		pop	ax	
		call	readcon_lcur
		dec	di
		inc	cx
readcon_bsexit:
		stc
		ret
readcon_bs	endp
;
; Process left cursor
;
readcon_lcur	proc	near
		or	cx,cx
		je	readcon_lcurexit
		mov	al,8			;Backspace char
		call	readcon_echo
readcon_lcurexit:
		stc
		ret
readcon_lcur	endp		
;
; Process escape 
;
readcon_esc	proc	near
		cmp	cx,readcon_scnt
		je	readcon_escexit

		mov	ah,3			;Get cursor pos
		int	10h
		mov	cx,readcon_scur		;Get init cur pos
		sub	dl,cl			;Compute difference
		sub	dh,ch
		push	es
		mov	ax,40h
		mov	es,ax
		mov	al,es:[4Ah]
		pop	es
		mov	ah,dh
		mul	ah
		xor	dh,dh
		add	ax,dx
		push	ax
		mov	dx,readcon_scur		;Get initial pos
		call	setcursor
		pop	cx
		jcxz	readcon_esc2
readcon_esc1:
		mov	al,' '
		call	readcon_echo
		loop	readcon_esc1
readcon_esc2:
		mov	dx,readcon_scur		;Get initial pos
		call	setcursor
		mov	di,readcon_sptr
		mov	cx,readcon_scnt
readcon_escexit:
		
		ret
readcon_esc	endp		
;
; Echo character in AL to screen.
;
readcon_echo	proc	near
		push	ax
		push	dx
		mov	dl,al			;Echo character
		mov	ah,2
		int	21h
		pop	dx
		pop	ax
		ret
readcon_echo	endp

read_console	endp

;-----------------------------------------------------------------------
; SETCURSOR  Sets the position of the cursor
; Entry: DX - New cursor position
;        BH - Video page
;-----------------------------------------------------------------------
setcursor	proc	near
		mov	ah,2
		int	10h
setcursor	endp

;-----------------------------------------------------------------------
; PRINTVER  Prints the version number in AX to buff 
; Entry: AX - Version number.  AH = Major ver, AL = Minor ver
;        DI - Pointer to output buffer
;-----------------------------------------------------------------------
printver	proc	near
	        push    ax
	        mov     al,100
	        xchg    al,ah                   ;Copy major ver number
	        mul     ah
	        pop     bx
	        xor     bh,bh
	        add     ax,bx
	        xor     dx,dx
	        call    hex2asc
		ret
printver	endp

;-----------------------------------------------------------------------
; PRINT DATE  Prints a date in mm-dd-yyyy format
; Entry: DH - Month 1 - 12
;        DL - Day 1 - 31
;        CX - Year
;        DI - Ptr to output buffer
;-----------------------------------------------------------------------
print_date	proc	near
		push	cx 			;Save year
		push	dx			;Save day of the month
		mov	al,dh			;Copy month
		xor	ah,ah
		xor	dx,dx
		call	lead_zero		;Add leading zero
	        call    hex2asc                 ;Convert month to ASCII
		mov	byte ptr [di-1],'-'	;Change term 0 to -
		pop	ax			;Get day
		xor	ah,ah			
		call	lead_zero		;Add leading 0
	        call    hex2asc                 ;Convert to ASCII
		mov	byte ptr [di-1],'-'	;Change term 0 to -
		pop	ax
		xor	dx,dx
	        call    hex2asc                 ;Convert year to ASCII
		ret
print_date	endp

;-----------------------------------------------------------------------
; PRINT TIME  Prints the time in hh:mm:ss AM/PM format
; Entry: CH - Hour
;        CL - Minutes
;        DH - Seconds
;        DI - Ptr to output buffer
;-----------------------------------------------------------------------
print_time	proc	near
		mov	bx,"ma"			;Assume AM
		cmp	ch,12
		jbe	print_time_1
		sub	ch,12
		mov	bl,'p'
print_time_1:
		push	bx			;Save AM/PM flag
		push	dx 			;Save seconds
		push	cx			;Save minutes
		mov	al,ch			;Copy hours
		xor	ah,ah
		xor	dx,dx
		call	lead_zero		;Add leading zero
	        call    hex2asc                 ;Convert month to ASCII
		mov	byte ptr [di-1],':'	;Change term 0 to :
		pop	ax			;Get minutes
		xor	ah,ah
		xor	dx,dx
		call	lead_zero		;Add leading 0
	        call    hex2asc                 ;Convert to ASCII
		mov	byte ptr [di-1],':'	;Change term 0 to :
		pop	ax			;Get seconds
		mov	al,ah
		xor	ah,ah
		xor	dx,dx
		call	lead_zero		;Add leading 0
	        call    hex2asc                 ;Convert seconds
		mov	byte ptr [di-1],' '	;Change term 0 to space
		pop	ax			;Get AM/PM tag
		stosw
		xor	al,al			;Term string
		stosb
		clc
		ret
print_time	endp

;-----------------------------------------------------------------------
; Lead Zero - Adds a leading zero if number less than 10
; Entry: DI - Ptr to buffer
;        AL - Number to check
;-----------------------------------------------------------------------
lead_zero	proc	near
		push	bx
		mov	bx,number_base
		cmp	al,bl
		jae	lead_zero_exit
		mov	byte ptr es:[di],'0'
		inc	di
lead_zero_exit:
		pop	bx
		ret
lead_zero	endp

;-----------------------------------------------------------------------------
; GETSTRING  Returns a pointer to a string in a list from depending
;            on an input index value. 
; Entry: ES:DI - Pointer to start of list
;           BX - Index into list
; Exit:     DI - Pointer to string
;           CF - Set if index too big
;-----------------------------------------------------------------------------
get_string      proc    near
	        assume  cs:code,ds:code
		or	bx,bx			;CF = 0
		je	getstring_exit
		call	find_endl
		dec	bx
		cmp	byte ptr es:[di],0
		jne	get_string
		stc
getstring_exit:
		ret
get_string      endp

;-----------------------------------------------------------------------
; PROCESS NUMS  Converts each parameter to a number then calls back
;               to a routine for specific processing.
; Entry:      BX - Ptr to callback procedure
;
; Exit:     CF    - Set if number too large
;
; Callback: 
;   Called with:  DX AX - Number from parameter
;                 SI DI - Running sum/product/logical number
;   Return:          CF - Set if processing should terminate;   
;-----------------------------------------------------------------------
process_nums	proc	near
		push	bp
	        mov     si,var1_value		;Get ptr to variable
	        call    asc2hex
		mov	si,ax			;Init vars
		mov	di,dx
		mov	bp,offset var2_value	;Get ptr to var array
		mov	cx,num_params
		dec	cx
		jbe 	procnum_exit
procnum_1:
		push	si
	        mov     si,[bp]			;Get ptr to variable
	        call    asc2hex
		pop	si
		jc	procnum_exit
		call	bx			;Call callback function
		jc	procnum_exit
		inc	bp			;Point BP to next var
		inc	bp
		loop	procnum_1

		mov	ax,si			;Copy number
		mov	dx,di	    
	        mov     di,dest_var_val
	        call    hex2asc                 ;Convert result to ASCII
		clc
procnum_exit:
		pop	bp
	        ret
process_nums    endp

;-----------------------------------------------------------------------
; CONV2NUM  converts the first two parameters to hex numbers.
; Exit:    DX AX - Number from 1st parameter
;          CX BX - Number from 2nd parameter
;          CF    - Set if either number too large
;          SI    - Set to error message if CF set
;-----------------------------------------------------------------------
conv2num        proc    near
	        mov     si,var2_value           ;Convert 2nd param to hex
	        call    asc2hex
	        jc      conv2num_error
	        mov     bx,ax                   ;Copy second parameter
	        mov     cx,dx

	        mov     si,var1_value           ;Convert 1st param to hex
	        call    asc2hex
	        jc      conv2num_error
conv2num_exit:
	        ret
conv2num_error:
	        mov     si,offset errmsg14      ;Number too large
	        jmp     short conv2num_exit
conv2num        endp

;-----------------------------------------------------------------------
; PARSE CMDLINE  Parse the cmd line into seperate strings for each param
; Exit:   CF - Set if error.
;         SI - Points to error message if CF set.
;-----------------------------------------------------------------------
parse_cmdline   proc    near
		xor	cx,cx
		mov	num_params,cx		;Init flags with zeros
		mov	quiet_flag,cl
		mov	use_mastenv,cl
		mov	help_flag,cl
		mov	number_base,10
		mov	console_out,1		
		mov	parse_char,DEF_PARSE_CHAR

		mov	cl,MAX_PARAMS + 2	;Init ptrs to zero string
		mov	di,offset dest_var_name
		mov	ax,offset entry		;Point to zero byte
		rep	stosw

	        mov     si,offset command_tail
	        cmp     byte ptr [si],0         ;See if cmdline = 0
	        jne     parse_cmdline_0         ;If zero, report error
parse_error:
		cmp	help_flag,0
		je	parse_error1
		jmp	parse_cmdline_exit
parse_error1:
	        mov     si,offset errmsg1       ;Syntax error message
		mov	al,install_flag
		or	al,remove_flag
		je	parse_error2
		mov	si,100h
parse_error2:
		stc
		jmp	parse_cmdline_exit1
parse_cmdline_0:
		;
		; Added in 2.4 to untranslate graphic equals to =.
		;
	        xor     cx,cx
		mov	cl,[si]
		inc	si
		mov	di,si
		mov	al,equalsub_char
parse_cmdline_01:
		repne	scasb
		jne	parse_cmdline_1
		mov	byte ptr [di-1],'='
		or	cx,cx
		jnz	parse_cmdline_01
parse_cmdline_1:
	        xor     bx,bx
	        call    scan4char               ;Find 1st char
	        jc      parse_error
	
	        cmp     al,'/'                  ;See if cmdline switch
	        jne     parse_cmdline_2
		call	parse_switch		;Parse cmd line switch
		jnc	parse_cmdline_1
		jmp	parse_cmdline_exit1
parse_cmdline_2:
		mov	dest_var_name,si
		mov	cmd_value,si
		mov	bl,3			;Scan for space or =
		call	scan4char
		mov	byte ptr [si],0		;Term 1st string
		jc	parse_cmdline_exit
		cmp	al,'='			;If = found, first word
		je	parse_cmdline_3		;  was dest env var
		xor	bl,bl
		call	scan4char
		jc	parse_cmdline_exit
		cmp	al,'='
		jne	parse_cmdline_4
parse_cmdline_3:
		inc	si			;Move past =
		xor	bx,bx	    		;Find next char
		call	scan4char
		jc	parse_error
		mov	cmd_value,si		;Save ptr to cmd
		mov	console_out,0		;No screen output
		mov	bl,1
		call	scan4char		;Find end of command
		mov	byte ptr [si],0		;Term cmd name
		jc	parse_cmdline_exit
		xor	bl,bl
		call	scan4char		;Find 1st param
		jc	parse_cmdline_exit
parse_cmdline_4:
	        mov     bp,offset var1_value
		mov	cx,MAX_PARAMS
parse_cmdline_5:
		mov	[bp],si			;Save ptr to param
		add	bp,2
		inc	num_params		

		mov	bl,4			;Scan until parse char
		mov	dl,parse_char
		call	scan4char
		mov	byte ptr [si],0		;Term param
		jc	parse_cmdline_exit

		cmp	[si+1],dl
		jne	parse_cmdline_6
		inc	si
		inc	si
		jmp	short parse_cmdline_7
parse_cmdline_6:
		xor	bl,bl			;Scan until 1st char of
		call	scan4char		;  next param
parse_cmdline_7:
		loop	parse_cmdline_5
parse_cmdline_exit:
	        clc
parse_cmdline_exit1:
	        ret
parse_cmdline   endp

;-----------------------------------------------------------------------
; PARSE SWITCH  Parse command line switches
;   Entry:  SI - Pointer to / chararacter
;   Exit:   CF - Set if error
;           SI - If error, points to error message string
;-----------------------------------------------------------------------
parse_switch	proc    near
		assume	cs:code,ds:code
	        inc     si                      ;Skip past '/'.
	        lodsb                           ;Get cmdline switch

		mov	di,offset cmd_switches	
		mov	cx,offset cmd_switch_end - offset cmd_switches
		mov	bx,offset cmd_switch_end - offset cmd_switches - 1
		or	al,20h			;Make switch lower case
		repne	scasb
		mov	dx,offset errmsg3	;Command not found msg
		stc
		jne	switch_exit
		sub	bx,cx			;Compute offset into list
		shl	bx,1			;Convert to word offset
		clc				;Assume pass
		call	cs:[bx+offset cmd_jmp_tbl] ;Call command routine.
switch_exit:
		ret
switch_master:
	        mov     use_mastenv,1           ;Set use master env flag
		ret
switch_quiet:
	        mov     quiet_flag,1            ;Set to suppress output
		ret
switch_pchar:
	        lodsb
	        mov     parse_char,al           ;Set new parse character
		ret
switch_base:
		call	asc2hex			;Base at 10 right now
		dec	si
		or	dx,dx			;Check for proper range
		jne	switch_base1
		cmp	ax,1
		jbe	switch_base1
		cmp	ax,16
		ja	switch_base1
		mov     number_base,ax          ;Set new base
		clc
		ret
switch_base1:
		mov	si,offset errmsg24	;Base outside range
		stc
		ret
switch_help:
		mov	help_flag,1		;Set help flag
		ret
switch_install:
		cmp	installed,0
		je	switch_install1
		mov	si,offset errmsg23
		stc
		jmp	short switch_install2
switch_install1:
	        mov     install_flag,1          ;Set to install as TSR
		clc
switch_install2:
		ret
switch_remove:
		cmp	installed,0
		jne	switch_remove1
		mov	si,offset errmsg21
		stc
		jmp	short switch_remove2
switch_remove1:
	        mov     remove_flag,1          ;Set to remove as TSR
		clc
switch_remove2:
		ret
parse_switch	endp

;-----------------------------------------------------------------------
; GETCOMSPEC returns the name of the command processor from the env
;-----------------------------------------------------------------------
getcomspec      proc    near
	        push    ds

		mov	ax,ds:[2ch]		;Get prog environment segment
	        mov     di,offset shell_var	;Point to COMSPEC var name
		call	getenvvar		;Get ptr to env var value
		jc	getcomspec_exit		;CF = 1, var not found.

	        mov     di,cs:dest_var_val	;Copy var value to dest string
		push	di
	        call    copy_string
		pop	si
		pop	ds

	        mov     di,databuff_ptr         ;Use 2nd buff as temp buff
	        call    parse_filename
	        mov     si,di
	        mov     bx,di
getcomspec_1:
	        lodsb
	        cmp     al,'\'                  ;Mark start of filename or
	        jne     getcomspec_2            ;  directory.
	        mov     bx,si
getcomspec_2:
	        or      al,al
	        je      getcomspec_3
	        cmp     al,'.'
	        jne     getcomspec_1
	        dec     si
getcomspec_3:
	        mov     cx,si
	        sub     cx,bx                   ;Compute length
		cmp	cx,8
		jb	getcomspec_4
		mov	cx,8
getcomspec_4:
		mov	shell_namlen,cl		;Save length of comspec name
	        mov     di,offset shell_name
	        mov     si,bx
	        rep     movsb
		xor	al,al
		stosb
getcomspec_exit:
		xor	ax,ax
		mov	di,dest_var_val		;ReZero the buffer.  This is
		mov	cx,VAR_SIZE		;  what caused the FILENAME
		rep	stosb			;  and FILEEXT bugs in 1.1
		clc
	        ret
getcomspec      endp


;-----------------------------------------------------------------------------
; FILENAME STR Return only the filename from a filename string
; Entry:  SI - Partial filename
;         DI - Working buffer
; Exit:   SI - Points to file name
;         CX - Length of filename
;-----------------------------------------------------------------------------
get_filename    proc    near
	        assume  cs:code,ds:code,es:code
	        call    parse_filename
	        mov     si,di
	        mov     bx,di
getfname_1:
	        lodsb
	        cmp     al,'\'                  ;Mark start of filename or
	        jne     getfname_2              ;  directory.
	        mov     bx,si
getfname_2:
	        cmp     al,'.'			;Mark end of filename or
	        jne     getfname_3 		;  dir name.
	        mov	di,si
getfname_3:
	        or      al,al
	        jne     getfname_1
		cmp	di,bx
		ja 	getfname_4
		mov	di,si
getfname_4:
		dec	di
		mov	byte ptr ds:[di],0	;Terminate 
	        mov     cx,di
	        sub     cx,bx                   ;Compute length
	        mov     si,bx
	        ret
get_filename    endp


;-----------------------------------------------------------------------
; FILENAME OPEN  Does std parsing of name and opens file
;   Entry:  AL - File open flags
;-----------------------------------------------------------------------
filename_open	proc    near
	        assume  cs:code,ds:code,es:code
		push	ax
	        mov     si,var1_value           ;Fully qualify filename
	        mov     di,dest_var_val         ;Use dest buff as temp buff
	        call    parse_filename
	        mov     dx,di                   ;Copy filename pointer
		pop	ax
		push	ax
	        call    open_file
		jnc	filename_open_exit
	        mov     di,dest_var_val         ;Use dest buff as temp buff
	        call    parse_filename1
	        mov     dx,di                   ;Copy filename pointer
		pop	ax
		push	ax
	        call    open_file
filename_open_exit:
		pop	ax
		ret
		ret
filename_open	endp
;-----------------------------------------------------------------------
; PARSE FILENAME  creates a proper pathname for a filename
;   Entry:  SI - Pointer to ASCIIZ filename
;           DI - Pointer to buffer to hold resulting pathname
;-----------------------------------------------------------------------
parse_filename  proc    near
	        assume  cs:code,ds:code,es:code
	        push    di
	        push    si
	        cmp     dos_version,300h        ;See if DOS 3.x or greater.
	        jb      parse_fname_0           ;If not, parse the old way.
	        mov     ah,60h                  ;DOS Resolve Path
	        int     21h
	        jmp     short parse_fname_7
parse_filename1:
	        push    di			;2nd Entry pt w/o using
	        push    si			;  int cmd.
parse_fname_0:
	        cmp     byte ptr [si+1],":"     ;See if disk specified
	        je      parse_fname_1           ;Yes, skip disk assignment

	        mov     ah,19h                  ;Get default disk
	        int     21h
	        inc     al

	        mov     dl,al                   ;Save default disk number
	        add     al,40h                  ;Make ASCII
	        mov     ah,":"
	        jmp     short parse_fname_2
parse_fname_1:
	        lodsw                           ;Get disk specified
	        and     al,0DFh                 ;Convert to caps
	        mov     dl,al
	        sub     dl,40h                  ;Convert to hex
parse_fname_2:
	        stosw                           ;Load disk specification
;Look for directory specification.
	        mov     bx,di                   ;save start of path
	        mov     al,"\"
	        cmp     byte ptr [si],al        ;See if starting from root
	        je      parse_fname_3            ;Yes, skip append of path

	        stosb                           ;Start at root
	        push    si                      ;Save current pointer
	        mov     si,di                   ;Point to dest buffer
	        mov     ah,47h                  ;Get default path
	        int     21h
	        pop     si

	        cmp     byte ptr [di],0         ;See if NULL path
	        je      parse_fname_3

	        call    find_end                ;Scan to end of path string
	        dec     di                      ;move back before zero
	        mov     al,"\"                  ;Append path string with
	        stosb                           ;  a \.  CX = length of path
parse_fname_3:
	        add     cx,2                    ;Append filename to path.
	        mov     ax,VAR_SIZE             ;Compute space remaining in
	        sub     ax,cx                   ;  the destination buffer.
	        xchg    cx,ax
	        xor     ah,ah                   ;Clear last char holder
parse_fname_4:
	        lodsb                           ;Get filename character.  If
	        or      al,al                   ;  end of string, exit.
	        jz      parse_fname_6           ;Else, write char.
	        stosb
	        cmp     ax,".."                 ;If last two chars are ..,
	        jne     parse_fname_5           ;  scan backwards to delete
	        std                             ;  last directory.
	        sub     di,4                    ;First, backup past '\..'
	        mov     al,"\"                  ;Look for directory sep
	        push    cx
	        mov     cx,di                   ;Compute length of path
	        sub     cx,bx
	        repne   scasb                   ;Now, past last directory
	        pop     cx
	        cld                             ;Scan forwards again
	        inc     di                      ;Move back past \
parse_fname_5:
	        mov     ah,al                   ;Save last character read.
	        loop    parse_fname_4
parse_fname_6:
	        xor     al,al                   ;Terminate string with 0
	        stosb
parse_fname_7:
	        pop     si
	        pop     di
	        ret
parse_filename  endp

;-----------------------------------------------------------------------------
; CREATE FILE Creates a new file.
; Entry:  DX - Pointer to ASCIIZ filename.
; Exit:   BX - File handle
;         CF - Set if error
;-----------------------------------------------------------------------------
create_file     proc    near
	        push    cx
	        mov     ah,3ch                  ;Create file
	        xor     cx,cx                   ;Normal attributes
	        int     21h
	        mov     bx,ax                   ;Copy file handle
	        pop     cx
	        ret
create_file     endp

;-----------------------------------------------------------------------------
; OPEN FILE Opens a file.
; Entry:  AL - Access flags
;         DX - Pointer to ASCIIZ filename.
; Exit:   BX - File handle
;         CF - Set if error
;-----------------------------------------------------------------------------
open_file       proc    near
	        mov     ah,3dh                  ;Open file
	        int     21h
	        mov     bx,ax                   ;Copy file handle
	        ret
open_file       endp

;-----------------------------------------------------------------------------
; CLOSE FILE Closes a file.
; Entry:  BX - File handle
; Exit:   CF - Set if error
;-----------------------------------------------------------------------------
close_file      proc    near
	        mov     ah,3eh                  ;Close file
	        int     21h
	        ret
close_file      endp

;-----------------------------------------------------------------------------
; READ FILE Reads data from a file
; Entry:  BX - File handle
;         CX - Number of bytes to read
;         DX - Pointer to data buffer
; Exit:   CF - Set if error
;         AX - bytes read.
;-----------------------------------------------------------------------------
read_file       proc    near
	        mov     ah,3fh                  ;Read file data
	        int     21h
	        ret
read_file       endp

;-----------------------------------------------------------------------------
; WRITE FILE Writes data to a file
; Entry:  BX - File handle
;         CX - Number of bytes to write
;         DX - Pointer to data buffer
; Exit:   CF - Set if error
;-----------------------------------------------------------------------------
write_file      proc    near
	        mov     ah,40h                  ;Write file data
	        int     21h
	        ret
write_file      endp

;-----------------------------------------------------------------------------
; MOVE FILEPTR Moves the file read pointer of a file.
; Entry:  AX,DX - Offset of file pointer
;            BX - File handle
;            CL - Move type, 0 = from start, 1 = cur pos, 2 = from end.
; Exit:      CF - Set if error
;-----------------------------------------------------------------------------
move_fileptr    proc    near
	        xchg    cx,dx                   ;Copy most sig word
	        xchg    dx,ax                   ;Copy least sig word
	        mov     ah,42h                  ;Move file pointer
	        int     21h
	        ret
move_fileptr    endp

;-----------------------------------------------------------------------------
; PARSE DOSERR Points SI to the proper DOS error string
; Entry:  AL - DOS error number
; Exit:   SI - Pointer to ASCIIZ string
;-----------------------------------------------------------------------------
parse_doserr    proc    near
		xor	ah,ah
		cmp	al,34
		jbe	parse_doserr_1
		xor	al,al
parse_doserr_1:
		shl	ax,1
		mov	si,offset doserr_tbl
		add	si,ax
		mov	si,[si]
		stc				;Set error flag
	        ret
parse_doserr    endp

;-----------------------------------------------------------------------------
; TRUNCNUM truncates a number to the max length of a string
; Entry:  AX - Number to truncate
; Exit:   AX - Truncated number
;-----------------------------------------------------------------------------
truncnum        proc    near
	        cmp     ax,VAR_SIZE             ;VAR_SIZE = max string length
	        jb      trunc_1
	        mov     ax,VAR_SIZE
trunc_1:
	        ret
truncnum        endp

;-----------------------------------------------------------------------------
; FINDSTR  determines if a string is in a list.
; Entry:  DS:SI - Pointer to ASCII string to find.
;         ES:DI - Pointer to list of ASCIIZ strings.
;            CX - Size of string
; Exit:      DI - Pointer to entry in list
;            CF - Clear if string found
;            BX - If CF clear, index into list
;-----------------------------------------------------------------------------
findstr         proc    near
	        push    cx
	        push    dx
	        xor     dx,dx
	        or      dx,cx                   ;Save length of string
	        je      finds_3
	        xor     bx,bx                   ;Zero index counter
finds_1:
	        push    di
	        push    si
	        push    cx
	        repe    cmpsb                   ;Compare command
	        pop     cx
	        pop     si
	        pop     di
	        clc
	        je      findstr_exit
	        inc     bx                      ;Inc string count

	        push    cx
	        call    find_endl               ;Find end of string.
	        pop     cx
	        jne     finds_3
	        cmp     byte ptr es:[di],0      ;See if second zero. If so
	        jne     finds_1                 ;  end of list.
finds_3:
	        stc                             ;Indicate string not found
findstr_exit:
	        pop     dx
	        pop     cx
	        ret
findstr         endp

;-----------------------------------------------------------------------------
; FIND END scans to the end of an ASCIIZ string.
; Entry:  ES:DI - Pointer to ASCII string
; Exit:   ES:DI - Pointers to character after string.
;            CX - Length of string
;            ZF - Clear if end not found in MAX length of characters
;-----------------------------------------------------------------------------
find_end        proc    near
	        push    ax
	        mov     cx,VAR_SIZE
	        xor     al,al
	        repne   scasb
	        pushf
	        mov     ax,VAR_SIZE
	        sub     ax,cx
	        xchg    ax,cx
	        dec     cx
	        popf
	        pop     ax
	        ret
find_end        endp

;-----------------------------------------------------------------------------
; FIND ENDL scans to the end of an ASCIIZ string. String can be up to 32K
; Entry:  ES:DI - Pointer to ASCII string
; Exit:   ES:DI - Pointers to character after string.
;            CX - Length of string
;            ZF - Clear if end not found in MAX length of characters
;-----------------------------------------------------------------------------
find_endl       proc    near
	        push    ax
	        mov     cx,8000h
	        xor     al,al
	        repne   scasb
	        pushf
	        mov     ax,8000h
	        sub     ax,cx
	        xchg    ax,cx
	        dec     cx
	        popf
	        pop     ax
	        ret
find_endl       endp

;-----------------------------------------------------------------------------
; CAPS STRING capitalizes ASCIIZ string
; Entry:  SI - Pointer to ASCII string to capitalize
; Exit:   CX - Length of string
;-----------------------------------------------------------------------------
caps_string     proc near
	        assume  ds:code,es:code
	        push    bx
	        push    dx
	        mov     bx,"za"                 ;Set filter limits
	        mov     dx,0df00h               ;Set character filter
	        call    filter_string
	        pop     dx
	        pop     bx
	        ret
caps_string     endp

;-----------------------------------------------------------------------------
; LC STRING makes an ASCIIZ string lower case
; Entry:  SI - Pointer to ASCII
; Exit:   CX - Length of string
;-----------------------------------------------------------------------------
lc_string       proc near
	        assume  ds:code,es:code
	        push    bx
	        push    dx
	        mov     bx,"ZA"                 ;Set filter limits
	        mov     dx,0ff20h               ;Set character filter
	        call    filter_string
	        pop     dx
	        pop     bx
	        ret
lc_string       endp

;-----------------------------------------------------------------------------
; FILTER STRING filters an ASCIIZ string
; Entry: DS:SI - Pointer to ASCII string
;           BL - Lower limit of char range
;           BH - Upper limit of char range
;           DL - OR  filter
;           DH - AND filter
; Exit:     CX - Length of string
;-----------------------------------------------------------------------------
filter_string   proc near
	        assume  ds:code,es:code
	        push    si
	        push    di
	        push    es

	        mov     di,si
	        push    ds
	        pop     es
	        xor     cx,cx                   ;Clear byte counter.
filter_1:
	        lodsb                           ;Get character
	        or      al,al                   ;Allow any non-space character
	        je      filter_exit
	        cmp     al,bl                   ;If between lower and upper
	        jb      filter_2                ;  char limit it.
	        cmp     al,bh
	        ja      filter_2
	        or      al,dl                   ;Apply OR filter
	        and     al,dh                   ;Apply AND filter
filter_2:
	        stosb                           ;Save character
	        inc     cx                      ;Inc byte counter
	        jmp     short filter_1
filter_exit:
	        pop     es
	        pop     di
	        pop     si
	        ret
filter_string   endp

;-----------------------------------------------------------------------------
; COPY STRING copies an ASCIIZ string
; Entry:  DS:SI - Pointer to source ASCIIZ string
;         ES:DI - Pointer to destination buffer
; Exit:   CX - Length of string
;-----------------------------------------------------------------------------
copy_string     proc near
	        assume  ds:code,es:code
	        xor     cx,cx
copy_string_1:
	        lodsb                           ;Move character
	        stosb
	        or      al,al                   ;See if end of string
	        je      copy_string_exit        ;If so, exit
	        inc     cx                      ;Inc count
	        jmp     short copy_string_1
copy_string_exit:
	        ret
copy_string     endp

;-----------------------------------------------------------------------------
; PRINT STRCR prints an ASCIIZ string then appends a CR LF to the end
; Entry:  SI - pointer to ASCIIZ string.
;-----------------------------------------------------------------------------
print_strcr     proc    near
	        assume  ds:nothing,es:nothing
	        call    print_str
	        mov     si,offset endmsg
	        call    print_str
	        ret
print_strcr     endp

;-----------------------------------------------------------------------------
; PRINT STR  prints an ASCIIZ string to the std output device
; Entry:  SI - Pointer to ASCIIZ string.
;-----------------------------------------------------------------------------
print_str       proc    near
		cmp	cs:quiet_flag,0
		jne	print_str_exit
	        lodsb                           ;Get character
	        or      al,al                   ;See if end of string
	        je      print_str_exit
	        mov     ah,2                    ;DOS print character
	        mov     dl,al
	        int     21h                     ;Call DOS
	        jmp     short print_str
print_str_exit:
	        ret
print_str       endp

;-----------------------------------------------------------------------------
; HEX2ASC converts number in DX AX to ASCII
; Entry:  DX AX - Number
;         DI - Destination buffer
;         CF - Clear
; Exit:   Di - Points to byte past terminating 0
;-----------------------------------------------------------------------------
hex2asc         proc near
	        assume  ds:nothing,es:nothing
	        push    ax
	        push    bx
	        push    cx
	        push    dx
	        push    si

	        mov     si,cs:number_base       ;Load number base
	        mov     bx,ax
	        mov     cx,dx
	        mov     dx,-1                   ;Load end of number flag
	        push    dx
hex_loop1:
	        xchg    ax,cx                   ;Get high word in AX
	        xor     dx,dx                   ;Clear high word
	        div     si                      ;Divide by base (10)
	        xchg    cx,ax                   ;Save result of high divide
	        xchg    ax,bx                   ;Get low word, leave remainder
	        div     si                      ;  in DX.
	        xchg    bx,ax                   ;Save result of low divide

	        add     dl,30h                  ;Convert to ascii
		cmp	dl,'9'
		jbe	hex_1
		add	dl,7
hex_1:
	        push    dx                      ;Save digit on stack
	        or      bx,bx
	        jne     hex_loop1               ;See if number = 0.  If not,
	        or      cx,cx                   ;  continue divide loop.
	        jne     hex_loop1

	        mov     bl,"0"                  ;Set leading zero flag
hex_loop2:
	        pop     dx                      ;Get digit off stack
	        cmp     dx,-1                   ;See if end flag
	        je      hex_2
	        or      bl,dl                   ;Don't print leading zeros.
	        cmp     bl,"0"                  ;The first non zero will
	        je      hex_loop2               ;  change bl to non-zero.
	        mov     al,dl                   ;Write to buffer
	        stosb
	        jmp     short hex_loop2
hex_2:
	        cmp     bl,"0"                  ;If number zero, write last
	        jne     hex_exit                ;  zero.
	        mov     al,bl
	        stosb
hex_exit:
	        xor     al,al                   ;Termainate with zero
	        stosb
	        pop     si
	        pop     dx
	        pop     cx
	        pop     bx
	        pop     ax
	        ret
hex2asc         endp

;------------------------------------------------------------------------
; ASC2HEX converts an ASCII number to hex
; Entry:     SI - Pointer to ASCIIZ string
; Exit:   DX,AX - Number
;            CF - Set if overflow
;------------------------------------------------------------------------
asc2hex         proc    near
	        assume  ds:nothing,es:nothing
	        push    bx
	        push    cx
		push	di
	        xor     cx,cx                   ;Zero result
	        xor     di,di
	        xor     bx,bx			;Keep BH clear
asc_loop1:
	        mov     bl,[si]                 ;Get next digit
	        inc     si
		cmp	bl,"9"
		jbe	asc_1
		and	bl,0dfh			;Make upper case
		sub	bl,7
asc_1:
	        sub     bl,"0"                  ;Convert digit from ASCII to
	        jb      asc_exit                ;  hex.  If digit illegal
		cmp	bx,cs:number_base	;  char, exit.
	        jae     asc_exit
asc_2:
	        xchg    ax,di                   ;Shift result in DI CX by
	        mul     cs:number_base          ;  the base.
	        jc      asc_exit1
	        xchg    di,ax
	        xchg    ax,cx
	        mul     cs:number_base          
	        xchg    cx,ax
		add	di,dx
		jc	asc_exit1

	        add     cx,bx                   ;Add new number to result.
	        adc     di,0
	        jnc     short asc_loop1
asc_exit1:
	        mov     ax,cx                   ;Copy result
	        mov     dx,di
		pop	di
	        pop     cx
	        pop     bx
	        ret
asc_exit:
	        clc
	        jmp     short asc_exit1
asc2hex         endp

;-----------------------------------------------------------------------
; SCAN4CHAR scans a string to find the first character.
; Entry:  SI - pointer to ASCII string
;         BL - 0 = find next char,
;              1 = find next space,
;              2 = find end of line,
;              3 = find next space or =.
;              4 = find character in DL.
; Exit:   AL - matching character
;         SI - pointer to matching character
;         CF - set if carriage return or EOF found
;-----------------------------------------------------------------------
scan4char       proc near
	        assume  ds:nothing,es:nothing
scan4loop:
	        lodsb
	        cmp     al,13                   ;Check for CR
	        jne     scan4_1
scan4_eol:
	        stc
	        jmp     short scan4_exit1
scan4_1:
	        cmp     bl,4
	        je      scan4_dl
	        cmp     bl,3
	        je      scan4_equal
	        cmp     bl,1                    ;Check if searching for 
	        je      scan4_space             ;  space, char, or EOL.
	        ja      scan4loop
	        cmp     al," "                  ;Check for space or other
	        jbe     scan4loop               ;  'white' characters.
	        jmp     short scan4_exit
scan4_dl:
	        cmp     al,dl                   ;Check for parse character
	        je      scan4_exit
		or	al,al
		je	scan4_eol
	        jmp     short scan4loop
scan4_equal:
	        cmp     al,"="                  ;Check for exit
	        je      scan4_exit
scan4_space:
	        cmp     al," "                  ;Check for characters.
	        ja      scan4loop
scan4_exit:
	        clc
scan4_exit1:
	        dec     si                      ;Back up before char
	        ret
scan4char       endp

;-----------------------------------------------------------------------
; GETKEY  Waits for a keypress and returns the key.
;-----------------------------------------------------------------------
getkey		proc	near
		call	prog_idle		;yield
		mov	ah,1			;Check key status
		int	16h
		jz	getkey			;No key, loop
		cld				;Reset dir flag due to yield

		mov	ah,2			;Get shift status
		int	16h
		push	ax
		mov	ax,12ffh		;Get extended shift status
		int	16h
		pop	bx
		cmp	bl,al			;See if same
		jne	getkey_1		;No, assume old keyboard

                mov     ah,11h                  ;Get extended key status
                xor     al,al                   ;Clear zero flag
                int     16h
                jz      getkey_1
		mov	ax,1000h		;Extended keyboard read
		int     16h
		jmp     short getkey_2
getkey_1:
		xor	ax,ax			;Get key from buffer
		int	16h
getkey_2:
		ret
getkey		endp

;-----------------------------------------------------------------------
;PROG IDLE  Indicates to the system that we are idle
;-----------------------------------------------------------------------
prog_idle	proc	near
		push	ax
		int	28h			;Call Idle interrupt
		cmp	dos_version,300h
		jb	prog_idleexit
		mov	ax,1680h		;Mux DOS idle
		int	2fh
prog_idleexit:
		pop	ax
		ret
prog_idle	endp

;-----------------------------------------------------------------------
; GETENVVAR returns a pointer to the value of an environment variable.  
; Entry:    AX - Segment of environment
;        DS:DI - Pointer to ASCIIZ string containing the name of env var. 
; Exit:  DS:SI - If CF = 0, Pointer to value of environment variable 
;           DI - If CF = 0, Pointer to start of var name in environment
;           CF - Set if variable not found
;-----------------------------------------------------------------------
getenvvar	proc    near
		push	ax
		push	es
		push	ax			;Save env segment
	        push    di			;Append = sign to the end of
	        call    find_end		;  the variable.
	        mov     word ptr es:[di-1],003dh 
	        pop     si
	        call    caps_string
		pop	es			;Use find string routine to
	        xor     di,di                   ;  find the variable name.

	        call    findstr
		jnc     getenvvar_1
	        stc
	        jmp     short getenvvar_exit
getenvvar_1:
	        push    es			;DS:SI = ES:DI
	        pop     ds                      
	        xchg    si,di
getenvvar_2:
	        lodsb                           ;Find end of var name.
	        cmp     al,'='
	        jne     getenvvar_2
	        clc
getenvvar_exit:
		pop	es
		pop	ax
	        ret
getenvvar	endp

;-----------------------------------------------------------------------------
; SETENV  Sets environment variables.
;
; Entry:  DS:SI - pointer to env var name
;         ES:DI - pointer to env var value
;-----------------------------------------------------------------------------
setenv          proc    near
	        push    bp
	        push    ds
	        push    es

	        push    di			;Save ptr to var value
	        push    es

	        call    find_end                ;Get length of var value
	        mov     dx,cx                   ;Copy length
	        mov     di,si
	        push    ds                      ;Add length of var name plus
	        pop     es                      ;  room for the equals sign.
	        call    find_end
	        mov     word ptr es:[di-1],003dh ;Append = sign
	        inc     cx                       ;Add byte for =
	        add     dx,cx
	        inc     dx                      ;Add byte for terminating 0

	        mov     ax,masterenv_seg
		cmp	use_mastenv,0
		jne	setenv_0
		mov	ax,localenv_seg
setenv_0:
		push    ax
	        dec     ax
	        mov     es,ax
	        mov     bp,es:[3]               ;Get size of env segment
	        push    cx
	        mov     cl,4                    ;Convert paragraphs to bytes
	        shl     bp,cl
	        pop     cx
	        pop     es

	        xor     di,di                   ;Use find string routine to
	        call    findstr                 ;  find the variable name.

	        push    si
	        push    ds
	        jc      setenv_2                ;Var not found, skip erase
	        push    es
	        pop     ds

	        mov     si,di                   ;Erase current var value by
	        call    find_endl               ;  copying the next env var
	        xchg    si,di                   ;  over the current one.
setenv_1:
	        cmp     byte ptr [si],0
	        je      setenv_2
setenv_11:
	        lodsb
	        stosb
	        or      al,al
	        jne     setenv_11
	        jmp     short setenv_1
setenv_2:
	        pop     ax                      ;Get ptr to var name
	        pop     cx

	        pop     ds                      ;Get ptr to var value
	        pop     si

		cmp	byte ptr ds:[si],0	;See if NULL variable, If so,
		je	setenv_31		;  don't add to env block

	        mov     bx,di                   ;Get offset of end of env
	        add     bx,dx                   ;Add length of value
	        inc     bx                      ;Add length of terminating byte
	        cmp     bp,bx
	        ja      setenv_3

	        push    ax			;Save ptr to var name
		push	cx
		mov	dx,es
		dec	dx
		mov	es,dx		
		push	es:[1]			;Save current owner segment
		inc	dx
		mov	es,dx
	        add     bx,15                   ;If no room in environemnt,
	        mov     cl,4                    ;  see if env segment can be
	        shr     bx,cl                   ;  resized to make room for
	        mov     ah,4ah                  ;  new variable.
	        int     21h                     ;Reallocate memory
		pop	bx			;Get old owner
		pop	cx
	        pop     ax
	        jc      setenv_5
		push	es
		dec	dx
		mov	es,dx
		mov	es:[1],bx		;Restore old owner 
		pop	es
setenv_3:
	        push    si
	        push    ds

	        mov     si,cx
	        mov     ds,ax
	        call    copy_string             ;Copy var name to env
	        dec     di                      ;Back up over last zero
	        pop     ds
	        pop     si

	        mov     bl,"="                  ;Since env vars can't have
	        mov     bh,bl                   ;  the char '=', filter
	        mov     dl,-1                   ;  string to change = to
	        mov     dh,equalsub_char        ;  graphic char that looks
	        call    filter_string           ;  similar.

	        call    copy_string             ;Copy var value to env
setenv_31:
	        xor     al,al
	        stosb                           ;Add 2 zeros to end env.
setenv_4:
	        clc                             ;Set pass flag
setenv_5:
	        pop     es
	        pop     ds
	        pop     bp
	        ret
setenv          endp

;-----------------------------------------------------------------------
; SETERR0MSG  Sets the Bad version error message to the ver in AX
; Entry: AX - Required DOS version
; Exit:  SI - Pointer to bad DOS ver message
;        CF - Set 
;-----------------------------------------------------------------------
seterr0msg	proc	near
		mov	di,offset errmsg0ver	;Print version number
		call	printver
		mov	ax,[di-3]		;Insert decimal pt
		mov	byte ptr [di-3],'.'	;  so it looks nice
		mov	ah,' '
		mov	[di-2],ax
		mov	si,offset errmsg0	;Point to start of msg
		stc				;Set error flag
		ret
seterr0msg	endp

;-----------------------------------------------------------------------------
; REMOVE uninstalls the installed program from memory.
;-----------------------------------------------------------------------------
remove		proc	near
		assume	cs:code,ds:code,es:code
		push	es
		mov	ax,352fh                ;Get MUX vector
		int	21h
		mov	cx,cs			;Get CS
		mov	ax,es			;Check to make sure MUX
		cmp	ax,cx			;  vector not modified.
		jne	remove_error
		push	ds
		mov	ax,252fh		;Set interrupt
		lds	dx,[int2fh]		;Get old int 2F vector
		int	21h
		pop	ds
		mov	es,ds:[2ch]		;Get env segment
		mov	ah,49h			;Free mem
		int	21h
		mov	si,offset infomsg2	;Removed message
		call	print_strcr
remove_exit:
		pop	es
		ret
remove_error:
		mov	remove_flag,0
             	mov	si,offset errmsg22	;Can't remove error msg
		stc
		jmp	short remove_exit

remove		endp

		even
end_of_resident	=	$
;=======================================================================
;Start of nonresident data
;=======================================================================
;-----------------------------------------------------------------------
; FINAL INSTALL  Last part of install process.  Must be less that
; the resident stack size. (512 bytes)
;-----------------------------------------------------------------------
final_install	proc	near
		mov	sp,di			;Set stack to res stack
		rep	stosb			;Clear buffer
		mov	databuff_ptr,di

	        add     di,DATABUFF_SIZE+15
	        mov     cl,4
	        shr     di,cl
		mov	dx,di
	        mov     ax,3100h		;TSR
	        int     21h
		mov	ax,4c01h		;This should never happen
		int	21h
final_install	endp
;-----------------------------------------------------------------------
; Lookup table for help messages.  Each command has two help strings. 
; 1. The descripion of the function.  The word 'Returns' is 
;    automatically added to the start of the string.
; 2. A syntax message that describes the arguements for the function.
;
; This table MUST be in the same order as the command table at the
; start of the program.
;-----------------------------------------------------------------------
help_tbl        dw      offset left_help
                dw      offset left_syntax
	        dw      offset right_help
	        dw      offset left_syntax
	        dw      offset mid_help
	        dw      offset mid_syntax
	        dw      offset length_help
	        dw      offset length_syntax
		dw      offset find_help	
		dw      offset find_syntax	
		dw      offset findc_help	
		dw      offset findc_syntax	
		dw      offset lower_help 	
		dw      offset length_syntax	
		dw      offset upper_help  	
		dw      offset length_syntax	
		dw      offset char_help   	
		dw      offset char_syntax 	
		dw      offset val_help    	
		dw      offset add_syntax  	
		dw      offset filedrive_help	
		dw      offset filename_syntax
		dw      offset filedir_help	
		dw      offset filename_syntax	
		dw      offset filename_help	
		dw      offset filename_syntax	
		dw      offset fileext_help	
		dw      offset filename_syntax	
	        dw      offset parse_help
	        dw      offset parse_syntax
	        dw      offset commas_help
	        dw      offset not_syntax
	        dw      offset repeat_help
	        dw      offset repeat_syntax

		dw      offset read_help   	
		dw      offset read_syntax 	
		dw      offset write_help  	
		dw      offset write_syntax	
		dw      offset filesize_help	
		dw      offset filename_syntax	
		dw      offset linesize_help	
		dw      offset filename_syntax	
		dw      offset truename_help	
		dw      offset filename_syntax	
	        dw      offset filedate_help
	        dw      offset filename_syntax
	        dw      offset filetime_help  
	        dw      offset filename_syntax

		dw      offset ver_help	
		dw      offset no_syntax	
		dw      offset ask_help	
		dw      offset ask_syntax	
		dw      offset inwin_help	
		dw      offset no_syntax	
		dw      offset twoFcheck_help	
		dw      offset twoFcheck_syntax
		dw      offset envfree_help	
		dw      offset no_syntax	
		dw      offset envsize_help	
		dw      offset no_syntax	
		dw      offset mastervar_help	
		dw      offset mastervar_syntax
		dw      offset localvar_help	
		dw      offset mastervar_syntax	
	        dw      offset truever_help
	        dw      offset no_syntax
	        dw      offset files_help  
	        dw      offset no_syntax  
	        dw      offset lastdrive_help
	        dw      offset no_syntax
	        dw      offset codepage_help 
	        dw      offset no_syntax 
	        dw      offset country_help  
	        dw      offset no_syntax  
        	dw      offset biosdate_help 
        	dw      offset no_syntax 
        	dw      offset getkey_help   
        	dw      offset no_syntax   
        	dw      offset locenv_help   
        	dw      offset no_syntax
        	dw      offset masenv_help
        	dw      offset no_syntax

		dw      offset add_help	
		dw      offset add_syntax	
		dw      offset sub_help	
		dw      offset add_syntax	
		dw      offset mul_help	
		dw      offset add_syntax	
		dw      offset div_help	
		dw      offset div_syntax			
	        dw      offset and_help
	        dw      offset add_syntax
	        dw      offset or_help
	        dw      offset add_syntax
	        dw      offset xor_help
	        dw      offset div_syntax
	        dw      offset not_help
	        dw      offset not_syntax
	        dw      offset convert_help
	        dw      offset convert_syntax

	        dw      offset peek_help
	        dw      offset peek_syntax
	        dw      offset poke_help
	        dw      offset poke_syntax
	        dw      offset in_help
	        dw      offset in_syntax
	        dw      offset out_help
	        dw      offset out_syntax
	        dw      offset interrupt_help
	        dw      offset interrupt_syntax
	        dw      offset scan_help
	        dw      offset scan_syntax

	        dw      offset day_help
	        dw      offset day_syntax
	        dw      offset month_help
	        dw      offset month_syntax
	        dw      offset date_help
	        dw      offset date_syntax
	        dw      offset time_help
	        dw      offset no_syntax

	        dw      offset totalmem_help
	        dw      offset no_syntax
	        dw      offset freemem_help
	        dw      offset no_syntax
	        dw      offset totalxms_help
	        dw      offset no_syntax
	        dw      offset freexms_help
	        dw      offset no_syntax
	        dw      offset xmsver_help
	        dw      offset no_syntax
	        dw      offset totalems_help
	        dw      offset no_syntax
	        dw      offset freeems_help
	        dw      offset no_syntax
	        dw      offset emsver_help 
	        dw      offset no_syntax 
	        dw      offset freeumb_help
	        dw      offset no_syntax

	        dw      offset strver_help
	        dw      offset no_syntax
	        dw      offset strinst_help
	        dw      offset no_syntax
	        dw      offset help_help
	        dw      offset help_syntax

;-----------------------------------------------------------------------
;Help text
;-----------------------------------------------------------------------
left_help	db      "left n characters",0
left_syntax	db      "String,  Number of chars",0
right_help	db      "right n characters",0
mid_help	db      "middle n chars",0
mid_syntax	db      "String,  Start char,  Length",0
length_help	db      "String length",0
length_syntax	db      "String",0
find_help	db      "the position of Findstring in String",0
find_syntax	db      "String, Findstring",0
findc_help	db      "the position of Findstring in String. Case sen",0
findc_syntax	db      "String, Findstring",0
lower_help 	db      "string all lowercase",0
upper_help  	db      "string all uppercase",0
char_help   	db      "ASCII number of character",0
char_syntax 	db      "Char[Char][char][char][char][char][char][char]",0
val_help    	db      "ASCII char for a number",0

filedrive_help	db      "the drive of a filename",0
filedir_help	db      "the directory of a filename",0
filename_help	db      "the file name",0
filename_syntax	db      "Filename",0
fileext_help	db      "the file extension",0
parse_help	db	"the Nth token from a string",0
parse_syntax	db	"String, Token number, Token seperator char",0
commas_help	db	"a number parsed with commas every 3 digits",0
repeat_help	db	"a string of n number of characters",0
repeat_syntax	db	"Number of chars, Char to repeat",0

read_help   	db      "a line from a file",0
read_syntax 	db      "Filename, line number",0
write_help  	db      "nothing.  Appends a string to the end of a file",0
write_syntax	db      "Filename, String",0
filesize_help	db      "the size of a file",0
linesize_help	db      "the number of lines",0
truename_help	db      "the complete filename",0
filedate_help	db	"the date of a file",0
filetime_help  	db	"the time of a file",0

ask_help	db      "a response from a user",0
ask_syntax	db      "[Prompt string][, Max chars][, 1=* echo 2=No echo]",0
ver_help	db      "the DOS version number",0
inwin_help	db      "1 if Windows running",0
twoFcheck_help	db      "status of programs hooked to the Multiplex int",0
envfree_help	db      "the bytes free in the environment",0
envsize_help	db      "the size of the environment",0
mastervar_help	db      "a variable from the Master env  ",0
mastervar_syntax db	"Variable Name",0
localvar_help	db      "a variable from the Local env   ",0

truever_help	db	"the true DOS verison. Requires DOS 5.0 or later",0
files_help  	db	"the total number of files that can be open",0
lastdrive_help	db	"the letter of the last possible drive",0
ask2_help	db	"a response from the user",0
ask2_syntax	db	"[Prompt [,max number of chars [,no echo flag]]",0
codepage_help	db	"the active code page. Requires DOS 3.3 or later",0
country_help  	db	"the country code for the system",0
biosdate_help 	db	"the date for the ROM BIOS",0
getkey_help   	db	"the scan code and ASCII value of the next"
		db	" key pressed",0
locenv_help   	db	"the segment of the active environment",0
masenv_help   	db	"the segment of the master environment",0

add_help	db      "the sum of the parameters",0
add_syntax	db      "Num1, Num2 [,Num3][,Num4][,Num5][,Num6]"
		db	13,10,9,9,9,9,"    [,Num7][,Num8][,Num9][,Num10]",0
sub_help	db      "the difference of two numbers",0
mul_help	db      "the product of the parameters",0
div_help	db      "the quotient of two numbers",0
div_syntax	db      "Number, Number",0
and_help	db      "the logical AND of the parameters",0
or_help		db      "the logical OR of the parameters",0
xor_help	db      "the exclusive OR of two numbers",0
not_help	db      "the logical NOT of a number",0
not_syntax	db      "Number",0
convert_help	db	"a number with the base specified",0
convert_syntax	db	"Number, New Base",0

peek_help	db	"a series of bytes from memory",0
peek_syntax	db	"Segment, Offset [, Number of bytes [,Word flag]]",0
poke_help	db	"nothing.  Writes up to 8 bytes to memory",0
poke_syntax	db	"Segment, Offset , Byte1[,Byte2][,Byte3][,Byte4]"
		db	"[,Byte5][,Byte6][,Byte7][,Byte8]",0
in_help		db	"a byte from an I/O port",0
in_syntax	db	"Port number",0
out_help	db	"nothing.  Writes a byte to an I/O port",0
out_syntax	db	"Port number, Output byte",0
interrupt_help	db	"registers from an interrupt.  Dangerous!",0
interrupt_syntax db	"Interrupt number, AX, BX, CX, DX,",13,10
		db	9,9,9,9,9,"  DI, SI, BP, DS, ES",0
scan_help	db	"the offset of a series of bytes in memory",0

scan_syntax	db	"Segment to search, Starting Offset,",13,10
		db	9,9,9,9,"     Byte1 [,Byte2] [,Byte3] [Byte4]",13,10
		db	9,9,9,9,"     [,Byte5] [,Byte6] [,Byte7] [,Byte8]",0

day_help	db	"the name of the current day of the week,",13,10
		db	" or corresponding to the index value",0
day_syntax	db	"[Index (1=Sunday, 2=Monday 3=Tuesday...]",0
month_help	db	"the name of the current month or the month",13,10
		db	"corresponding to the index value",0
month_syntax	db	"[Index (1=January, 2=February...]",0
date_help	db	"the current date in Mmmmmmmm dd, yyyy format",0
date_syntax	db	"[If parm added, date ret in mm-dd-yyyy fmt]",0
time_help	db	"the current time",0

totalmem_help	db	"the amount of conventional memory",0
freemem_help	db	"the largest block of free conventional memory",0
totalxms_help	db	"the amount of extended memory",0
freexms_help	db	"the amount of free extended memory",0
xmsver_help	db	"the version of the extended memory driver",0
totalems_help	db	"the amount of expanded memory",0
freeems_help	db	"the amount of free expanded memory",0
emsver_help 	db	"the version of the expanded memory driver",0
freeumb_help	db	"the largest block of free Upper Memory",0

strver_help	db	"the version of Strings",0
strinst_help	db	"a non-zero number if Strings installed as TSR",0
help_help	db	"help text for the specified Strings command",0
help_syntax	db	"[Strings Command]"
no_syntax	db	0

twoFcheck_syntax db	"Number or Alias",13,10,10
	        db      "    Interrupt 2F, the multiplex interrupt,"
	        db      " is used by many programs to",13,10
	        db      "signal that they are installed. 2FCHECK"
		db	" calls interrupt 2F with a device",13,10
	       	db      "number between 0 and 255.  2FCHECK returns a"
		db	" 0 if no program responds to",13,10
		db	"this device ID.  If a program does respond,"
	        db      "  a non-zero number is returned.",13,10
		db	"    To prevent users from remembering a series of"
		db	" device IDs, one of the",13,10
		db	"following aliases can be used in place of the"
		db	" device number.",13,10,10

	  	db      " PRINT    - PRINT resident code         "
	        db      " ASSIGN   - ASSIGN resident code",13,10
		db	" DRIVER   - DRIVER.SYS device driver    "
	        db      " SHARE    - SHARE resident code",13,10
	        db      " NET      - Network redirector code     "
	        db      " NLS      - NLSFUNC resident code",13,10
	        db      " ANSI     - ANSI.SYS device driver      "
		db	" DOSBOX   - OS/2 or Win DOS box",13,10
	        db      " HIMEM    - HIMEM.SYS memory manager    "
	        db      " DOSKEY   - DOSKEY resident code",13,10
	        db      " GRAPHTBL - GRAFTABL resident code      "
	        db      " APPEND   - APPEND resident code",13,10
	        db      " DISPLAY  - DISPLAY.SYS",0

infomsg1	db	"Installed",0


errmsg25	db	"No multiplex IDs available",0		
;-----------------------------------------------------------------------
;INITIALIZE - Start of non resident code.
;-----------------------------------------------------------------------
initialize      proc    near
	        assume  cs:code,ds:code,es:code
	        cld                             ;Set string ops 'up.'
		mov	word ptr [entry],0
	        mov     ah,30h                  ;Get DOS version, run only
	        int     21h                     ;  if 2.0 or greater.
	        xchg    al,ah                   ;Swap major, minor numbers
	        mov     dos_version,ax
	        cmp     ah,2
	        jae     init_1
		mov	si,offset program
		call	print_strcr
	        mov     si,offset errmsg0       ;Bad DOS version
		mov	al,1
jmpinit_error:
	        jmp     init_error
init_1:
		call	check4xms		;Chk extended mem mgr
		mov	xms_version,ax
		call	check4ems		;Chk expanded mem mgr
		mov	ems_version,ax
		call	chk_installed
		jc	jmpinit_error
		mov	bx,cs
		cmp	ax,bx
		je	init_11
		mov	installed,1
init_11:
	        mov     di,TRANS_STACK		;Set up data buffers
	        mov     sp,di                   ;Set stack
		mov	dest_var_val,di
		xor	ax,ax
		mov 	cx,VAR_SIZE
		rep	stosb
		mov	databuff_ptr,di

	        add     di,DATABUFF_SIZE+15
	        mov     cl,4
	        shr     di,cl
		mov	bx,di
	        mov     ah,4ah                  ;Reduce memory allocation
	        int     21h
		jnc	init_21
		mov	si,offset errmsg2
		mov	al,-1			;Set out of memory code
		jmp	short init_exit
init_21:
		push	es
		mov	ax,352eh		;Get cmd proc hook.  If
		int	21h			;  our normal search
		mov	ax,es:[2ch]		;  fails, use this method.
		mov	bx,ax
		dec	ax
		mov	es,ax
		cmp	byte ptr es:[0],'M'
		je	init_30
		cmp	byte ptr es:[0],'Z'
		je	init_30
		mov	bx,ds:[2ch]		;If 2E fails use our env.
init_30:
		pop	es
		mov	localenv_seg,bx
		mov	masterenv_seg,bx

		call	getcomspec		;Get the name of the shell 
		call	getname			;Get the name of the prog
	        call    findenv                 ;Use parent's env by def
	        jc	init_4
		mov	localenv_seg,ax
init_4:
	        call    findmaster              ;Find master env
	        jc      init_5
	        mov     masterenv_seg,ax
init_5:
	        call    main			;Program, do your stuff
		cmp	install_flag,0		;See if we should install
		je	init_exit
		call	install			;If we return, error
init_error:		
		push	ax
		call	print_strcr		;Print error
		pop	ax
init_exit:
	        mov     ah,4Ch                  ;Terminate
	        int     21h
initialize	endp

;-----------------------------------------------------------------------
; INSTALL  Installs Strings as a TSR
;-----------------------------------------------------------------------
install		proc    near
		assume	cs:code,ds:code,es:code
		mov	ax,31eh
		cmp	ax,dos_version		;See if DOS 3.3 
		jbe	install_1
		call	seterr0msg		;Error, not DOS 3.3
		ret
install_1:
		mov	ax,352fh		;Get interrupt 2F (MUX)
		int	21h                     ;  vector.
		mov	word ptr [int2fh],bx
		mov	word ptr [int2fh+2],es
		push	cs
		pop	es
		mov	ax,252fh                ;Point int 2F to internal
		mov	dx,offset muxint        ;  routine.
		int	21h

		mov	si,offset infomsg1
		call	print_strcr

		mov	installed,1		;Set installed flag
	        mov     di,RES_STACK		;Set up data buffers
		mov	dest_var_val,di
		xor	ax,ax
		mov 	cx,VAR_SIZE
		jmp	final_install
install		endp

;-----------------------------------------------------------------------
;See if a copy is already resident in memory. If > DOS 3.0, use int 2Fh.
;-----------------------------------------------------------------------
chk_installed	proc	near
		push	es
		mov	byte ptr [entry+2],0	;Initialize fingerprint
		cmp	dos_version,300h	;See if DOS 3.0 or later
		jb	find_copy1		;No, search the old way.
		mov	cx,16			;Try 16 different IDs.
find_copy:
		xor	ax,ax
		mov	es,ax
		mov	ah,multiplex_id		;Load ID.  Use Int 2Fh to
		int	2fh			;  reach installed code so
		or	al,al			;  that we are compatible
		jne	find_copy0		;  with 386 memory managers.
		push	cs
		pop	es                      ;If AL not changed, Strings 
		jmp	short find_copy3	;  not installed.
find_copy0:
		push	cx
		call	cmpheader		;See if really Strings by
		pop	cx                      ;  comparing file headers.
		je	find_copy3
		inc	multiplex_id		;ID used by another program.
		loop	find_copy		;  Change and try again.
		mov	dx,offset errmsg25	;All IDs taken, print error
find_copy_fail:
		stc
		jmp	short find_copy_exit
;
;For DOS 2.x find the installed code the old fashioned way by scanning
;the memory control blocks.
;
find_copy1:
		xor	bx,bx			;zero BX for start
		mov	ax,cs			;keep CS value in AX
find_copy2:
		inc	bx			;increment search segment value
		mov	es,bx
		assume	es:nothing
		cmp	ax,bx			;not installed if current
		je	find_copy3    		;  segment is found.
		call	cmpheader
		jne	find_copy2		;loop back if not found
find_copy3:
		mov	ax,es			;Save seg of installed code
		clc
find_copy_exit:
		pop	es
		ret
chk_installed	endp		

;-----------------------------------------------------------------------------
; CMPHEADER compares the first 16 bytes of this file with the segment
;           pointed to by ES.
; Entry:  DS - code segment
;         ES - pointer to segment to compare
; Exit:   ZF - 0 = segments match.
;-----------------------------------------------------------------------------
cmpheader	proc	near
		mov	si,offset entry+2	;Search this segment for ASCII
		mov	di,si			;  fingerprint.
		mov	cx,16
		repe	cmpsb
		ret
cmpheader	endp

;-----------------------------------------------------------------------
; GETNAME  Copies the name of the program to the name buffer
;-----------------------------------------------------------------------
getname		proc    near
	        assume  cs:code,ds:code,es:code
		push	es
		mov	ax,300h
		cmp	dos_version,300h	;See if DOS 3.0 or later
		jb	getname_exit

		mov	ax,ds:[2ch]		;Get env segment
		push	ax
		dec	ax
		mov	es,ax
		assume	es:nothing
		mov	cx,es:[3]		;Get env seg size
		shl	cx,1
		shl	cx,1
		shl	cx,1
		shl	cx,1
		pop	es			;Get back env seg
		xor	ax,ax
		mov	di,ax
getname_1:
		repnz	scasb			;Scan env for 00
		jne	getname_exit
		cmp	byte ptr es:[di],0
		jne	getname_1
		add	di,3			;Move past cnt byte
		mov	si,databuff_ptr		;Use file buffer
		xchg	di,si
		assume	ds:nothing
		push	ds			;Copy the filename
		push	es			;  into a local
		pop	ds			;  buffer to avoid
		pop	es			;  segment probs
		call	copy_string		;  with called procs.

		mov	ax,cs
		mov	ds,ax
		mov	es,ax
		assume	ds:code,es:code
		mov	si,databuff_ptr
		mov	di,si
		add	di,100h
		call	get_filename
		mov	strings_namelen,cx	;Save length
		mov	di,offset strings_name
		call	copy_string
getname_exit:
		pop	es
	        ret
getname		endp

;-----------------------------------------------------------------------
; CHKARENA  Verifys a memory arena header.
; Entry:   AX - Memory block to verify
; Exit:    BX - Owner of memory block
;          CX - Size of memory block
;          CF - Clear if valid arena header
;          ZF - Clear if last memory block
;-----------------------------------------------------------------------
chkarena	proc    near
	        assume  cs:code,ds:code,es:code,ss:code
		push	ax
	        push    es

		dec	ax
		mov	es,ax
		mov	cx,es:[3]		;Get size of block

		mov	bx,es:[1]		;Get owner of block
		cmp	bx,0fff0h		;Check for illegal owner,
		jae	chkarena_error		;   stupid 386Max fix.

		cmp	byte ptr es:[0],"M"	;See if proper signature
		je	chkarena_exit		;ZF set, CF clear if match
		cmp	byte ptr es:[0],"Z"	;See if last blk sig
		jne	chkarena_error
		or	ax,ax			;Clear ZF, Clear CF
chkarena_exit:
		pop	es
		pop	ax
		ret
chkarena_error:
		stc
		jmp	short chkarena_exit
chkarena	endp

;-----------------------------------------------------------------------
; FINDCMDPSP  Finds the PSP of the command processor
; Exit:    AX - Segment of command processor PSP 
;-----------------------------------------------------------------------
findcmdpsp	proc    near
	        assume  cs:code,ds:code,es:code,ss:code
		push	dx
	        push    es
findcmdpsp_1:
	        mov     ax,es:[16h]             ;Get parent's PSP
		call	chkarena		;See if valid memory block
		jc	findcmdpsp_error
		mov	es,ax
		cmp	ax,es:[16h]		;See if PSP is own parent
		jne	findcmdpsp_1		;No, keep looking
	        clc
findcmdpsp_exit:
	        pop     es
		pop	dx
	        ret
findcmdpsp_error:
		stc
		jmp	short findcmdpsp_exit
findcmdpsp	endp

;-----------------------------------------------------------------------
; FINDPSPENV  Finds the environment block for a COMMAND.COM PSP
; Entry:   AX - Segment of PSP
; Exit:    AX - Segment of environment
;-----------------------------------------------------------------------
findpspenv      proc    near
	        assume  cs:code,ds:code,es:code,ss:code
		push	bx
	        push    es

		mov	dx,ax			;Save PSP segment
		mov	es,ax
		mov	ax,es:[2ch]		;Get ptr to environment
		call	chkarena		;See if valid memory block
		jc	findpspenv_1
		cmp	dx,bx			;See if owned by cmd.com
		je	findpspenv_3
findpspenv_1:
		mov	ax,dx			;Get original PSP
		call	chkarena		;Compute size of segment
		jc	findpspenv_error
findpspenv_2:
	        add     ax,cx                   ;Add size of memory block
		inc	ax
		call	chkarena
		jc	findpspenv_error
		jnz	findpspenv_error	;Env never last env block
		cmp	bx,dx			;See if owned by CMD.COM
		jne	findpspenv_2		;Yes, exit
findpspenv_3:
	        clc
findpspenv_exit:
	        pop     es
		pop	bx
	        ret
findpspenv_error:
		stc
		jmp	short findpspenv_exit
findpspenv      endp

;-----------------------------------------------------------------------
; FINDENV  Finds the parent's environment block.
; Exit:    AX - Segment of local command processor environment.
;-----------------------------------------------------------------------
findenv         proc    near
	        assume  cs:code,ds:code,es:code,ss:code
		call	findcmdpsp		;Get PSP of command.com
	        jc      findenv_error
		call	findpspenv		;Find environment for PSP
	        jc      findenv_error
findenv_exit:
	        ret
findenv_error:
		mov	si,offset errmsg16	;Environment not found
		jmp	short findenv_exit
findenv         endp

;-----------------------------------------------------------------------
; FINDMASTER  Finds the master environment block.
; Exit:    AX - Segment of master environment block.
;-----------------------------------------------------------------------
findmaster      proc    near
	        assume  cs:code,ds:code,es:code,ss:code
	        push    di
	        push    es

	        mov     ah,52h                  ;Get address of first MCB
	        int     21h
	        mov     ax,es:[bx-2]            ;point ES to MCB
findmaster_1:
		inc	ax
		call	chkarena		;See if valid mem block
		jc	findmaster_error
	        jnz	findmaster_error
		cmp	ax,bx			;See if PSP block
		je	findmaster_2
		add	ax,cx			;No, add size to move 2 next
	        jmp     short findmaster_1
findmaster_2:
	        cmp     dos_version,0a00h       ;If OS/2, use DOS 3.3 method.
	        jae     findmaster_3
	        cmp     dos_version,0400h       ;If DOS 4.00 or greater,
	        jb      findmaster_3            ;  COMMAND.COM may not be the
		push	ax
		dec	ax
		mov	es,ax                   ;  first program loaded.  Look
		pop	ax
		push	si
	        mov     si,offset shell_name    ;  at the name of the program
	        mov     di,8                    ;  stored in the last 8 bytes
		xor	cx,cx			;  of the memory control
	        mov     cl,shell_namlen         ;  block.  If the name of the
	        repe    cmpsb                   ;  command processor isn't 
		pop	si
	        jne     findmaster_1            ;  found, keep looking.
		cmp	shell_namlen,8		;If name shorter than 8 chars
		je	findmaster_3		;  check for trailing zero.
		cmp	byte ptr es:[di],0
		jne	findmaster_1
findmaster_3:
		call	findpspenv		;Find environment for PSP
findmaster_exit:
		pop	es
		pop	di
	        ret
findmaster_error:
		mov	si,offset errmsg16	;Environment not found
		stc
		jmp	short findmaster_exit
findmaster      endp

;-----------------------------------------------------------------------
; CHECK4XMS  Checks to see if an extended memory driver is loaded
; Exit:  CF - Clear if ext driver found
;        AX - EXT Version if CF clear
;        SI - Points to error message if CF set
;-----------------------------------------------------------------------
check4xms	proc	near
		mov	ax,4300h		;Extended mem drvr chk
		int	2fh
		or	al,al			;See if loaded
		je	check4xms_error
		push	es		
		mov	ax,4310h		;Get driver entry pt
		int	2fh
 		mov	word ptr [xms_serv],bx
		mov	word ptr [xms_serv+2],es
 		pop	es
		xor	ax,ax
		call	ds:[xms_serv]		;Get version number
		mov	bx,ax			;Version num returned
		shr	al,1			;  as BCD.  Convert
		shr	al,1			;  to std DOS format
		shr	al,1			;  of maj in AH and
		shr	al,1			;  minor in AL
		mov	ah,10
		mul	ah
		and	bl,0fh
		add	al,bl
		mov	ah,bh
		clc
check4xms_exit:
		ret
check4xms_error:
		stc
		xor	ax,ax
		mov	si,offset errmsg19	;ext mem not available
		jmp	short check4xms_exit
check4xms	endp

;-----------------------------------------------------------------------
; CHECK4EMS  Checks to see if an expanded memory driver is loaded
; Exit:  CF - Clear if EMS driver found
;        AX - EMS Version if CF clear
;        SI - Points to error message if CF set
;-----------------------------------------------------------------------
check4ems	proc	near
		push	es
		push	di
		mov	ax,3567h		;Get interrupt 67 vector
		int	21h
		mov	di,0ah
		mov	si,offset ems_header
		mov	cx,8
		repe	cmpsb
		pop	di
		pop	es
		jne	check4ems_error
		mov	ah,40h			;Get status
		int	67h
		or	ah,ah
		jne	check4ems_error
		mov	ah,46h			;Get version
		int	67h
		or	ah,ah
		jne	check4ems_error
		mov	bl,al			;Convert ver number
		shl	ax,1
		shl	ax,1
		shl	ax,1
		shl	ax,1
		mov	al,bl
		and	ax,0f0fh
		clc
check4ems_exit:
		ret
check4ems_error:
		stc
		xor	ax,ax
		mov	si,offset errmsg17	;EMS not available
		jmp	short check4ems_exit
check4ems	endp

		even                            ;Set stack on word boundry
end_of_code     =       $

code            ends

end             entry

4
