#include <conio.h>
#include <dos.h>
#include <stdio.h>
#include <stdlib.h>

unsigned char normal_keys[0x60];
unsigned char extended_keys[0x60];

static void interrupt keyb_int() {
    static unsigned char buffer;
    unsigned char rawcode;
    unsigned char make_break;
    int scancode;

    rawcode = inp(0x60); /* read scancode from keyboard controller */
    make_break = !(rawcode & 0x80); /* bit 7: 0 = make, 1 = break */
    scancode = rawcode & 0x7F;

    if (buffer == 0xE0) { /* second byte of an extended key */
        if (scancode < 0x60) {
            extended_keys[scancode] = make_break;
        }
        buffer = 0;
    } else if (buffer >= 0xE1 && buffer <= 0xE2) {
        buffer = 0; /* ingore these extended keys */
    } else if (rawcode >= 0xE0 && rawcode <= 0xE2) {
        buffer = rawcode; /* first byte of an extended key */
    } else if (scancode < 0x60) {
        normal_keys[scancode] = make_break;
    }

    outp(0x20, 0x20); /* must send EOI to finish interrupt */
}

static void interrupt (*old_keyb_int)();

void hook_keyb_int(void) {
    old_keyb_int = getvect(0x09);
    setvect(0x09, keyb_int);
}

void unhook_keyb_int(void) {
    if (old_keyb_int != NULL) {
        setvect(0x09, old_keyb_int);
        old_keyb_int = NULL;
    }
}

int ctrlbrk_handler(void) {
    unhook_keyb_int();
    _setcursortype(_NORMALCURSOR);
    return 0;
}

int getkey(void) {
    int key = 0;
    int ctrl = 0;
    int alt = 0;
    int haskey = 0;
    int i;
    _setcursortype(_NOCURSOR);
    while (1) {
        for (i = 0; i < 0x60; i++) {
            key = normal_keys[i]?i+1:0;
            if (key!=0&&key!=30&&key!=57) {
                haskey = key;
            }
            if (key==30&&!ctrl) ctrl = 1+(alt?1:0);
            if (key==57&&!alt) alt = 2;
        }
        if (haskey!=0) break;
    }
    _setcursortype(_NORMALCURSOR);
    return haskey + (ctrl+alt)*60;
}

int main(int argc, char **argv) {
    int k = 0;
    ctrlbrk(ctrlbrk_handler);
    hook_keyb_int();
    k = getkey();
    unhook_keyb_int();
    if (argc > 1) printf("key=%d\n",k);
    exit(k);
}   