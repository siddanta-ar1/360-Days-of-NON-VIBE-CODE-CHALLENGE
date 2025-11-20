; Problem: Find largest number in a block of 10 data bytes starting at 2000H.
; Store result at 200AH.

LXI H, 2000H   ; Point to start of array
MVI C, 0AH     ; Initialize counter (10 decimal)
MOV A, M       ; Assume first number is largest
DCR C          ; Decrement counter (processed 1st number)

LOOP: INX H    ; Move to next number
      CMP M    ; Compare A with Memory
      JNC SKIP ; If A > M, jump to SKIP
      MOV A, M ; If A < M, update A with new largest

SKIP: DCR C    ; Decrement counter
      JNZ LOOP ; Continue if counter != 0

STA 3000H      ; Store largest number at 3000H
HLT