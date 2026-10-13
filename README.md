# Perfect Circle Solver

> **Korean Guide (한국어 설명서)**: [`README_KO.md`](README_KO.md)  
> **Engineering Report (공학 분석서)**: [`ENGINEERING_REPORT.md`](ENGINEERING_REPORT.md)  
> **Lowest Score Study (0.0% 최저 점수 연구)**: [`LOWEST_SCORE_REPORT.md`](LOWEST_SCORE_REPORT.md)  
> **Phantom Circle Study (투명 유령 원 연구)**: [`PHANTOM_CIRCLE.md`](PHANTOM_CIRCLE.md)  
> **Paradox Shapes (역설의 다각형)**: [`PARADOX_SHAPES.md`](PARADOX_SHAPES.md)  
> **Usage Instructions (사용법)**: [`USAGE.md`](USAGE.md)

A zero-dependency vanilla JavaScript solver that guarantees a 100% win rate (**99.9% Perfect Circle**) on [neal.fun/perfect-circle](https://neal.fun/perfect-circle/).

![99.9% Perfect Circle Preview](assets/preview.png)

---

## Highlights

- **100% Flawless Rate**: Hits the game's hardcoded mathematical score ceiling (`99.9%`) on every run.
- **0.0% Absolute Zero Solver**: Features [`lowest_circle.js`](lowest_circle.js) to deterministically hit the lowest possible score (**0.0%**) under full valid status without triggering engine failure states ("Too slow", "Wrong way", "Ended too early").
- **Spin Bug Neutralized**: Fixes the alternating score drop ($99.9\% \to \approx 72\%$) caused by the game's post-win CSS rotation animation (`svg-container-spin`).
- **Zero Event Drops**: Partitions the 360-degree arc into 300 calibrated steps ($h = 7.33\,\text{px} > 6\,\text{px}$), bypassing the internal sample discard filter.
- **Paradox Mode Included**: Features [`paradox_shapes.js`](paradox_shapes.js) to draw sharp equilateral triangles and squares that still score **99.9% (Perfect Circle)** by exploiting chord interpolation blindness.
- **Zero Dependencies**: Pure vanilla JavaScript for instant execution via the browser developer console (`F12`).

---

## Quick Start

### 1. Standard Circle (99.9% Perfect Circle)
1. Open [https://neal.fun/perfect-circle/](https://neal.fun/perfect-circle/) in your browser.
2. Press `F12` to open Developer Tools and select the **Console** tab.
3. Copy the entire content of [`perfect_circle.js`](perfect_circle.js), paste it into the console, and press `Enter`.

### 2. Paradox Shapes (99.9% Impossible Triangle / Square)
- Copy [`paradox_shapes.js`](paradox_shapes.js) and paste into the console to render sharp polygons that fool the engine into scoring 99.9%. See [`PARADOX_SHAPES.md`](PARADOX_SHAPES.md) for details.

### 3. Absolute Zero (0.0% Lowest Valid Score)
- Copy [`lowest_circle.js`](lowest_circle.js) and paste into the console to hit an official **0.0%** score using deterministic radial explosion ($R \ge 3o$). See [`LOWEST_SCORE_REPORT.md`](LOWEST_SCORE_REPORT.md) for mathematical proofs.

### 4. Invisible Phantom Circle (Arbitrary Custom Score Synthesis)
- Copy [`phantom_circle.js`](phantom_circle.js) to draw completely outside the visible screen ($R \ge 2000\,\text{px}$) and synthesize ANY desired score (e.g. 77.7%, 50.0%, 99.9%, 0.0%) on a 100% invisible blank canvas. See [`PHANTOM_CIRCLE.md`](PHANTOM_CIRCLE.md) for details.

---

## Repository Structure

```
perfect-circle-solver/
├── README.md               # English Overview
├── README_KO.md            # Korean In-Depth Narrative
├── ENGINEERING_REPORT.md   # Mathematical reverse-engineering report
├── LOWEST_SCORE_REPORT.md  # 0.0% Absolute Zero formal research report
├── PHANTOM_CIRCLE.md       # Invisible off-screen score synthesis guide
├── PARADOX_SHAPES.md       # Impossible polygon 99.9% paradox guide
├── USAGE.md                # Step-by-step usage guide
├── perfect_circle.js       # Production-ready vanilla JS solver (99.9%)
├── lowest_circle.js        # Absolute Zero vanilla JS solver (0.0%)
├── phantom_circle.js       # Invisible off-screen arbitrary score solver
├── paradox_shapes.js       # Triangle / Square 99.9% paradox generator
└── assets/
    ├── preview.png         # Live browser 99.9% circle screenshot
    ├── impossible_triangle_preview.png # Live browser 99.9% triangle
    └── sharp_square_preview.png        # Live browser 99.9% square
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
