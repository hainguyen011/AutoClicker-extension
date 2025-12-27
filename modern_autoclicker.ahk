#Requires AutoHotkey v2.0
; ==============================================================================
; MODERN AUTO-CLICKER (Human-Like Behavior)
; ==============================================================================
; Features:
; - Gaussian Random Distribution for delays (Bell Curve): More natural than linear random.
; - Spatial Jitter: Micro-movements of the mouse cursor while clicking.
; - Toggle: Press F8 to Start/Stop.
; ==============================================================================

; --- Configuration ---
TargetCPS := 12              ; Target Clicks Per Second
JitterRange := 2             ; Max pixel offset radius (e.g., 2 pixels)
MeanDelay := 1000 / TargetCPS
StdDev := MeanDelay * 0.2    ; Standard Deviation (20% variance is natural)

; --- State Variables ---
Running := false

; --- Hotkey ---
F8::
{
    global Running
    Running := !Running
    
    if (Running) {
        SoundBeep(1000, 150)
        ToolTip(">>> AUTO-CLICKER: ON <<<`n(Human Mode)")
        SetTimer(ClickLoop, 10) ; Start the loop fast, specific delays handled inside
    } else {
        SoundBeep(500, 150)
        ToolTip(">>> AUTO-CLICKER: OFF <<<")
        SetTimer(ClickLoop, 0)  ; Turn off timer
        Sleep(1000)
        ToolTip()               ; Clear tooltip
    }
}

; --- Main Loop ---
ClickLoop()
{
    if (!Running)
        return

    ; 1. Spatial Jitter (Micro-movements)
    ; Humans rarely keep the mouse dead still while clicking rapidly.
    MouseGetPos(&CurrentX, &CurrentY)
    OffsetX := Random(-JitterRange, JitterRange)
    OffsetY := Random(-JitterRange, JitterRange)
    
    ; Only move if we are actually jittering (avoid 0,0 ops if not needed)
    if (OffsetX != 0 || OffsetY != 0)
        MouseMove(CurrentX + OffsetX, CurrentY + OffsetY, 0)
    
    ; 2. Click
    Click
    
    ; 3. Gaussian Random Delay (Box-Muller Transform)
    ; Generates a normally distributed random number.
    ; This avoids the "robotic" feel of Uniform Randomness (Random, min, max).
    delay := GaussianRandom(MeanDelay, StdDev)
    
    ; Ensure delay is never negative or too fast to be registered
    if (delay < 20)
        delay := 20
        
    ; Wait the calculated time
    SetTimer(ClickLoop, Integer(delay))
}

; --- Helper Function: Box-Muller Transform ---
; Returns a random number distributed according to a normal distribution
; with the given mean and standard deviation.
GaussianRandom(mean, stdDev)
{
    u1 := 0.0
    u2 := 0.0
    
    ; Avoid log(0)
    while (u1 == 0)
        u1 := Random()
    while (u2 == 0)
        u2 := Random()
        
    z0 := Sqrt(-2.0 * Ln(u1)) * Cos(2.0 * 3.141592653589793 * u2)
    
    return z0 * stdDev + mean
}
