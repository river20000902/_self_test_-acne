/*
 * 내 여드름은 무슨 유형? · 닥터나우 (프로토타입)
 *
 * DRAFT NOTICE:
 * 문항 구성 / 유형 매핑 / 판정 로직은 UX 설계를 위한 초안입니다.
 * 실제 서비스 반영 전 반드시 원내 자문 전문의 및 법무/의료광고 검토를 거쳐야 합니다.
 *
 * 로직 개요:
 * - 10문항 모두 예/아니오로만 답변
 * - 각 문항은 4개 유형(A~D) 중 하나에 매핑되어 있고, "네"로 답하면 해당 유형 점수 +1
 * - 가장 점수가 높은 유형이 결과. 동점일 경우 C(SOS형) > D(만성 트러블형) > B(호르몬형) > A(지성형) 순으로 우선
 *   (애매한 경우 안전하게 진료를 더 권하는 방향으로 우선순위를 뒀습니다)
 * - 전부 "아니오"면 기본값은 A(타고난 지성형)
 */

const QUESTIONS = [
  {
    id: "A1",
    type: "A",
    emoji: "✨",
    text: "T존(이마·코)이 하루에도 여러 번 번들거리나요?",
    note: "피지 분비가 많은 지성 피부의 대표적인 신호예요.",
  },
  {
    id: "A2",
    type: "A",
    emoji: "⚪",
    text: "블랙헤드나 화이트헤드 같은 좁쌀 여드름이 잘 올라오나요?",
    note: "모공이 피지로 막히기 쉬운 지성형에서 흔히 나타나요.",
  },
  {
    id: "B1",
    type: "B",
    emoji: "🌙",
    text: "생리 주기나 특정 시기에 맞춰 트러블이 심해지나요?",
    note: "호르몬 변화에 민감하게 반응하는 타입일 수 있어요.",
  },
  {
    id: "B2",
    type: "B",
    emoji: "😥",
    text: "스트레스를 받거나 컨디션이 안 좋을 때 트러블이 올라오나요?",
    note: "컨디션에 따라 피부가 예민해지는 신호예요.",
  },
  {
    id: "C1",
    type: "C",
    emoji: "⚡",
    text: "평소와 다르게 최근 갑자기 여드름이 심해졌나요?",
    note: "평소 패턴과 다른 급격한 변화는 주의 깊게 볼 필요가 있어요.",
  },
  {
    id: "C2",
    type: "C",
    emoji: "🤕",
    text: "손대면 아픈가요?",
    note: "통증이 있는 여드름은 염증이 진행 중일 가능성이 높아요.",
  },
  {
    id: "C3",
    type: "C",
    emoji: "🔴",
    text: "크고 단단하며 곪아있는 여드름이 있나요?",
    note: "염증성 여드름이 심한 상태일 수 있어요.",
  },
  {
    id: "D1",
    type: "D",
    emoji: "📅",
    text: "여드름이 3개월 이상 지속되고 있나요?",
    note: "만성화 여부를 확인하는 질문이에요.",
  },
  {
    id: "D2",
    type: "D",
    emoji: "🔁",
    text: "이것저것 방법을 써봤지만 좋아졌다 나빠지기를 반복하나요?",
    note: "자가관리만으로는 한계가 있을 수 있어요.",
  },
  {
    id: "D3",
    type: "D",
    emoji: "🩹",
    text: "여드름이 난 자리에 흉터나 색소침착이 잘 남는 편인가요?",
    note: "조기 개입이 필요한지 확인하는 질문이에요.",
  },
];

const TYPE_ORDER = ["A", "B", "C", "D"];
const TIE_BREAK_PRIORITY = ["C", "D", "B", "A"];

const DOCTORNOW_URL = "https://doctornow.co.kr/"; // TODO: 실제 서비스 연동 시 진료 신청 딥링크로 교체

const app = document.getElementById("app");

const state = {
  screen: "intro", // intro | question | result
  step: 0,
  answers: {}, // questionId -> boolean
  showExitModal: false,
};

function resetState() {
  state.screen = "intro";
  state.step = 0;
  state.answers = {};
  state.showExitModal = false;
}

function computeResult() {
  const scoreByType = { A: 0, B: 0, C: 0, D: 0 };
  const totalByType = { A: 0, B: 0, C: 0, D: 0 };

  QUESTIONS.forEach((q) => {
    totalByType[q.type] += 1;
    if (state.answers[q.id] === true) scoreByType[q.type] += 1;
  });

  const maxScore = Math.max(...TYPE_ORDER.map((t) => scoreByType[t]));

  let winner;
  if (maxScore === 0) {
    winner = "A";
  } else {
    winner = TIE_BREAK_PRIORITY.find((t) => scoreByType[t] === maxScore);
  }

  return {
    type: winner,
    count: scoreByType[winner],
    total: totalByType[winner],
  };
}

const TYPE_CONTENT = {
  A: {
    bannerClass: "type-a",
    title: "타고난 지성형",
    emoji: "💧",
    summary: "타고난 지성형이에요. 꾸준한 케어로 피부를 관리해요.",
    tags: ["#지성형", "#꾸준한케어"],
    tips: [
      "유분 조절에 도움되는 순한 클렌징과 가벼운 보습으로 밸런스를 맞춰보세요.",
      "피지가 많다고 보습을 건너뛰면 오히려 트러블이 심해질 수 있어요.",
      "논코메도제닉(comedogenic-free) 제품으로 모공 막힘을 줄여보세요.",
    ],
    info: "타고난 지성 피부는 피지 분비가 활발해 여드름이 잘 나는 편이지만, 꾸준한 관리로 충분히 안정시킬 수 있어요.",
    recommendation: "care",
    ctaText: "피부 관리 콘텐츠 보러가기",
  },
  B: {
    bannerClass: "type-b",
    title: "예민 호르몬형",
    emoji: "🌙",
    summary: "예민 호르몬형이에요. 꾸준한 케어로 피부를 관리해요.",
    tags: ["#호르몬형", "#꾸준한케어"],
    tips: [
      "트러블이 심해지는 시기를 기록해두면 패턴을 파악하는 데 도움이 돼요.",
      "이 시기에는 자극적인 제품보다 순한 케어로 피부를 안정시켜 주세요.",
      "충분한 수면과 스트레스 관리도 피부 컨디션에 영향을 줘요.",
    ],
    info: "호르몬이나 컨디션 변화에 따라 트러블이 오르내리는 타입이에요. 원인을 파악하고 꾸준히 관리하면 충분히 안정시킬 수 있어요.",
    recommendation: "care",
    ctaText: "피부 관리 콘텐츠 보러가기",
  },
  C: {
    bannerClass: "type-c",
    title: "SOS형",
    emoji: "🚨",
    summary: "SOS형이에요. 피부과 비대면 진료를 통해 정확한 진단을 받아보세요.",
    tags: ["#SOS형", "#빠른진료"],
    tips: [
      "임의로 짜거나 압출하면 염증과 흉터가 악화될 수 있어 피해주세요.",
      "갑자기 심해진 원인(화장품 교체, 야식, 스트레스 등)을 진료 시 함께 이야기해보세요.",
      "빠르게 대응할수록 흉터로 남을 위험을 줄일 수 있어요.",
    ],
    info: "평소와 다르게 갑자기 심해진 상태예요. 방치하면 흉터로 남을 수 있어 빠른 확인이 필요해요.",
    recommendation: "clinic",
    ctaText: "닥터나우에서 진료받기",
  },
  D: {
    bannerClass: "type-d",
    title: "만성 트러블형",
    emoji: "🔁",
    summary: "만성 트러블형이에요. 피부과 비대면 진료를 통해 정확한 진단을 받아보세요.",
    tags: ["#만성트러블형", "#진료권장"],
    tips: [
      "오래 반복된 트러블은 자가관리만으로 원인을 찾기 어려운 경우가 많아요.",
      "지금까지 써본 제품과 방법을 정리해두면 진료 시 도움이 돼요.",
      "흉터나 색소침착이 남기 전에 확인해보는 게 좋아요.",
    ],
    info: "오랫동안 좋아지고 나빠지기를 반복해온 타입이에요. 자가관리만으로는 근본 원인을 찾기 어려울 수 있어요.",
    recommendation: "clinic",
    ctaText: "닥터나우에서 진료받기",
  },
};

function render() {
  if (state.screen === "intro") return renderIntro();
  if (state.screen === "question") return renderQuestion();
  if (state.screen === "result") return renderResult();
}

function renderIntro() {
  app.innerHTML = `
    <div class="header">닥터나우 여드름 유형 테스트</div>
    <div class="intro-headline">내 여드름은<br />무슨 유형? 🔍</div>
    <div class="intro-desc">단순 유형 테스트, 유형에 따라 피부과 진료를 권해드려요.</div>
    <div class="intro-desc">${QUESTIONS.length}가지 질문(예/아니오)으로 내 여드름 유형을 확인해 보세요.</div>
    <div class="disclaimer-box">본 테스트는 의학적 진단이 아닌 유형 확인용이에요. 정확한 진단은 피부과 전문의 진료로 이루어집니다.</div>
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
      <span>닥터나우 여드름 유형 테스트</span>
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
  const content = TYPE_CONTENT[result.type];
  const winningQuestions = QUESTIONS.filter((q) => q.type === result.type && state.answers[q.id] === true);

  const matchedChips = winningQuestions
    .map((q) => `<span class="chip">#${q.text.length > 16 ? q.text.slice(0, 16) + "…" : q.text}</span>`)
    .join("");

  app.innerHTML = `
    <div class="header">닥터나우 여드름 유형 테스트 결과</div>
    <div class="result-banner ${content.bannerClass}">
      <div class="r-title">여드름 유형 테스트 결과</div>
      <div class="r-count">${content.title} 신호 ${result.count}개 / ${result.total}개 감지</div>
      <div class="r-grade">${content.title}</div>
      <div class="r-emoji">${content.emoji}</div>
      <div class="r-summary">${content.summary}</div>
      <div class="r-tags">${content.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    </div>

    <div class="card">
      <h3>💡 이렇게 해보세요</h3>
      ${content.tips.map((t) => `<p>${t}</p>`).join("")}
    </div>

    <div class="card">
      <h3>🔍 이 유형은?</h3>
      <div class="info-box"><p>${content.info}</p></div>
    </div>

    ${
      matchedChips
        ? `<div class="card"><h3>✅ 이런 답변에서 감지됐어요</h3><div class="chip-row">${matchedChips}</div></div>`
        : ""
    }

    <div class="cta-stack">
      <a class="btn btn-primary" href="${DOCTORNOW_URL}" target="_blank" rel="noopener" style="text-decoration:none;display:flex;align-items:center;justify-content:center;">${content.ctaText}</a>
      <button class="btn btn-ghost" id="copy-btn">결과 텍스트 복사</button>
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
    const text = `[여드름 유형 테스트 결과]\n나는 ${content.title}! (${content.title} 신호 ${result.count}/${result.total}개 감지)\n${content.summary}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("결과가 복사되었어요");
    } catch (e) {
      showToast("복사에 실패했어요. 브라우저 권한을 확인해 주세요");
    }
  });

  document.getElementById("share-btn").addEventListener("click", async () => {
    const shareData = {
      title: "내 여드름은 무슨 유형? · 닥터나우",
      text: `내 여드름 유형 테스트 결과: ${content.title}`,
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
