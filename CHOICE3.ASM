DOSSEG
.MODEL small
PAGE      60,120
INCLUDE DOS.INC
.STACK 1000h
.DATA
    err          DB      "Out of environment space",7,13,10,"$"
    lstring      DB      ?
    string       DB      1024 DUP (0)
    key          DB      "KEY="    ; Variable name
    lkey         EQU      $-key
.CODE

errorenv:
    @DispStr err                   ; Error message
    @Exit

; [ENTRY POINT]
main PROC

    mov       ax, @DATA            ; Initialize DS
    mov       ds, ax
    
    ; Get key
    xor       cx,cx
    mov       ah,0
    int       16h                  ; http://vitaly_filatov.tripod.com/ng/asm/asm_027.1.html
    cmp       al,0
    jne       endgetkey
    xor       cx,cx
    mov       cl,ah
    xor       ax,ax
    mov       al,cl
    xor       cx,cx
    mov       cl,1
    mov       ah,1
    endgetkey:
    
    ; Convert scan code to string
    call BinToDec
    
    ; Put string into KEY environment
    push      ax                   ; Save
    push      es
    call      DoEnviron            ; Put result in    environment string
    pop       es                   ;   restore
    pop       ax

    ; Exit
    mov       ax, 4C00h            ; http://www.ctyme.com/intr/rb-2974.htm
    int 21h
main ENDP

; Procedure DoEnviron
; Purpose   Convert a string to    an environment variable
; Input        String in "string"
; Output    String in "KEY" environment variable;
;          AX has 0 for success, nonzero for    failure

DoEnviron PROC
    call      GetEnv               ; Get environment size,    length,    address
    mov       dx,ax                ; Save size and    length
    mov       bx,cx

    ; Find "KEY="
    sub       di,di                ; Point    to start
    sub       al,al                ; Search for zero
    mov       si, OFFSET key       ; Point    source at "KEY="
findwh:       repne      scasb     ; Search
    cmp       BYTE PTR es:[di],0   ; If double null, end of environment
    je        gotend
    jcxz      noroom               ; Error    if not found
    push      di                   ; Save
    push      cx
    mov       si,OFFSET key        ; Load address and length of "key"
    mov       cx,lkey              ;   for    comparison
    repe      cmpsb                ; Compare
    mov       si,di                ; Make copy
    pop       cx                   ; Restore
    pop       di
    jnz       findwh

    ; Find end of "KEY" variable
    xchg      di,si
    repne     scasb                ; Find end of environment variable
    xchg      si,di                ; Point    source to next variable

    ; Calculate characters left to write
    mov       cx,bx                ; Load total characters
    sub       cx,si                ; Subtract finished to get left

    ; Move everything back to overwrite "KEY="
movenv:
    push      ds                   ; Save DS
    mov       ax,es                ; Copy to ES
    mov       ds,ax
    rep       movsb                ; Copy
    mov       BYTE PTR es:[di],0   ; Put null at end in case of error
    pop       ds                   ; Restore

    ; Check    environment space
gotend:
    mov       al,lstring           ; Load length of string
    sub       ah,ah                ; Clear    top
    add       ax,lkey              ; Add length of    name
    add       ax,di                ; Add position to get final length
    cmp       ax,dx                ; Is it    longer than environment?
    jge       noroom               ; Yes? Quit

    ; Put KEY= at end
    mov       si,OFFSET key        ; Load address and length of key
    mov       cx,lkey
    rep       movsb

    ; Put new string at end
    mov       si,OFFSET string     ; Load address and length of string
    mov       cl,lstring
    rep       movsb
    mov       WORD PTR es:[di],0   ; Put double null at end
    sub       ax,ax                ; Return 0 for success
    ret

noroom:
    inc      ax                    ; Return nonzero for fail
    ret
DoEnviron ENDP

; Procedure GetEnv
; Purpose   Find and measure the environment
; Input        None
; Output    Segment of environment in ES, size in AX, length in    CX

GetEnv      PROC
    mov       dx,es:10h            ; Load segment of COMMAND.COM
    mov       es,dx                ;   into ES
    mov       ax,es:2Ch            ; Load COMMAND.COM's environment
    or        ax,ax                ; Is it    0?
    jnz       secondry             ; No? This is a    secondary command
                                   ;   and    we have    its environment    in AX
    dec       dx                   ; Yes? This is original    COMMAND.COM
    mov       es,dx                ;   so point ES    to paragraph before PSP
    add       dx,es:03             ; Offset of environment    is 3 bytes in
    add       dx,2                 ; Adjust it back to PSP
    mov       ax,dx                ; Put it in AX
secondry:

    ; Note:
    ; CodeView cannot debug    the previous section of    code, because the PSP
    ; addresses checked by the code    are those passed from DOS to CodeView,
    ; not addresses    passed from DOS    to the program.    To debug with CodeView,
    ; find the actual address of the environment:

    ;     S    500:0 L    FFFF "COMSPEC="

    ; When you find    the actual address, hard code it into your program:

    ;      mov      ax,110Ch       ; Debug    line

    ; Comment the line out for final assembly after    debugging.
    
    mov       si,ax                ; Save a copy
    sub       dx,dx                ; Clear    DX for multiply
    dec       ax                   ; Get paragaraph before    environment
    mov       es,ax                ; Load into DS
    mov       ax,es:03             ; Size in paragraphs is    at byte    4
    mov       cx,16                ; Multiply by 16
    mul       cx
    mov       es,si                ; Restore environment address
    sub       di,di                ; Point    to start
    mov       cx,ax                ; Load maximum count (size of
    mov       bx,ax                ; environment) and save a copy
    sub       ax,ax                ; Search for double null
null2:
    repne     scasb                ; Look for null
    jz        noerr                ; If not out of    space, continue
    sub       ax,ax                ; else error (return 0)
    jmp       errorenv
noerr:
    cmp       BYTE PTR es:[di],0   ; Is it    double null?
    jne       null2                ; No? Look again
    mov       cx,di                ; Yes? Save length in CX
    mov       ax,bx                ; Reload size to AX

    ret
GetEnv      ENDP

; Procedure BinToDec
; Purpose   Convert binary number in AX    to string
; Input        Value in AX
; Output    Value string in "string"; length of    string in "lstring"

; AL contains number to    be converted

BinToDec  PROC
    push      ax
    push      es
    cmp       cl,1
    je        startdigit
    and       ax,255
startdigit:
    sub       cx,cx                ; Clear    counter
    mov       bx,10                ; Get ready to divide by 10

getdigit:
    sub       dx,dx                ; Clear    top
    div       bx                   ; Remainder is last digit
    add       dl,'0'               ; Convert to ASCII
    push      dx                   ; Put on stack
    inc       cx                   ; Count    character
    or        ax,ax                ; Is quotient 0?
    jnz       getdigit             ; No? Get another

    mov       lstring,cl           ; Save number of digits
    mov       ax,ds                ; Load DS to ES
    mov       es,ax
    mov       di,OFFSET string     ; Load source

putdigit:
    pop       ax                   ; Get a    digit off stack
    stosb                          ; Store    it to string
    loop      putdigit
    
    mov       si,OFFSET string     ; Load address and length of string
    mov       cl,lstring
    rep       movsb
    mov       WORD PTR es:[si],'$' ; Put null character at the end

    pop       es
    pop       ax
    ret
BinToDec  ENDP

END main                           ; End assembly