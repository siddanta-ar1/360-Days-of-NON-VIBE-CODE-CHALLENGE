
; Problem: Add two 16-bit numbers stored at HL and DE pairs.
; Result stored in HL.

LXI H, 2050H   ; Load 1st 16-bit number into HL
LXI D, 1020H   ; Load 2nd 16-bit number into DE
DAD D          ; Add DE to HL (HL = HL + DE)
SHLD 3050H     ; Store result at memory location 3050H
HLT            ; Terminate