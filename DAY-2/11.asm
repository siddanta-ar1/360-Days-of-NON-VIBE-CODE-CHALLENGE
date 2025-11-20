LXI H, 2000H    ; Point to the start of the string
MVI C, 00H      ; Initialize Length Counter to 0

LOOP: MOV A, M  ; Move character to Accumulator
      CPI 00H   ; Check if it is the terminator (Null)
      JZ STORE  ; If Zero Flag set, end of string found -> Go to Store
      INR C     ; Increment Length Counter
      INX H     ; Point to next character
      JMP LOOP  ; Repeat

STORE: MOV A, C ; Move Count to Accumulator
       STA 3000H; Store result
       HLT