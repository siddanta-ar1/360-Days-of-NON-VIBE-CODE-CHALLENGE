; Problem: Check if number at 2000H is odd or even.
; If Even, store EEH at 2001H. If Odd, store DDH at 2001H.

LXI H, 2000H
MOV A, M       ; Load number
ANI 01H        ; Mask all bits except LSB (Last Bit)
JZ EVEN        ; If Result is 0 (Zero Flag Set), it's Even

ODD: MVI A, 0DDH ; Load DDH for Odd
     JMP STORE

EVEN: MVI A, 0EEH ; Load EEH for Even

STORE: INX H
       MOV M, A
       HLT