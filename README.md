# Perfect Circle Solver

> **Korean Guide (한국어 설명서)**: [`README_KO.md`](README_KO.md)  
> **Engineering Report (공학 분석서)**: [`ENGINEERING_REPORT.md`](ENGINEERING_REPORT.md)  
> **Usage Instructions (사용법)**: [`USAGE.md`](USAGE.md)

A zero-dependency vanilla JavaScript solver that guarantees a 100% win rate (**99.9% Perfect Circle**) on [neal.fun/perfect-circle](https://neal.fun/perfect-circle/).

![99.9% Perfect Circle Preview](assets/preview.png)

---

## Highlights

- **100% Flawless Rate**: Hits the game's hardcoded mathematical score ceiling (`99.9%`) on every run.
- **Spin Bug Neutralized**: Fixes the alternating score drop ($99.9\% \to \approx 72\%$) caused by the game's post-win CSS rotation animation (`svg-container-spin`).
- **Zero Event Drops**: Partitions the 360-degree arc into 300 calibrated steps ($h = 7.33\,\text{px} > 6\,\text{px}$), bypassing the internal sample discard filter.
- **Zero Dependencies**: Pure vanilla JavaScript for instant execution via the browser developer console (`F12`).

---

## Quick Start

1. Open [https://neal.fun/perfect-circle/](https://neal.fun/perfect-circle/) in your browser.
2. Press `F12` to open Developer Tools and select the **Console** tab.
3. Copy the entire content of [`perfect_circle.js`](perfect_circle.js), paste it into the console, and press `Enter`.

---

## Repository Structure

```
perfect-circle-solver/
├── README.md               # English Overview
├── README_KO.md            # Korean In-Depth Narrative (im-not-ai standard)
├── ENGINEERING_REPORT.md   # Mathematical reverse-engineering report
├── USAGE.md                # Step-by-step usage guide
├── perfect_circle.js       # Production-ready vanilla JS solver script
└── assets/
    └── preview.png         # Live browser 99.9% screenshot
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
