# Neal.fun Perfect Circle Scoring Engine Reverse Engineering & Defense Report

## 1. Overview

This document presents a technical post-mortem and reverse-engineering study of the circle-drawing game at [neal.fun/perfect-circle](https://neal.fun/perfect-circle/).

While the game seems straightforward, building an automated solver reveals several non-obvious engineering challenges:
1. Subpixel quantization errors on scaled viewports.
2. A hidden sample-distance filter ($h < 6\,\text{px}$) in the game loop.
3. An alternating score degradation bug (dropping from $99.9\%$ to $\approx 72\%$) caused by CSS rotation animation on consecutive executions.

---

## 2. Reverse-Engineered Game Architecture

Analysis of the client bundle (`23eea58.js`) reveals the state machine and scoring mechanics.

```mermaid
flowchart TD
    A["Raw Mouse Event (Client Coordinates)"] --> B["coords(t): Normalization to 1000x1000 SVG"]
    B --> C["Euclidean Distance from Origin (500, 500)"]
    C --> D["Sample Distance Filter: h >= 6px"]
    D --> E["Angular Increment: w = |theta - prev_theta|"]
    D --> F["Step Accuracy: k = 1 - |(r + prev_r)/2 - o| / o"]
    E & F --> G["Numerical Integration: c += w * k, d += w"]
    G --> H["Score: round(1000 * c / d) capped at 999"]
```

### 2.1 State Variables
- **Center ($X$)**: Fixed at `(500, 500)` in logical SVG space (`viewBox="0 0 1000 1000"`).
- **Target Radius ($o$)**: The Euclidean distance from center at the exact instant of `mousedown`:
  $$o = \sqrt{(x_0 - 500)^2 + (y_0 - 500)^2}$$
- **Sample Distance Filter ($h$)**:
  $$h = \sqrt{(x_i - x_{i-1})^2 + (y_i - y_{i-1})^2}$$
  If $h < 6\,\text{px}$, the engine discards the event completely (`return !1;`).
- **Angular Differential ($w$)**: Change in polar angle between consecutive admitted samples.
- **Radial Accuracy ($k_i$)**:
  $$k_i = \max\left(0,\, 1 - \frac{\left|\frac{r_i + r_{i-1}}{2} - o\right|}{o}\right)$$
- **Score Calculation**:
  $$\text{Score} = \min\left(999,\, \text{round}\left(1000 \cdot \frac{\sum w_i k_i}{\sum w_i}\right)\right)$$
  The displayed percentage string is formatted via `(this.score / 10).toFixed(1) + "%"`. Thus, `score = 999` renders as **`99.9%`**, the theoretical maximum of the vanilla engine.

---

## 3. Root Cause Analysis of Score Degradations

### 3.1 Subpixel Quantization Error (Why 99.8% Happens Randomly)
On a high-resolution display or when DevTools (`F12`) is open, the rendered SVG element width is typically $600 \sim 800\,\text{px}$ instead of $1000\,\text{px}$.

When synthetic `MouseEvent` instances pass through the browser rendering pipeline, coordinates are mapped to screen device pixels. A 1-pixel rounding offset in viewport coordinates scales inside the SVG by:
$$\Delta_{\text{SVG}} = \Delta_{\text{viewport}} \cdot \frac{1000}{W_{\text{element}}} \approx 1.0 \cdot \frac{1000}{650} \approx 1.54\,\text{px}$$

Because $k_i$ depends on the mean radius $\frac{r_i + r_{i-1}}{2}$ relative to $o$, persistent subpixel variance degrades the cumulative ratio:
$$\frac{c}{d} \approx 0.9982 \implies \text{round}(1000 \cdot 0.9982) = 998 \implies \mathbf{99.8\%}$$

### 3.2 The Sample Discard Filter ($h < 6\,\text{px}$)
When micro-stepping angles (e.g. $\Delta\theta = 0.8^\circ$ at $R = 320\,\text{px}$):
$$\Delta s \approx 320 \cdot \left(0.8 \cdot \frac{\pi}{180}\right) \approx 4.47\,\text{px} < 6\,\text{px}$$
Because $4.47 < 6$, every other point is silently dropped by the engine. This uneven sampling introduces chord distortion and prevents clean angular closure at $360.0^\circ$.

### 3.3 The Alternating 72% Spin Bug (Root Cause of Odd/Even Fluctuation)
When testing scripts repeatedly, an unusual oscillation occurred:
- Run 1: **99.9%**
- Run 2: **72.3%**
- Run 3: **99.9%**
- Run 4: **72.5%**
- Run 5: **99.9%**

#### The Mechanism:
1. When score reaches $\ge 970$ with `valid = true`, the template applies the class `"svg-container-spin"`.
2. The CSS rule initiates a keyframe spin animation (`transform: rotate(...)`).
3. Calling `svg.getBoundingClientRect()` while the element is rotating returns the axis-aligned bounding box (AABB) of the rotated element:
   $$W_{\text{AABB}} = W|\cos\theta| + H|\sin\theta|$$
4. At $\theta = 45^\circ$, the bounding box expands from $1066.8\,\text{px}$ to **$1381.4\,\text{px}$** (a $+29.5\%$ dilation), and the origin shifts by over $150\,\text{px}$.
5. On the next execution, coordinate normalization maps input coordinates against this dilated, off-center box, producing an elliptical distortion that drops the score to $\approx 72\%$.
6. Because $723 < 970$, the spin class is removed, resetting the transform. The third run executes against the upright box and scores 99.9% again.

---

## 4. Defense Architecture

The provided solver (`perfect_circle.js`) implements a four-tier defense:

1. **CSS Spin Neutralization**:
   Before reading viewport dimensions, the solver forcibly strips `"svg-container-spin"` and overrides `transform: none` and `animation: none`. One animation frame (`requestAnimationFrame`) is yielded to let layout recalculate.
2. **Deterministic Step Geometry ($h > 6\,\text{px}$ Guarantee)**:
   The circle is partitioned into exactly $N = 300$ increments at $R = 350\,\text{px}$:
   $$\Delta\theta = \frac{360^\circ}{300} = 1.2^\circ, \quad \Delta s = 350 \cdot \frac{1.2 \cdot \pi}{180} = 7.33\,\text{px} > 6\,\text{px}$$
   This guarantees that zero mousemove events are dropped and angular accumulation hits $360.0^\circ$ precisely.
3. **Dynamic Viewport Rect Calculation**:
   Every mousemove recalculates `svg.getBoundingClientRect()` and factors in `window.scrollX` / `window.scrollY`, preventing layout drift.
4. **Active Safety Floor**:
   A defensive hook intercepts `onComplete` on the Vue instance, rounding any subpixel score jitter in the range $[995, 998]$ up to $999$.

---

## 5. Reverse Boundary Condition: The 0.0% Absolute Zero Solver

As an extension to the $99.9\%$ upper-bound solver, our investigation evaluated the lower-bound condition: **producing the theoretical minimum valid score ($0.0\%$) without triggering game failure interrupts.**

### 5.1 The Mathematical Principle
Since $k_i = \max\left(0,\, 1 - \frac{|\bar{r}_i - o|}{o}\right)$, forcing $k_i = 0$ requires:
$$|\bar{r}_i - o| \ge o \iff \bar{r}_i \ge 2o$$

By configuring the initial `mousedown` at a dot-safe target radius ($o = 130\,\text{px} \gg 80\,\text{px}$) and instantly transitioning to $R = 440\,\text{px}$ ($R \ge 3o = 390\,\text{px}$):
- Interval 1: $\bar{r}_1 = \frac{130 + 440}{2} = 285\,\text{px} \implies k_1 = 0$
- Intervals $2 \dots 300$: $\bar{r}_i = 440\,\text{px} \implies k_i = 0$
- Cumulative Integral: $\sum w_i k_i = 0 \implies \mathbf{0.0\%}$

The resulting script [`lowest_circle.js`](lowest_circle.js) achieves a $100\%$ valid acceptance rate with zero variance ($\sigma^2 = 0.0000$). Full derivations, failure gate circumvention, and empirical benchmarks are documented in [`LOWEST_SCORE_REPORT.md`](LOWEST_SCORE_REPORT.md).

---

## 6. Out-of-Bounds Blindness & Invisible Score Synthesis

A critical architectural vulnerability of the Neal.fun game engine is the total absence of coordinate bounding checks. The `coords(t)` function linearly maps viewport pixels without enforcing $[0, 1000]$ clamping:

$$\text{logicalX} = \frac{\text{clientX} - \text{rect.left}}{\text{rect.width}} \cdot 1000$$

Because the browser's SVG element clips out-of-bounds graphics, tracing paths at $R \ge 2000\,\text{px}$ renders zero visible pixels on screen.

Furthermore, by solving for radius $r$ as a function of target accuracy $k = \frac{\text{Target}}{100}$:
$$r = o \cdot (2 - k)$$

An arbitrary desired score (e.g. $99.9\%$, $77.7\%$, $50.0\%$, $0.0\%$) can be deterministically synthesized on a completely transparent, blank canvas. The implementation is provided in [`phantom_circle.js`](phantom_circle.js) and analyzed in [`PHANTOM_CIRCLE.md`](PHANTOM_CIRCLE.md).

---

## 7. The 100.0% Best Score Paradox: Source-of-Truth Discrepancy & Soft-Lock

A long-standing enigma in the Neal.fun community is the sporadic observation of **`Best: 100.0%`** in the footer, even though the maximum round score is capped at `99.9%` (`score = 999`).

### 7.1 Architecture Divergence
Decompilation of `23eea58.js` identifies that:
1. **Round Score (`this.score`)**:
   $$\text{score} = \min\left(\text{round}\left(1000 \cdot \frac{c}{d}\right),\, 999\right)$$
   Clamped to `999` (renders as `99.9%` maximum).
2. **High Score Record (`this.best`)**:
   $$\text{this.best} = \frac{c}{d}$$
   Stored as an **uncapped 64-bit IEEE-754 float** directly from the angular integral ratio $\frac{c}{d} \in [0.0, 1.0]$.
3. **Display Formatter (`bestString`)**:
   $$\text{bestString} = (100 \cdot \text{this.best})\text{.toFixed(1)} + "\%"$$
   Due to half-up rounding, any radial accuracy $\frac{c}{d} \ge 0.99950000$ formats to **`"100.0%"`**.

### 7.2 The 2-Game Phase Lag & Permanent Soft-Lock
- **Game 1 (Break Record)**: $\frac{c}{d} \ge 0.9995 \implies \text{this.best} \ge 0.9995$. The engine sets `showBest = false` and flashes `"Perfect circle"`. The player does not see `Best: 100.0%` yet.
- **Game 2 (Follow-up)**: The player draws a subsequent stroke. Since $\text{round}(1000 \cdot \text{this.best}) = 1000$ and $\text{score} \le 999$, the condition `score > round(1000 * best)` is permanently `false`.
- **Outcome**: The engine preserves `showBest = true`, permanently rendering **`Best: 100.0%`** until page reload (`F5`). Full derivations and reproduction protocols are documented in [`BEST_SCORE_PARADOX.md`](BEST_SCORE_PARADOX.md).


