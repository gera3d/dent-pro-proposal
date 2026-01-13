# 💎 Comprehensive Polish Plan: Dent Experts Digital Twin

## 🎯 Objective
Transform the "PDR Vehicle Scope" web form from a functional tool into a **premium, app-like experience**. The goal is **speed, clarity, and visual delight** for the estimator on the field.

---

## 🎨 1. Visual Design (The "Premium" Feel)
We will move towards a "Glass Dark Mode" aesthetic (inspired by Apple iOS and high-end automotive interfaces).

*   **Glassmorphism**: 
    *   Change solid panel backgrounds (`#303030`) to semi-transparent black (`rgba(30, 30, 30, 0.7)`) with `backdrop-filter: blur(12px)`.
    *   Add subtle white borders (`1px solid rgba(255, 255, 255, 0.08)`) to define edges without harsh lines.
*   **Typography**:
    *   Switch to **Inter** or **San Francisco** (System UI) with tighter tracking.
    *   Use **uppercase, widely spaced** labels for "DC/OS" to look like technical specs.
    *   Increase contrast for read-only text.
*   **Depth & Shadows**:
    *   Add soft drop shadows `box-shadow: 0 4px 20px rgba(0,0,0,0.4)` to panels to separate them from the background.
*   **Accent Colors**:
    *   Use the signature **#4CD964 (Neon Green)** for *active* states and primary actions only.
    *   Use muted greys for inactive inputs to reduce visual noise.

## 👆 2. Touch & Usability (Field Optimization)
Estimators use this on phones/tablets. Every tap counts.

*   **Super-Sized Touch Targets**:
    *   Expand checkboxes from standard size to **44x44px clickable areas**.
    *   Custom CSS Checkboxes: Replace browser defaults with large, green-lit toggle squares.
*   **Sticky "Smart" Footer**:
    *   The "Submit" bar should be a floating glass pane at the bottom.
    *   Add a "Progress" indicator (e.g., "4 Panels Scoped") to the footer.
*   **Input steppers**:
    *   For "DC" (Dent Count) and "OS", consider adding `[-] [Value] [+]` buttons so users don't have to type numbers.

## 🚗 3. Interactive Schematic (The "Hero" Feature)
The center car diagram is currently static. We can make it the controller.

*   **Click-to-Scroll**: Tapping the "Hood" on the diagram smooth-scrolls to the Hood panel inputs.
*   **Heatmap Visualization**: 
    *   When a user Enters "High Severity" for the Hood, the Hood on the diagram turns **Red**.
    *   When "Light", it turns **Green**.
    *   This gives an instant visual summary of the damage.

## ⚡ 4. Micro-Interactions (Feedback)
*   **Success Animation**: When a panel checklist is touched, flash a subtle glow.
*   **Photo Counter**: Animate the photo count jumping up when an image is added.
*   **Haptic Feedback**: Use `navigator.vibrate(5)` on mobile (if supported) for satisfying clicks.

## 📝 Implementation Phases

### Phase A: Visual Overhaul (Immediate)
*   [ ] Apply Glassmorphism CSS variables.
*   [ ] Implement Custom CSS Checkboxes (Large).
*   [ ] Add Panel Shadows and Borders.

### Phase B: Interactive Schematic (Next)
*   [ ] Map SVG paths to Panel IDs.
*   [ ] Add Click listeners to SVG paths.
*   [ ] Bind Input changes to SVG fill colors.

### Phase C: Smart Inputs
*   [ ] Replace DC/OS text inputs with Steppers or Buttons (1-5, 5-10, etc as buttons?).
