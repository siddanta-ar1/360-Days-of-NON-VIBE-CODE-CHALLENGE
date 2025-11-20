; Problem: Divide number at 2000H by 2001H.
; Store Quotient at 2002H and Remainder at 2003H.

LXI H, 2000H
MOV A, M       ; Load Dividend to A
INX H
MOV B, M       ; Load Divisor to B
MVI C, 00H     ; Initialize Quotient counter to 0

LOOP: CMP B    ; Compare A with B
      JC END     ; If A < B, division is done
      SUB B    ; A = A - B
      INR C    ; Increment Quotient
      JMP LOOP ; Repeat

END: INX H
     MOV M, C  ; Store Quotient
     INX H
     MOV M, A  ; Store Remainder (Leftover in A)
     HLT