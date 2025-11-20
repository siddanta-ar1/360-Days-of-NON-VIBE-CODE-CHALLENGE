; Problem: Sort 5 numbers at 2000H in Ascending Order.

    LXI H, 2000H  ; Initialize pointer
    MVI D, 05H    ; Pass Counter (5 elements)

PASS: MVI C, 04H   ; Comparison Counter (N-1)
      LXI H, 2000H ; Reset pointer for new pass

COMP: MOV A, M     ; Load current number
      INX H        ; Point to next number
      CMP M        ; Compare A with next number
      JC SKIP      ; If A < Next, No swap needed (Ascending)
      
      ; SWAP LOGIC
      MOV B, M     ; Move Next to B
      MOV M, A     ; Move A (Current) to Next position
      DCX H        ; Go back to Current position
      MOV M, B     ; Move B (Next) to Current position
      INX H        ; Advance pointer again

SKIP: DCR C        ; Decrement comparison counter
      JNZ COMP     ; Continue inner loop

      DCR D        ; Decrement pass counter
      JNZ PASS     ; Continue outer loop
      HLT