# 사용 방법 (Usage Guide)

[neal.fun/perfect-circle](https://neal.fun/perfect-circle/)에서 스크립트를 실행하는 방법입니다. 외부 프로그램 설치나 환경 설정 없이, 사용하는 웹 브라우저의 개발자 도구 콘솔만 있으면 즉시 실행할 수 있습니다.

---

## 1. 실행 순서

1. 웹 브라우저(Chrome, Edge, Whale, Firefox 등)로 [https://neal.fun/perfect-circle/](https://neal.fun/perfect-circle/) 에 접속합니다.
2. 키보드의 `F12` 키를 누르거나, 화면 아무 곳이나 마우스 우클릭 후 **검사(Inspect)**를 선택해 개발자 도구를 엽니다.
3. 상단 탭에서 **Console (콘솔)** 탭을 클릭합니다.
4. 이 저장소의 [`perfect_circle.js`](perfect_circle.js) 파일 전체 내용을 복사합니다.
5. 콘솔 입력창에 붙여넣고 `Enter` 키를 누릅니다.

약 0.5초 동안 원이 자동으로 그려지며, 게임 화면 중앙에 **`99.9%`** 와 **`Perfect circle`** 칭호가 표시됩니다.

---

## 2. 보너스 스크립트 실행법

### A. 역설의 다각형 (99.9% 만점)
화면에 날카로운 정삼각형이나 사각형을 그리고도 99.9% 만점을 획득합니다.
1. [`paradox_shapes.js`](paradox_shapes.js) 내용을 복사합니다.
2. 콘솔에 붙여넣고 `Enter`를 누릅니다.
3. 스크립트 상단의 `SELECTED_SHAPE` 변수를 `"triangle"`, `"square"`, `"pentagon"` 등으로 변경하여 다양한 다각형을 테스트할 수 있습니다. (자세한 내용은 [`PARADOX_SHAPES.md`](PARADOX_SHAPES.md) 참조)

### B. 이론상 최저 점수 (0.0% Absolute Zero)
게임의 실격 트랩("Too slow", "Wrong way", "Ended too early")을 완벽히 회피하면서 유효 판정(Valid)으로 0.0% 최저 점수를 획득합니다.
1. [`lowest_circle.js`](lowest_circle.js) 내용을 복사합니다.
2. 콘솔에 붙여넣고 `Enter`를 누릅니다.
3. 스크립트 상단의 `selected_mode` 변수를 `"explosion"`(0.0% 확정), `"spiral"`(극단 나선), `"sawtooth"`(톱니 별) 등으로 변경할 수 있습니다. (자세한 내용은 [`LOWEST_SCORE_REPORT.md`](LOWEST_SCORE_REPORT.md) 참조)

### C. 유령 원 (화면 밖 투명 채점 및 임의 점수 합성)
화면에는 선이 전혀 보이지 않는 완전한 백지 상태에서, 사용자가 원하는 임의의 점수(99.9%, 77.7%, 50.0%, 0.0% 등)를 정확히 출력합니다.
1. [`phantom_circle.js`](phantom_circle.js) 내용을 복사합니다.
2. 스크립트 상단의 `target_score` 변수에 원하는 점수(예: `77.7`)를 입력합니다.
3. 콘솔에 붙여넣고 `Enter`를 누릅니다. (자세한 내용은 [`PHANTOM_CIRCLE.md`](PHANTOM_CIRCLE.md) 참조)

---

## 3. 연속 실행

점수가 나온 상태에서 콘솔 입력창에 스크립트를 다시 붙여넣고 엔터를 치면 즉시 다음 판이 실행됩니다.

기존 매크로나 단순 스크립트와 달리, 본 스크립트들은 게임의 승리 축하 회전 효과(`svg-container-spin`)를 시작 전에 자동으로 리셋하므로 10번, 100번 연속으로 실행해도 뷰포트 왜곡 없이 목표 결과를 유지합니다.

---

## 4. 주의사항

- 스크립트가 실행되는 동안에는 마우스를 물리적으로 흔들지 않는 것이 좋습니다. 사용자의 실제 마우스 입력이 브라우저 이벤트 루프에 끼어들면 궤적이 튀어 점수가 왜곡될 수 있습니다.
- 브라우저 탭이 백그라운드로 내려가 있거나 다른 창 뒤에 가려져 있으면 브라우저가 타이머를 지연시켜 `Too slow` 판정이 나올 수 있으므로, 해당 탭을 화면에 띄워둔 상태에서 실행하시기 바랍니다.
