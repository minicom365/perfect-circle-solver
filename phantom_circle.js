// Architecture Specification: Section 7 - Out-of-Bounds Phantom Trajectory Synthesis
// Exploits the complete absence of viewport boundary validation (clamp/out-of-bounds) in the engine,
// allowing arbitrary score synthesis (from 0.0% to 99.9%) on a 100% invisible canvas outside the screen.

/**
 * phantom_circle.js - The Invisible Phantom Circle Solver for neal.fun/perfect-circle
 * 
 * [EN] Pure vanilla JavaScript snippet to run directly in the browser developer console (F12).
 * Exploits the engine's lack of viewport boundary checks by drawing circles entirely outside
 * the visible screen (R >= 2000px). Synthesizes ANY target score (e.g. 99.9%, 77.7%, 50.0%, 0.0%)
 * onto a completely blank canvas with zero visible drawing lines.
 * 
 * [KO] 브라우저 개발자 도구 콘솔(F12)에서 직접 실행하는 순수 자바스크립트 스크립트.
 * 게임 엔진이 화면 밖 좌표(ViewPort Boundary)를 전혀 검사하지 않는 맹점을 역이용하여,
 * 화면 바깥 저 멀리(R >= 2000px)에서 보이지 않는 원을 그리면서도
 * 사용자가 지정한 임의의 점수(99.9%, 77.7%, 50.0%, 0.0% 등)를 화면에 100% 정확하게 출력합니다.
 */

(async () => {
    // =========================================================================
    // [CONFIGURATION]
    // Set your desired target score percentage (from 0.0 to 99.9):
    // Examples: 99.9 (Flawless), 77.7 (Lucky 7), 50.0 (Half), 0.0 (Absolute Zero)
    // =========================================================================
    const target_score = 99.9; // <--- 원하는 목표 점수를 입력하세요!

    // Base off-screen logical radius (SVG center is at 500, 500)
    // R = 2000px places the entire path well beyond the visible 1000x1000 viewport
    const offscreen_base_radius = 2000;

    console.log(`[phantom-circle] Initializing Invisible Phantom Solver...`);
    console.log(`[phantom-circle] Target Score: ${target_score.toFixed(1)}% | Canvas Visibility: 100% INVISIBLE`);

    const svg = document.querySelector("svg");
    const draw_container = document.querySelector("main div") || document.querySelector("section div") || document.body;

    if (!svg || !draw_container) {
        console.error("[phantom-circle] Target game elements not found. Please open https://neal.fun/perfect-circle/ first.");
        return;
    }

    // 1. Traverse Vue instance safely using iterative BFS with cycle detection
    function find_game_component() {
        const root_vue = document.querySelector("#__nuxt")?.__vue__;
        const queue = [];
        const visited = new Set();

        if (root_vue) {
            queue.push(root_vue);
        } else {
            const root_elem = document.body;
            if (root_elem?.__vue__) queue.push(root_elem.__vue__);
        }

        while (queue.length > 0) {
            const curr = queue.shift();
            if (!curr || visited.has(curr)) continue;
            visited.add(curr);

            if ("score" in curr && "onComplete" in curr) {
                return curr;
            }

            if (curr.$children && Array.isArray(curr.$children)) {
                for (const child of curr.$children) {
                    if (child && !visited.has(child)) {
                        queue.push(child);
                    }
                }
            }
        }
        return null;
    }
    const vm = find_game_component();

    // 2. Clear lingering draw state & neutralize CSS spin animation
    draw_container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 50));

    svg.classList.remove("svg-container-spin");
    svg.style.transform = "none";
    svg.style.animation = "none";
    if (vm) {
        vm.valid = false;
    }
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 30));

    // 3. Start game safely
    const go_button = document.querySelector("header button");
    if (vm && !vm.start && go_button) {
        go_button.click();
        await new Promise(resolve => setTimeout(resolve, 350));
    }

    // 4. Mathematical Radius Inversion
    // The engine computes step score: k = max(0, 1 - |r - o| / o)
    // To achieve target score ratio k_ratio in [0.0, 0.999]:
    // For k_ratio > 0: (r - o) / o = (1 - k_ratio)  ==>  r = o * (2 - k_ratio)
    // For k_ratio = 0: r >= 3 * o on step 1, r >= 2 * o on steps 2..N
    const clamped_target = Math.max(0, Math.min(99.9, target_score));
    const k_ratio = clamped_target / 100.0;

    const center_x = 500;
    const center_y = 500;
    const initial_o = offscreen_base_radius;

    let target_r = initial_o;
    if (clamped_target <= 0.05) {
        // Complete 0.0% boundary condition: leap to 3 * o
        target_r = initial_o * 3.0;
    } else {
        // Exact mathematical inversion for target score
        target_r = initial_o * (2.0 - k_ratio);
    }

    function emit_mouse_event(type, logical_x, logical_y) {
        const rect = svg.getBoundingClientRect();
        // Logical coordinates map proportionally even when far outside [0, 1000]
        const client_x = rect.left + (logical_x / 1000) * rect.width;
        const client_y = rect.top + (logical_y / 1000) * rect.height;
        draw_container.dispatchEvent(new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: client_x,
            clientY: client_y,
            pageX: client_x + window.scrollX,
            pageY: client_y + window.scrollY
        }));
    }

    // 5. Generate 300-step Offscreen Trajectory
    // Step chord distance h = target_r * (1.2 * PI / 180) >= 2000 * 0.0209 = 41.8px >> 6px
    // Zero sample drops, full 360-degree sweep completely outside visible screen
    const total_steps = 300;
    const points = [];

    // Mousedown at (center_x + initial_o, center_y)
    points.push([center_x + initial_o, center_y]);

    for (let i = 1; i <= total_steps; i++) {
        const theta = (i * 360.0) / total_steps;
        const rad = (theta * Math.PI) / 180;
        const px = center_x + target_r * Math.cos(rad);
        const py = center_y + target_r * Math.sin(rad);
        points.push([px, py]);
    }

    // 6. Dispatch Synthetic Events
    emit_mouse_event("mousedown", points[0][0], points[0][1]);
    await new Promise(resolve => setTimeout(resolve, 25));

    for (let i = 1; i < points.length; i++) {
        emit_mouse_event("mousemove", points[i][0], points[i][1]);

        if (i % 6 === 0) {
            await new Promise(resolve => setTimeout(resolve, 2));
        }
    }

    const last_point = points[points.length - 1];
    emit_mouse_event("mouseup", last_point[0], last_point[1]);
    await new Promise(resolve => setTimeout(resolve, 400));

    // Restore SVG styles
    svg.style.transform = "";
    svg.style.animation = "";

    const score_element = document.querySelector("p[style*='color']");
    const score_text = score_element ? score_element.innerText.replace(/\s+/g, "") : `${clamped_target.toFixed(1)}%`;
    console.log(`[phantom-circle] Done! Invisible drawing achieved: ${score_text}`);
})();
