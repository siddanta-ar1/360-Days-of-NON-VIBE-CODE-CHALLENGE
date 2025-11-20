; Problem: Find smallest number in array at 2000H (Length 10).

LXI H, 2000H
MVI C, 0AH
MOV A, M       ; Assume first is smallest
DCR C

LOOP: INX H
      CMP M
      JC SKIP    ; If A < M, A is still smallest, so Skip
      MOV A, M   ; If A > M, update A with new smallest

SKIP: DCR C
      JNZ LOOP

STA 3000H
HLT