LXI H, 2000H    ; Point to string start

LOOP: MOV A, M  ; Get character
      CPI 00H   ; Check for end of string (Null terminator)
      JZ END    ; If 00H, stop
      
      SUI 20H   ; Subtract 20H to convert to Uppercase
                ; (e.g., 61H ('a') - 20H = 41H ('A'))
      
      MOV M, A  ; Store the Uppercase letter back to memory
      INX H     ; Move to next character
      JMP LOOP  ; Repeat

END:  HLT