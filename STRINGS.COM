�3
STRINGS 2.5 Copyright 1991-1993, 1995 Douglas Boling
First published in PC Magazine, December 29, 1992
 $�  ����          ��������                                 �
 ,       � STRINGS  COMSPEC  COMMAND  EMMXXXX0h?mqpbiu��������LEFT RIGHT MID LENGTH FIND FINDC LOWER UPPER CHAR VAL FILEDRIVE FILEDIR FILENAME FILEEXT PARSE ADDCOMMAS REPEAT READ WRITE FILESIZE LINESIZE TRUENAME FILEDATE FILETIME VER ASK INWIN 2FCHECK ENVFREE ENVSIZE MASTERVAR LOCALVAR TRUEVER FILES LASTDRIVE CODEPAGE COUNTRY BIOSDATE GETKEY LOCALENV MASTERENV ADD SUB MUL DIV AND OR XOR NOT CONVERT PEEK POKE IN OUT INTERRUPT SCAN DAY MONTH DATE TIME MEMTOTAL MEMFREE XMSTOTAL XMSFREE XMSVER EMSTOTAL EMSFREE EMSVER UMBLARGE STRINGSVER INSTALLED HELP  �^^p�r����/��,X��>T�����,Smq5��,IWet���%=`�%Gj��l|����*Fb����PRINT ASSIGN DRIVER SHARE NET NLS ANSI DOSBOX HIMEM DOSKEY DISPLAY GRAPHTBL APPEND  @CH���Sunday Monday Tuesday Wednesday Thursday Friday Saturday  January February March April May June July August September October November December  Removed Need DOS 2.0 or greater Usage: STRINGS [/?][/M][/Q][/Pc][/Bn][/I][/U] [env var =] FUNCTION [Params]

 /M  - Use master environment
 /Q  - Suppress output to screen
 /Pc - Use char c instead of ',' as the parse character
 /Bn - Use n as the number base
 /I  - Installs as resident code. DOS 3.3 or later required
 /U  - Uninstalls if resident

For a list of commands type STRINGS /? Not enought memory Unknown command line switch Illegal filename Line numbers must be greater than 0 Line not found Multiply overflow error Divide by zero error Addition overflow Subtraction underflow Number too large Out of environment space Can't find environment No Expanded memory Required parameter missing No Extended memory String not found Not Installed Can't remove Already installed Base must be within 2-16 
 ����		�&	��7	�M	a	�n	��	�	�	�	�	�	�	��	�	
�
0
@
P
g
{
DOS Error File not found Path not found Too many open files Access denied Memory Corrupted Bad Environment block File Access Invalid Data Invalid Not a proper Disk Not same device No more files Disk Write Protected Unknown unit Drive not ready Unknown command CRC Data Error Disk Seek error Not a DOS disk Sector not found File Write fault File Read fault General failure File sharing violation File lock violation Illegal Disk change = �t=�tT.:&�t.�.������QWV���2�ώǿ��u&�= u���� ��F�FA��w��2�^_Y
�t�.���}.��u�P.�z.�&|����мn$�SQRWVU�Ȏ؎��� ��2��6�3ɬ�A<u��� �7 �>� t��s��]^_ZY[�.�z.�&|.�>� t�I�!X� ���6rT�6��K�6��D�>� t�O�4A������r.�����r&�6��>� t
�< t�[��>����r2�þ�V��?^�;���6���P�>��X+�O;>�w�>��6�����Ë6��z�b�6����  �>����Ë6��^H�E�ȋ6��< t�Ls�� �/P3�<�>���Y��t�� �>���Ë>��8��3ҋ>���Ë>��6�W�^�A�Ë>��6�W�q^�=��U�>������u� �v EE�����2���]Ë>��6��
�t2�3��_�E� ��O2���Ë6��>����E �Ë6��>x��6������ߋ�B��<\u��
�u�;�tK� �Ë6��>x�A�>��2��Ë6��>x�{��3۬<.u��
�u��t��+ˋ>����2���Ë6��^�6��W� Ë>�W�%^Q�>������Y+�rAQ�ˋ�V�^YtF��3����+�@3ҋ>���Ë6���� �ȃ�r(���
�u� �6��t
���rF�������� �6�����Ë>��������2��,�6��>�����������������2���Ë6��P�6��H��X�u��� s�>��2���þ�����@�2rK�6���V- �� r>�� �ƾVr4�6�����<t���
�u�x�� �r�ȋ���2���r���������"��s
�rrr� �C3��� �rb� �u�t-����� �lrKN��� �Ur>���=u����� �Lr+F�>����O�
�AA�t��A�)r�r�>�� ��$�������Nr!������& s����- �� �>�����r�������r����U����V�F� �F��V��x�ʹ �rP;�t�F��ȋ���V�V�t!��уn��^� u�~� t�t�~�u����=
uGI��f�� ���F��V���]��u���@��>�r3�3ұ�Vr	�,�?r��P���6��>��s�!ð@�mr+� W�!r$S��������Ё��칼̋>��~[��r�����@�6r1� W�!r*S�����?����������������?�>��g[�r������r�>���à�P�� 3۹ �>�r(t�6���= w�؋6���ȃ���w�6��=�>���	���0�X���������>� u��PH��&� �����3�3��&8�����+�H3��>�������>� u��PH��&� ���3��>��������>���r	.�>�������>���r	.�>��~�ø �/
�u��F�/
�� u�2�3ҋ>����3��>r rJ�6���s�r�����6�����u4
�u02����tVU��&��/��ˎێÎӋ&���]^2�3ҋ>��$������R�!&�_3������t	&G&���3ҋ>������R�!� �>r r� �>rr� �>r r�! &� @ �>��:�2���ár= r	�3�!�Æċ>��+	�ø;rw�f�!��3ҋ>�����y�� 	� 8�x�!2�<�u�Ã>� t5�6���6x=	 w0�Ȼ����
�t2��v��	t�	�>���	3ҋ>��"�������� ��޾��.�>�� �2�������>�P2�3����E� X2������á�3ҋ>����á�3ҋ>����ûo�������û~�����+��û��������e���SQRU�ʋ���r������u����r����Ջ���]ZY[���r)Q�Yt$�t
����������P��3����X��ы>��>þ}���� �W���#�#�û�H�������rr3�3ы>��	Ë6��V��r���ҋ>�����I�u��w��v���>���þ����U�%rm���uh� �  �>����>�rPSV�6�����^[X�>�r� ���?u� ��&��tP2���3��{�rCOX2�3��n�eC�E� ���E� ]�����rD���u>�����v2�������V�4�^s	�������u�
�u�FF���>�� ������6��V��r�u���2�3ҋ>���
�����?r���u�u�
�uǊӒ�>�� ����U�6��s�����
�
�u����D���	 EE�v ��
�u܉F ���������P���P�����Э�ȭ�ح^�.�~.�&��/�.�~.�&����W����ë����«X��ƫ�ū�ثX�X����>��
 �3��'
�E� ���E� �]�U���>x����v_�ًv EE�T
��uM
�uI��2�����Hr;���u6���x����Q������Yt	C���<�3ҋ>��	�E� ���	�]þ�����>�s�*�!2���6���	��r!�u�t= wH�ؿ��.�6����@	������>�s
�*�!��2���6��	��r!�u�t= w��K��J.�6����������3��>�r�6��j	rO���uH<wDP�*�!2�[��t.QR��K���6�����E� X2�3����E�, GX3�����>��_������,�!�>��u������� ��>���À>� t�H����!���� ��+ù ��>��|�Ã>v t�������s3�� ��>��W�Ã>v t
���������s3�� ��>��0�áv�t3�������������
���Ê�>����3�tt�B�g�¹ @��>�����3�tt�B�g�ù @��>����át�t�F�g
�t3�������������%�>��+�Á>r s�>v �  tW���������J� X�!P�X�!2�P�X� �!s�b�  r����������X�A �!�H����!��[�X�![�X�!��� ��>��+���	��Function:   - Returns  
Syntax:   STRINGS [dest var =]     This is a list of the available commands.
 
For help on a specific command type:  STRINGS HELP Command Command Help not available once installed U��.�6��>� u�6�����A���|rH�>� t����	�	���������㋷�"���m��� �������B�����"���F�E����2ۋ>�� Q�O� �ك��Y�
�t��2��V�6��^
�uҀ>� u�q��>�2���]þ��d�>���0 ���3��Р��>��y��  K   �CCdU���
Q����Y�V��F�  �~��N��^��B����!t�2�
�u
����!2��<t5�,QW��� ��_YtI�3��~� t
�*�~�t� �����볰�l �2�����]�;N�tP� � �T X� OA���t��C ��;N�t;���N�*�*��@ ��&�J ����2��P�V��" Y�� � ���V�� �~��N��PR�д�!ZXô�P�d����[2��3��h�QR��2�3��b �Y�E�-X2��U �L�E�-X3��Bûam��v���pSRQ��2�3��. �%�E�:X2�3�� ��E�:X��2�3�� ��E� X�2����S��:�s&�0G[��t�fK&�= u���U�6��'��������IvV�v �^r��rEE��Ƌ׋>���]Ë6���r�؋ʋ6���rþ���3ɉ���������
 ����,���� 󫾀 �< u�>� t� ����
�t� �� 3ɊF�����u�E�=�u�3��r�</u�x s��s��6��6���� r_<=t2��rT<=u"F3��r��6��� ��u� r52��kr.���
 �v ��������P� r8TuFF�2��=����F���� �  ��u
+����.���������ì����N�u= v
= w���þz����À>� t�h�����À>� u�M�������, ���(r@.�>�W��^�>x� ���߬<\u��
�t<.u�N��+˃�r� �������2��3��>��� ����L ���߬<\u��<.u��
�u�;�w��O� ��+ˋ��P�6��>�� ��XP� s�>�� ��XP� X��WV�>r r�`�!�iWV�|:t��!����@�:��$ߊЀ�@��߰\8t�V���G�!^�= t� O�\����� +��2�
�t�=..u����\Q��+��Y�G����2��^_�Q�<3��!��Yô=�!��ô>�!ô?�!ô@�!Çʒ�B�!�2�<"v2��ྖ��4��=� r�� �QR3��t3�WVQ�Y^_�tCQ�  Yu&�= u��ZY�P�� 2�򮜸� +��I�X�P� �2�򮜸 �+��I�X�SR�az� �� Z[�SR�AZ� �� Z[�VW��3ɬ
�t:�r:�w
�"ƪA��_^�3ɬ�
�tA���� ��� �.�>� u�
�t����!���PSQRV.�6��؋ʺ��R�3����������0��9v��R�u��u�0Z���t
ڀ�0t�ª���0u�ê2��^ZY[X�SQW3�3�3ۊF��9v��߀���0r*.;�s#�.�&�r��.�&���r˃� sˋ���_Y[�����<u��*��t��t��tw�< v��:�t
�t���<=t< w��N��* ��t����P���[:�u�2��t� ��3���P�(.�>r r���/X�PPW�W�&�E�= ^�s�3�� �s��
���<=u��X�UW�-��ы��$�&�E�= A�B.��.�>� u.��PH��&�. Q���Y3����Vr��������< t��
�u���XY^�< tO���C;�w)PQ��J��&�6 B�����J�![YXr+J��&� V������O^�=����.�6�������2���]ÿv���E��E�.� �E��m���/5�!�Ɍ�;�u�/%���!�, �I�!�e����� �[�����>x�����׸ 1�!�L�!�#�#�#�#�#�#$"$)$N$a$�$�$"$�$"$�$�$%*.%p%F%p%b%p%y%p%�%�%�%E+�%!&A&T&j&�&�&p%�&p%�&p%�&p%�&p%X'�0'%'o'�0�'�0�'�0�'�0�'( ((A(�0q(�0�(�0
)�0:)�0Z)�0t)�0�)�0�)�0�)*_**}**�*�*�**�**	+�*)+E+L+m+~+�+�+�+F,^,j,�,�,�,-:-�-...{.�.�.�.�0/�0)/�0W/�0u/�0�/�0�/�0�/�00�0-0�0T0�0k0�0�0�0left n characters String,  Number of chars right n characters middle n chars String,  Start char,  Length String length String the position of Findstring in String String, Findstring the position of Findstring in String. Case sen String, Findstring string all lowercase string all uppercase ASCII number of character Char[Char][char][char][char][char][char][char] ASCII char for a number the drive of a filename the directory of a filename the file name Filename the file extension the Nth token from a string String, Token number, Token seperator char a number parsed with commas every 3 digits a string of n number of characters Number of chars, Char to repeat a line from a file Filename, line number nothing.  Appends a string to the end of a file Filename, String the size of a file the number of lines the complete filename the date of a file the time of a file a response from a user [Prompt string][, Max chars][, 1=* echo 2=No echo] the DOS version number 1 if Windows running status of programs hooked to the Multiplex int the bytes free in the environment the size of the environment a variable from the Master env   Variable Name a variable from the Local env    the true DOS verison. Requires DOS 5.0 or later the total number of files that can be open the letter of the last possible drive a response from the user [Prompt [,max number of chars [,no echo flag]] the active code page. Requires DOS 3.3 or later the country code for the system the date for the ROM BIOS the scan code and ASCII value of the next key pressed the segment of the active environment the segment of the master environment the sum of the parameters Num1, Num2 [,Num3][,Num4][,Num5][,Num6]
				    [,Num7][,Num8][,Num9][,Num10] the difference of two numbers the product of the parameters the quotient of two numbers Number, Number the logical AND of the parameters the logical OR of the parameters the exclusive OR of two numbers the logical NOT of a number Number a number with the base specified Number, New Base a series of bytes from memory Segment, Offset [, Number of bytes [,Word flag]] nothing.  Writes up to 8 bytes to memory Segment, Offset , Byte1[,Byte2][,Byte3][,Byte4][,Byte5][,Byte6][,Byte7][,Byte8] a byte from an I/O port Port number nothing.  Writes a byte to an I/O port Port number, Output byte registers from an interrupt.  Dangerous! Interrupt number, AX, BX, CX, DX,
					  DI, SI, BP, DS, ES the offset of a series of bytes in memory Segment to search, Starting Offset,
				     Byte1 [,Byte2] [,Byte3] [Byte4]
				     [,Byte5] [,Byte6] [,Byte7] [,Byte8] the name of the current day of the week,
 or corresponding to the index value [Index (1=Sunday, 2=Monday 3=Tuesday...] the name of the current month or the month
corresponding to the index value [Index (1=January, 2=February...] the current date in Mmmmmmmm dd, yyyy format [If parm added, date ret in mm-dd-yyyy fmt] the current time the amount of conventional memory the largest block of free conventional memory the amount of extended memory the amount of free extended memory the version of the extended memory driver the amount of expanded memory the amount of free expanded memory the version of the expanded memory driver the largest block of free Upper Memory the version of Strings a non-zero number if Strings installed as TSR help text for the specified Strings command [Strings Command] Number or Alias

    Interrupt 2F, the multiplex interrupt, is used by many programs to
signal that they are installed. 2FCHECK calls interrupt 2F with a device
number between 0 and 255.  2FCHECK returns a 0 if no program responds to
this device ID.  If a program does respond,  a non-zero number is returned.
    To prevent users from remembering a series of device IDs, one of the
following aliases can be used in place of the device number.

 PRINT    - PRINT resident code          ASSIGN   - ASSIGN resident code
 DRIVER   - DRIVER.SYS device driver     SHARE    - SHARE resident code
 NET      - Network redirector code      NLS      - NLSFUNC resident code
 ANSI     - ANSI.SYS device driver       DOSBOX   - OS/2 or Win DOS box
 HIMEM    - HIMEM.SYS memory manager     DOSKEY   - DOSKEY resident code
 GRAPHTBL - GRAFTABL resident code       APPEND   - APPEND resident code
 DISPLAY  - DISPLAY.SYS Installed No multiplex IDs available ��   �0�!�ģr��s��_�m�� �n�v��t�� r��;�t����9��>�3��� �>x�����ߴJ�!s�����T�.5�!&�, ��H��&�>  Mt&�>  Zt�, �������� �r���r���)ր>� t�	 P��X�L�!�;rv���ø/5�!�����/%��
�!�n4�����n$�>�3��� ���� �>r r(� 3����&��/
�u�#Q�$ Yt����x4��3ی�C��;�t� u���þ��� ��� �>r rP�, PH��&� ��������3����u3&�= u����6x�����Ȏ؎��6x���� �+�������PH��&� &� ���s&�>  Mt
&�>  Zu�X����R&� ���r��&; u��Z����S�Ў�&�, ��r;�t����r�@��r
u;�u��[������r���rþ���W�R�!&�G�@�l�rDuB;�t����>r 
s,�>r r$PH��XV��� 3Ɋ��^uɀ>�t&�= u��p�_þ����� C�/
�t,�C�/����3�������������
���Ê����3��)��W�g5�!�
 ��� �_u!�@�g
�u�F�g
�u������������%���3������