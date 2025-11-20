; Problem: Subtract number at 2001H from number at 2000H.
; Store result at 2002H.

LXI H, 2000H   ; Point to first number
MOV A, M       ; Move first number to Accumulator
INX H          ; Point to second number
SUB M          ; Subtract second number from A (A = A - M)
INX H          ; Point to result location
MOV M, A       ; Store result
HLT