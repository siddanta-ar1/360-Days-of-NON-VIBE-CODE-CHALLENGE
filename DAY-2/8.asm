; Problem: Move 10 bytes of data from 2000H to 3000H.

LXI H, 2000H   ; Source pointer
LXI D, 3000H   ; Destination pointer
MVI C, 0AH     ; Counter (10 bytes)

LOOP: MOV A, M ; Get data from Source
      STAX D   ; Store data to Destination (A -> DE)
      INX H    ; Increment Source pointer
      INX D    ; Increment Destination pointer
      DCR C    ; Decrement counter
      JNZ LOOP ; Repeat
HLT