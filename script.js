/*
 * 바르는 여드름 치료제 셀프 테스트 · 닥터나우 (프로토타입)
 *
 * DRAFT NOTICE:
 * 문항 구성 / 안전 게이트 기준 / 중증도 임계값은 UX·로직 설계를 위한 초안입니다.
 * 실제 서비스 반영 전 반드시 원내 자문 전문의 및 법무/의료광고 검토를 거쳐야 합니다.
 */

const QUESTIONS = [
  {
    id: "A1",
    group: "gate",
    emoji: "🤰",
    text: "임신 중이거나 임신 계획 중, 또는 수유 중이신가요?",
    note: "레티노이드 계열(트레티노인·아다팔렌 등) 성분은 임신·수유 중 사용이 제한돼요.",
  },
  {
    id: "A2",
    group: "gate",
    emoji: "💊",
    text: "현재 경구 여드름약을 복용 중이거나 최근 6개월 이내 복용한 적이 있나요?",
    note: "경구 치료와 병행 시 피부 자극이나 중복 처방 이슈가 생길 수 있어요.",
  },
  {
    id: "A3",
    group: "gate",
    emoji: "⚠️",
    text: "이전에 여드름 연고·크림을 쓰고 심한 자극, 화끈거림, 알레르기 반응을 겪은 적이 있나요?",
    note: "특정 성분에 대한 과민반응 이력을 확인하는 질문이에요.",
  },
  {
    id: "A4",
    group: "gate",
    emoji: "🧒",
    text: "만 14세 미만인가요?",
    note: "연령에 따라 사용 가능한 성분과 보호자 동의 여부가 달라져요.",
  },
  {
    id: "B1",
    group: "severity",
    weight: 1,
    emoji: "⚪",
    text: "블랙헤드·화이트헤드 같은 비염증성 여드름 위주인가요?",
    note: "초기·경증 여드름에서 흔히 나타나는 형태예요.",
  },
  {
    id: "B2",
    group: "severity",
    weight: 1,
    emoji: "🔴",
    text: "붉게 부어오르거나 곪는 여드름(구진·농포)이 있나요?",
    note: "염증성 여드름의 대표적인 신호예요.",
  },
  {
    id: "B3",
    group: "severity",
    weight: 2,
    emoji: "🟣",
    text: "만지면 아픈 단단한 결절이나 물혹 같은 낭종이 있나요?",
    note: "중증 여드름(결절낭종성)에서 나타나는 형태예요.",
  },
  {
    id: "B4",
    group: "severity",
    weight: 1,
    emoji: "📍",
    text: "얼굴 외에 등, 가슴, 어깨에도 여드름이 있나요?",
    note: "범위가 넓을수록 관리 방법이 달라질 수 있어요.",
  },
  {
    id: "B5",
    group: "severity",
    weight: 1,
    emoji: "📅",
    text: "여드름이 3개월 이상 지속되고 있나요?",
    note: "만성화 여부를 확인하는 질문이에요.",
  },
  {
    id: "B6",
    group: "severity",
    weight: 1,
    emoji: "🧴",
    text: "시중 세안제나 연고를 써봤지만 호전이 없거나 오히려 심해졌나요?",
    note: "기존 자가관리로 충분한지 판단하는 데 참고해요.",
  },
  {
    id: "B7",
    group: "severity",
    weight: 1,
    emoji: "🩹",
    text: "여드름이 아문 자리에 흉터나 색소침착이 남는 편인가요?",
    note: "조기 개입이 필요한지 확인하는 질문이에요.",
  },
  {
    id: "B8",
    group: "severity",
    weight: 1,
    emoji: "🌿",
    text: "평소 피부가 예민해 화장품이나 자극에 트러블이 잘 나는 편인가요?",
    note: "저자극·저농도 제품부터 시작해야 하는지 참고할 수 있어요.",
  },
];

const GATE_QUESTIONS = QUESTIONS.filter((q) => q.group === "gate");
const SEVERITY_QUESTIONS = QUESTIONS.filter((q) => q.group === "severity");

const DOCTORNOW_URL = "https://doctornow.co.kr/"; // TODO: 실제 서비스 연동 시 진료 신청 딥링크로 교체

const app = document.getElementById("app");

const state = {
  screen: "intro", // intro | question | result
  step: 0,
  answers: {},
  showExitModal: false,
};

function resetState() {
  state.screen = "intro";
  state.step = 0;
  state.answers = {};
  state.showExitModal = false;
}

function computeResult() {
  const gateHit = GATE_QUESTIONS.find((q) => state.answers[q.id] === true);
  if (gateHit) {
    const count = GATE_QUESTIONS.filter((q) => state.answers[q.id] === true).length;
    return { type: "gate", count, total: GATE_QUESTIONS.length };
  }

  let score = 0;
  SEVERITY_QUESTIONS.forEach((q) => {
    if (state.answers[q.id] === true) score += q.weight || 1;
  });
  const yesCount = SEVERITY_QUESTIONS.filter((q) => state.answers[q.id] === true).length;
  const b3 = state.answers["B3"] === true;

  let grade;
  if (score >= 6 || b3) grade = "severe";
  else if (score >= 3) grade = "moderate";
  else grade = "mild";

  return { type: grade, count: yesCount, total: SEVERITY_QUESTIONS.length, score };
}

const RESULT_CONTENT = {
  gate: {
    bannerClass: "grade-gate",
    grade: "확인이 필요해요",
    emoji: "⚠️",
    summary: "바르는 치료제, 사용 전에 확인이 필요해요.",
    tags: ["#확인필요", "#전문의상담"],
    tips: [
      "선택하신 항목은 특정 성분 사용이 제한되거나 신중한 접근이 필요한 경우예요.",
      "자가 처방이나 임의 사용보다는 의료진과의 상담을 통해 안전한 방법을 확인하는 것이 중요해요.",
    ],
    info: "임신·수유 여부, 경구 치료 병행 여부, 알레르기 이력에 따라 사용 가능한 성분과 용법이 달라져요. 진료를 통해 정확히 확인해 보세요.",
    showSymptomChips: false,
  },
  mild: {
    bannerClass: "grade-mild",
    grade: "경증 단계",
    emoji: "🙂",
    summary: "지금은 가벼운 관리 단계로 보여요.",
    tags: ["#경증", "#예방관리"],
    tips: [
      "하루 2회 순한 세안으로 피지와 노폐물을 관리해 주세요.",
      "논코메도제닉(comedogenic-free) 제품으로 모공 막힘을 줄여보세요.",
      "자외선 차단은 트러블 악화와 색소침착 예방에 도움이 돼요.",
    ],
    info: "여드름은 모낭이 피지·각질로 막히면서 시작돼요. 초기 단계에서는 생활 관리만으로도 호전되는 경우가 많아요.",
    showSymptomChips: false,
  },
  moderate: {
    bannerClass: "grade-moderate",
    grade: "중등도 단계",
    emoji: "😐",
    summary: "바르는 치료제로 관리 가능한 단계로 보여요.",
    tags: ["#중등도", "#바르는치료제"],
    tips: [
      "처방 외용제는 꾸준히, 정해진 용법대로 사용하는 것이 효과에 가장 중요해요.",
      "초반에는 피부 자극(건조함, 붉어짐)이 있을 수 있어요. 보습을 함께 병행해 주세요.",
      "4~8주 정도는 꾸준히 사용해야 변화를 체감할 수 있어요.",
    ],
    info: "염증성 여드름은 방치하면 흉터로 이어질 수 있어 적절한 시점의 치료가 중요해요.",
    showSymptomChips: true,
  },
  severe: {
    bannerClass: "grade-severe",
    grade: "중증 단계",
    emoji: "😖",
    summary: "바르는 치료만으로는 한계가 있을 수 있어요.",
    tags: ["#중증", "#병행치료 필요"],
    tips: [
      "결절·낭종성 여드름은 흉터로 이어지기 쉬워 빠른 진료가 도움이 돼요.",
      "외용제만으로 충분하지 않다면 경구 치료 병행을 고려할 수 있어요.",
      "임의로 짜거나 압출하면 염증과 흉터가 악화될 수 있어 피해주세요.",
    ],
    info: "중증 여드름은 대면 진료를 통한 정확한 진단과 치료 계획 수립이 특히 중요해요.",
    showSymptomChips: true,
  },
};

function render() {
  if (state.screen === "intro") return renderIntro();
  if (state.screen === "question") return renderQuestion();
  if (state.screen === "result") return renderResult();
}

function renderIntro() {
  app.innerHTML = `
    <div class="header">닥터나우 여드름 치료제 셀프 테스트</div>
    <div class="intro-headline">내 여드름,<br />바르는 치료제로 좋아질까요? 🧴</div>
    <div class="intro-desc">여드름은 종류와 정도에 따라 맞는 관리법이 달라요.</div>
    <div class="intro-desc">${QUESTIONS.length}가지 질문으로 바르는 치료제가 나에게 맞는지 확인해 보세요.</div>
    <div class="disclaimer-box">본 테스트는 의학적 진단이 아닌 자가 확인용이에요. 정확한 진단은 피부과 전문의 진료로 이루어집니다.</div>
    <div class="spacer"></div>
    <button class="btn btn-primary" id="start-btn">시작하기</button>
  `;
  document.getElementById("start-btn").addEventListener("click", () => {
    state.screen = "question";
    state.step = 0;
    render();
  });
}

function renderQuestion() {
  const q = QUESTIONS[state.step];
  const progress = Math.round(((state.step + 1) / QUESTIONS.length) * 100);

  app.innerHTML = `
    <div class="header">
      <button class="back" id="back-btn" aria-label="뒤로가기">‹</button>
      <span>닥터나우 여드름 치료제 셀프 테스트</span>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
    <div class="q-label">질문 ${state.step + 1} / ${QUESTIONS.length}</div>
    <div class="q-title">${q.text} ${q.emoji}</div>
    <div class="q-note">${q.note}</div>
    <div class="spacer"></div>
    <div class="btn-row">
      <button class="btn btn-primary" data-value="true">네</button>
      <button class="btn btn-secondary" data-value="false">아니오</button>
    </div>
    ${state.showExitModal ? renderExitModal() : ""}
  `;

  app.querySelectorAll(".btn-row [data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.answers[q.id] = btn.dataset.value === "true";
      if (state.step + 1 < QUESTIONS.length) {
        state.step += 1;
      } else {
        state.screen = "result";
      }
      render();
    });
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    state.showExitModal = true;
    render();
  });

  if (state.showExitModal) {
    document.getElementById("modal-close").addEventListener("click", () => {
      state.showExitModal = false;
      render();
    });
    document.getElementById("modal-restart").addEventListener("click", () => {
      resetState();
      render();
    });
  }
}

function renderExitModal() {
  return `
    <div class="modal-overlay">
      <div class="modal-box">
        <div class="m-title">테스트를 처음부터 다시 할까요?</div>
        <div class="m-desc">지금 나가면 테스트 결과가 사라져요</div>
        <div class="btn-row">
          <button class="btn btn-ghost" id="modal-close">닫기</button>
          <button class="btn btn-primary" id="modal-restart">테스트 다시하기</button>
        </div>
      </div>
    </div>
  `;
}

function renderResult() {
  const result = computeResult();
  const content = RESULT_CONTENT[result.type];

  const selectedSymptomChips = SEVERITY_QUESTIONS.filter((q) => state.answers[q.id] === true)
    .map((q) => `<span class="chip">#${q.text.length > 14 ? q.text.slice(0, 14) + "…" : q.text}</span>`)
    .join("");

  app.innerHTML = `
    <div class="header">닥터나우 여드름 치료제 셀프 테스트 결과</div>
    <div class="result-banner ${content.bannerClass}">
      <div class="r-title">여드름 치료제 셀프 테스트 결과</div>
      <div class="r-count">해당 항목 ${result.count}개 / ${result.total}개</div>
      <div class="r-grade">${content.grade}</div>
      <div class="r-emoji">${content.emoji}</div>
      <div class="r-summary">${content.summary}</div>
      <div class="r-tags">${content.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    </div>

    <div class="card">
      <h3>💡 이렇게 해보세요</h3>
      ${content.tips.map((t) => `<p>${t}</p>`).join("")}
    </div>

    <div class="card">
      <h3>🔍 여드름이란?</h3>
      <div class="info-box"><p>${content.info}</p></div>
    </div>

    ${
      content.showSymptomChips && selectedSymptomChips
        ? `<div class="card"><h3>✅ 내가 선택한 증상</h3><div class="chip-row">${selectedSymptomChips}</div></div>`
        : ""
    }

    <div class="cta-stack">
      <a class="btn btn-primary" href="${DOCTORNOW_URL}" target="_blank" rel="noopener" style="text-decoration:none;display:flex;align-items:center;justify-content:center;">닥터나우에서 진료받기</a>
      <button class="btn btn-ghost" id="copy-btn">증상 텍스트 복사</button>
      <button class="btn btn-ghost" id="share-btn">친구에게 공유</button>
      <button class="btn btn-ghost" id="restart-btn">↻ 다시 테스트 하기</button>
    </div>

    <div class="footer-note">
      본 결과는 의학적 진단이 아니며 참고용으로만 활용해 주세요.<br />
      정확한 진단은 피부과 전문의와 상담하시기 바랍니다.
      <div class="source">출처: (의료 자문 검수 후 추가 예정)</div>
    </div>

    <div class="toast" id="toast"></div>
  `;

  document.getElementById("copy-btn").addEventListener("click", async () => {
    const lines = SEVERITY_QUESTIONS.filter((q) => state.answers[q.id] === true).map((q) => `- ${q.text}`);
    const text = `[여드름 치료제 셀프 테스트 결과]\n${content.grade} (해당 항목 ${result.count}/${result.total})\n${lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("증상 내용이 복사되었어요");
    } catch (e) {
      showToast("복사에 실패했어요. 브라우저 권한을 확인해 주세요");
    }
  });

  document.getElementById("share-btn").addEventListener("click", async () => {
    const shareData = {
      title: "여드름 치료제 셀프 테스트 · 닥터나우",
      text: `내 여드름 셀프 테스트 결과: ${content.grade}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        /* 사용자가 취소한 경우 등은 무시 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("링크가 복사되었어요");
      } catch (e) {
        showToast("공유에 실패했어요");
      }
    }
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    resetState();
    render();
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

render();
