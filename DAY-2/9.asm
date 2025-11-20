; Problem: Convert BCD number in 2000H to Binary. Store at 2001H.
; Example: BCD 25 => Binary 19H (1B in hex)

LXI H, 2000H
MOV A, M       ; Load BCD number
MOV B, A       ; Save copy in B
ANI 0F0H       ; Mask lower nibble (Keep upper digit)
RRC            ; Rotate right 4 times to get tens digit
RRC
RRC
RRC
MOV C, A       ; C now has the 'tens' digit
MVI A, 00H     ; Clear Accumulator

; Multiply tens digit by 10 (0AH) using addition
MVI E, 0AH     
MULT: ADD E
      DCR C
      JNZ MULT 

MOV E, A       ; Store (Tens * 10) in E
MOV A, B       ; Get original number back
ANI 0FH        ; Mask upper nibble (Keep units digit)
ADD E          ; Add (Tens * 10) + Units

INX H
MOV M, A       ; Store Binary result
HLT