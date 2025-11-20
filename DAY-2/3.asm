; Problem: Multiply number at 2000H by number at 2001H. Store at 2002H.

LXI H, 2000H   ; Point to first number
MOV D, M       ; Load 1st number into D (Multiplier)
INX H
MOV E, M       ; Load 2nd number into E (Multiplicand)
MVI A, 00H     ; Clear Accumulator (Result holder)

LOOP: ADD E    ; Add Multiplicand to Accumulator
      DCR D    ; Decrement Multiplier
      JNZ LOOP ; If D is not 0, jump back to ADD
      
INX H
MOV M, A       ; Store result
HLT