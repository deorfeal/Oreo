// ==========================================
// AOS
// ==========================================

const aosReplayTokens = new WeakMap();

function initAos() {
  AOS.init({
    duration: 750,
    offset: 0,
    anchorPlacement: "top-bottom",
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAos, { once: true });
} else {
  initAos();
}

function collectAosElements(scopes) {
  const elements = [];

  scopes.forEach((scope) => {
    if (!scope) return;

    if (scope.hasAttribute("data-aos") && !elements.includes(scope)) {
      elements.push(scope);
    }

    scope.querySelectorAll("[data-aos]").forEach((element) => {
      if (!elements.includes(element)) {
        elements.push(element);
      }
    });
  });

  return elements;
}

function replayAosElements(scopes, options = {}) {
  const skipDelay = Boolean(options.skipDelay);
  const elements = collectAosElements(scopes);

  if (!elements.length) return;

  const tokens = elements.map((element) => {
    const token = (aosReplayTokens.get(element) || 0) + 1;

    aosReplayTokens.set(element, token);

    return token;
  });

  if (window.AOS) {
    window.AOS.refreshHard();
  }

  elements.forEach((element) => {
    element.style.transition = "none";
    element.classList.remove("aos-animate");
  });

  void document.body.offsetHeight;

  elements.forEach((element) => {
    element.style.transition = "";
    element.style.transitionDelay = skipDelay ? "0s" : "";
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elements.forEach((element, index) => {
        if (aosReplayTokens.get(element) === tokens[index]) {
          element.classList.add("aos-animate");
        }
      });
    });
  });
}

// ==========================================
// LANGS
// ==========================================

document.querySelectorAll(".langs").forEach((langs) => {
  const langsList = langs.querySelector(".langs__list");

  if (!langsList) return;

  const items = Array.from(langsList.querySelectorAll(".langs__item"));

  if (!items.length) return;

  const langsBody = langs.querySelector(".langs__body") || langs;

  let highlight = langs.querySelector(".langs__highlight");

  if (!highlight) {
    highlight = document.createElement("div");
    highlight.classList.add("langs__highlight");
  }

  if (highlight.parentElement !== langsBody) {
    langsBody.appendChild(highlight);
  }

  let activeItem = langsList.querySelector(".langs__item--active") || items[0];

  const setActive = (target) => {
    items.forEach((item) => {
      item.classList.remove("langs__item--active");
    });

    target.classList.add("langs__item--active");
  };

  const moveHighlight = (target) => {
    const container = highlight.offsetParent || langsBody;
    const rect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = rect.left - containerRect.left - container.clientLeft;

    highlight.style.transform = `translate(${left}px, -50%)`;
  };

  setActive(activeItem);
  moveHighlight(activeItem);

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      setActive(item);
      moveHighlight(item);
    });

    item.addEventListener("click", () => {
      activeItem = item;
    });
  });

  langsList.addEventListener("mouseleave", () => {
    setActive(activeItem);
    moveHighlight(activeItem);
  });

  window.addEventListener("resize", () => {
    moveHighlight(activeItem);
  });
});

// ==========================================
// HOME VIDEO
// ==========================================

const mainVideo = document.querySelector(".home__video--main");
const loopVideo = document.querySelector(".home__video--loop");

if (mainVideo && loopVideo) {
  mainVideo.addEventListener("ended", async () => {
    loopVideo.currentTime = 0;

    try {
      await loopVideo.play();

      loopVideo.classList.add("is-active");
    } catch (error) {
      console.error("Loop video couldn't start:", error);
    }
  });
}

const homeSection = document.querySelector(".home");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (homeSection && loopVideo && !prefersReducedMotion) {
  const maxVideoOffset = 16;
  const videoEasing = 0.08;

  let targetVideoX = 0;
  let targetVideoY = 0;

  let currentVideoX = 0;
  let currentVideoY = 0;

  let videoFrame = null;

  const renderVideoParallax = () => {
    currentVideoX += (targetVideoX - currentVideoX) * videoEasing;
    currentVideoY += (targetVideoY - currentVideoY) * videoEasing;

    loopVideo.style.transform =
      "translate3d(" +
      currentVideoX.toFixed(2) +
      "px, " +
      currentVideoY.toFixed(2) +
      "px, 0) scale(1.06)";

    if (
      Math.abs(targetVideoX - currentVideoX) > 0.05 ||
      Math.abs(targetVideoY - currentVideoY) > 0.05
    ) {
      videoFrame = requestAnimationFrame(renderVideoParallax);
    } else {
      currentVideoX = targetVideoX;
      currentVideoY = targetVideoY;

      videoFrame = null;
    }
  };

  const requestVideoRender = () => {
    if (!videoFrame) {
      videoFrame = requestAnimationFrame(renderVideoParallax);
    }
  };

  homeSection.addEventListener("pointermove", (event) => {
    const rect = homeSection.getBoundingClientRect();

    const pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    const pointerY = (event.clientY - rect.top) / rect.height - 0.5;

    targetVideoX = pointerX * maxVideoOffset * 2;
    targetVideoY = pointerY * maxVideoOffset * 2;

    requestVideoRender();
  });

  homeSection.addEventListener("pointerleave", () => {
    targetVideoX = 0;
    targetVideoY = 0;

    requestVideoRender();
  });
}

// ==========================================
// PAGE BG PARALLAX
// ==========================================

const pageBgImage = document.querySelector(".page-bg img");

if (pageBgImage && !prefersReducedMotion) {
  const maxBgOffset = 16;
  const bgEasing = 0.08;
  const bgScale = 1.06;

  let targetBgX = 0;
  let targetBgY = 0;

  let currentBgX = 0;
  let currentBgY = 0;

  let bgFrame = null;

  const renderBgParallax = () => {
    currentBgX += (targetBgX - currentBgX) * bgEasing;
    currentBgY += (targetBgY - currentBgY) * bgEasing;

    pageBgImage.style.transform =
      "translate3d(" +
      currentBgX.toFixed(2) +
      "px, " +
      currentBgY.toFixed(2) +
      "px, 0) scale(" +
      bgScale +
      ")";

    if (
      Math.abs(targetBgX - currentBgX) > 0.05 ||
      Math.abs(targetBgY - currentBgY) > 0.05
    ) {
      bgFrame = requestAnimationFrame(renderBgParallax);
    } else {
      currentBgX = targetBgX;
      currentBgY = targetBgY;

      bgFrame = null;
    }
  };

  const requestBgRender = () => {
    if (!bgFrame) {
      bgFrame = requestAnimationFrame(renderBgParallax);
    }
  };

  document.addEventListener("pointermove", (event) => {
    const pointerX = event.clientX / window.innerWidth - 0.5;
    const pointerY = event.clientY / window.innerHeight - 0.5;

    targetBgX = pointerX * maxBgOffset * 2;
    targetBgY = pointerY * maxBgOffset * 2;

    requestBgRender();
  });

  document.documentElement.addEventListener("pointerleave", () => {
    targetBgX = 0;
    targetBgY = 0;

    requestBgRender();
  });
}

// ==========================================
// CARD TILT
// ==========================================

const cardTiltTarget = document.querySelector(".cards");

if (cardTiltTarget && !prefersReducedMotion) {
  const maxTilt = 20;
  const tiltEasing = 0.08;
  const tiltPerspective = 1000;
  const tiltDirection = 1;

  let targetTiltX = 0;
  let targetTiltY = 0;

  let currentTiltX = 0;
  let currentTiltY = 0;

  let tiltFrame = null;

  cardTiltTarget.style.willChange = "transform";

  const renderCardTilt = () => {
    currentTiltX += (targetTiltX - currentTiltX) * tiltEasing;
    currentTiltY += (targetTiltY - currentTiltY) * tiltEasing;

    cardTiltTarget.style.transform =
      "perspective(" +
      tiltPerspective +
      "px) rotateX(" +
      currentTiltX.toFixed(2) +
      "deg) rotateY(" +
      currentTiltY.toFixed(2) +
      "deg)";

    if (
      Math.abs(targetTiltX - currentTiltX) > 0.01 ||
      Math.abs(targetTiltY - currentTiltY) > 0.01
    ) {
      tiltFrame = requestAnimationFrame(renderCardTilt);
    } else {
      currentTiltX = targetTiltX;
      currentTiltY = targetTiltY;

      tiltFrame = null;
    }
  };

  const requestCardTilt = () => {
    if (!tiltFrame) {
      tiltFrame = requestAnimationFrame(renderCardTilt);
    }
  };

  document.addEventListener("pointermove", (event) => {
    const pointerX = event.clientX / window.innerWidth - 0.5;
    const pointerY = event.clientY / window.innerHeight - 0.5;

    targetTiltY = pointerX * maxTilt * 2 * tiltDirection;
    targetTiltX = -pointerY * maxTilt * 2 * tiltDirection;

    requestCardTilt();
  });

  document.documentElement.addEventListener("pointerleave", () => {
    targetTiltX = 0;
    targetTiltY = 0;

    requestCardTilt();
  });
}

// ==========================================
// SCREENS
// ==========================================

const screens = Array.from(document.querySelectorAll("[data-screen]"));

if (screens.length) {
  const screenTransitionDuration = 700;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let activeScreen =
    screens.find((screen) => screen.classList.contains("screen--active")) ||
    screens[0];
  let transitionTimer;

  const languageControl = document.querySelector(".main__langs");
  const burgerControl = document.querySelector(".header__burger");
  const addLetterControl = document.querySelector(".header__wrp");
  const playerControl = document.querySelector(".main__player .player");
  const mobileLayoutQuery = window.matchMedia("(max-width: 1200px)");

  const syncPageScroll = () => {
    document.documentElement.classList.add("screen-scroll-locked");
  };

  const syncScreenChrome = (screen) => {
    const screenName = screen.dataset.screen;
    const isHomeScreen = screenName === "home";
    const isRequestScreen = screenName === "request";
    const isLettersScreen = screenName === "letters";
    const isMobileLayout = mobileLayoutQuery.matches;
    const shouldHidePlayer =
      !isMobileLayout &&
      ["request", "success", "letters", "global"].includes(screenName);

    if (languageControl) {
      languageControl.classList.toggle("langs--hidden", !isHomeScreen);
    }

    if (burgerControl) {
      burgerControl.classList.toggle(
        "header__burger--hidden",
        isRequestScreen && !isMobileLayout,
      );
    }

    if (addLetterControl) {
      addLetterControl.classList.toggle(
        "header__wrp--visible",
        isLettersScreen,
      );
    }

    if (playerControl) {
      playerControl.classList.toggle("player--hidden", shouldHidePlayer);
    }
  };

  const notifyScreenShown = (screen) => {
    document.dispatchEvent(
      new CustomEvent("screen:shown", {
        detail: { screen: screen.dataset.screen },
      }),
    );
  };

  const cleanInactiveScreens = () => {
    screens.forEach((screen) => {
      if (screen === activeScreen) return;

      screen.classList.remove("screen--active", "screen--leaving");
      screen.setAttribute("aria-hidden", "true");
    });
  };

  const showScreen = (screenName) => {
    const nextScreen = screens.find(
      (screen) => screen.dataset.screen === screenName,
    );

    if (!nextScreen || nextScreen === activeScreen) return;

    clearTimeout(transitionTimer);
    window.scrollTo(0, 0);

    const previousScreen = activeScreen;
    const isHomeToStart =
      previousScreen.dataset.screen === "home" &&
      nextScreen.dataset.screen === "start";

    activeScreen = nextScreen;

    if (
      nextScreen.dataset.screen === "start" &&
      typeof window.resetConfigurator === "function"
    ) {
      window.resetConfigurator();
    }

    nextScreen.scrollTop = 0;
    syncPageScroll();
    syncScreenChrome(nextScreen);

    if (isHomeToStart) {
      previousScreen.classList.add("screen--leaving");
      previousScreen.setAttribute("aria-hidden", "true");

      transitionTimer = window.setTimeout(
        () => {
          cleanInactiveScreens();
          nextScreen.classList.add("screen--active");
          nextScreen.classList.remove("screen--leaving");
          nextScreen.setAttribute("aria-hidden", "false");
          replayAosElements([nextScreen]);
          notifyScreenShown(nextScreen);
        },
        reducedMotion ? 0 : screenTransitionDuration,
      );

      return;
    }

    nextScreen.classList.add("screen--active");
    nextScreen.classList.remove("screen--leaving");
    nextScreen.setAttribute("aria-hidden", "false");
    previousScreen.classList.add("screen--leaving");

    replayAosElements([nextScreen], {
      skipDelay: nextScreen.dataset.screen === "home",
    });
    notifyScreenShown(nextScreen);

    transitionTimer = window.setTimeout(
      cleanInactiveScreens,
      reducedMotion ? 0 : screenTransitionDuration,
    );
  };

  window.showScreen = showScreen;

  syncPageScroll();
  syncScreenChrome(activeScreen);

  mobileLayoutQuery.addEventListener("change", () => {
    syncScreenChrome(activeScreen);
  });

  document.querySelectorAll("[data-screen-target]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      showScreen(trigger.dataset.screenTarget);
    });
  });
}

// ==========================================
// LETTERS GALLERY
// ==========================================

const lettersScreen = document.querySelector(".letters[data-screen='letters']");

if (lettersScreen) {
  const lettersViewport = lettersScreen.querySelector(
    "[data-letters-viewport]",
  );

  const lettersCanvas = lettersScreen.querySelector("[data-letters-canvas]");

  const lettersBody = lettersScreen.querySelector(".letters__body");

  const findOwnLetterButton = lettersScreen.querySelector(
    "[data-find-own-letter]",
  );

  const lettersModal = lettersScreen.querySelector("[data-letters-modal]");

  const modalCard = lettersScreen.querySelector("[data-letter-modal-card]");

  const modalImage = lettersScreen.querySelector("[data-letter-modal-image]");

  const modalText = lettersScreen.querySelector("[data-letter-modal-text]");

  const modalCountry = lettersScreen.querySelector(
    "[data-letter-modal-country]",
  );

  const closeLetterButtons = lettersScreen.querySelectorAll(
    "[data-close-letter]",
  );

  const previousLetterButton =
    lettersScreen.querySelector("[data-letter-prev]");

  const nextLetterButton = lettersScreen.querySelector("[data-letter-next]");

  const lettersBurger = document.querySelector(".header__burger");

  const letters = [
    {
      id: "mine",
      text: "Моё письмо для BTS",
      country: "С наилучшими пожеланиями от Казахстана",
      image: "images/card-img-1.png",
      x: 1200,
      y: 760,
      own: true,
    },
    {
      id: "violet-heart",
      text: "BTS, моё сердце на всегда с вами!",
      country: "С наилучшими пожеланиями от Южной Кореи",
      image: "images/card-img-2.jpg",
      x: 700,
      y: 310,
    },
    {
      id: "oreo-world",
      text: "Ещё ни одна коллаборация с печеньем не сделала меня счастливым!",
      country: "С наилучшими пожеланиями от Казахстана",
      image: "images/card-img-1.png",
      x: 300,
      y: 600,
    },
    {
      id: "purple-dream",
      text: "BTS, вы лучшее, что когда-либо было в моей жизни!",
      country: "С наилучшими пожеланиями от Узбекистана",
      image: "images/card-img-2.jpg",
      x: 700,
      y: 1100,
    },
    {
      id: "blue-love",
      text: "Я люблю вас, BTS! Вы изменили мою жизнь!",
      country: "С наилучшими пожеланиями от России",
      image: "images/card-img-1.png",
      x: 1700,
      y: 650,
    },
    {
      id: "forever",
      text: "BTS на упаковке печенья OREO — самый целый мир!",
      country: "С наилучшими пожеланиями от Казахстана",
      image: "images/card-img-3.jpg",
      x: 1150,
      y: 180,
    },
    {
      id: "music",
      text: "BTS для меня — всё!",
      country: "С наилучшими пожеланиями от России",
      image: "images/card-img-1.png",
      x: 1200,
      y: 1140,
    },
    {
      id: "purple-oreo",
      text: "Я пришёл за OREO, а остался ради BTS!",
      country: "С наилучшими пожеланиями от Узбекистана",
      image: "images/card-img-2.jpg",
      x: 1650,
      y: 1100,
    },
    {
      id: "first-look",
      text: "BTS OREO покорили меня с первого взгляда",
      country: "С наилучшими пожеланиями от Казахстана",
      image: "images/card-img-3.jpg",
      x: 2050,
      y: 200,
    },
    {
      id: "thank-you",
      text: "Спасибо, что всегда рядом. BTS, вы невероятные!",
      country: "С наилучшими пожеланиями от Южной Кореи",
      image: "images/card-img-3.jpg",
      x: 2100,
      y: 1000,
    },
    {
      id: "blue-sky",
      text: "Ваши песни делают каждый день ярче!",
      country: "С наилучшими пожеланиями от Казахстана",
      image: "images/card-img-1.png",
      x: 250,
      y: 200,
    },
    {
      id: "army-heart",
      text: "С BTS в сердце — всегда вместе",
      country: "С наилучшими пожеланиями от России",
      image: "images/card-img-2.jpg",
      x: 800,
      y: 570,
    },
    {
      id: "oreo-smile",
      text: "OREO и BTS — мой любимый вкус счастья",
      country: "С наилучшими пожеланиями от Узбекистана",
      image: "images/card-img-3.jpg",
      x: 1600,
      y: 300,
    },
    {
      id: "together",
      text: "Спасибо BTS за музыку, которая объединяет",
      country: "С наилучшими пожеланиями от Южной Кореи",
      image: "images/card-img-1.png",
      x: 2120,
      y: 600,
    },
    {
      id: "purple-love",
      text: "Вы дарите мне силы улыбаться каждый день",
      country: "С наилучшими пожеланиями от Казахстана",
      image: "images/card-img-2.jpg",
      x: 250,
      y: 1040,
    },
    {
      id: "cookie-dream",
      text: "Мечтаю однажды сказать вам спасибо лично",
      country: "С наилучшими пожеланиями от России",
      image: "images/card-img-3.jpg",
      x: 700,
      y: 1430,
    },
    {
      id: "bright-day",
      text: "BTS, вы делаете этот мир добрее",
      country: "С наилучшими пожеланиями от Узбекистана",
      image: "images/card-img-1.png",
      x: 1400,
      y: 1390,
    },
    {
      id: "army-family",
      text: "Наша любовь к BTS не знает границ",
      country: "С наилучшими пожеланиями от Южной Кореи",
      image: "images/card-img-2.jpg",
      x: 2100,
      y: 1400,
    },
  ];

  const letterById = new Map(letters.map((letter) => [letter.id, letter]));

  const cardById = new Map();

  let galleryCentered = false;

  let openedLetterId = null;

  let galleryBodyRestoreTimer = null;

  let findOwnLetterTimer = null;

  const updateLettersBodyCoverage = () => {
    if (!lettersBody) {
      return;
    }

    const bodyRect = lettersBody.getBoundingClientRect();
    const safeArea = 14;

    cardById.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const overlapsBody =
        cardRect.right > bodyRect.left + safeArea &&
        cardRect.left < bodyRect.right - safeArea &&
        cardRect.bottom > bodyRect.top + safeArea &&
        cardRect.top < bodyRect.bottom - safeArea;

      card.classList.toggle("letter-card--under-body", overlapsBody);
    });
  };

  const setGalleryBrowsing = (isBrowsing) => {
    lettersScreen.classList.toggle("letters--is-browsing", isBrowsing);

    if (!isBrowsing) {
      requestAnimationFrame(updateLettersBodyCoverage);
    }
  };

  const restoreLettersBody = () => {
    window.clearTimeout(galleryBodyRestoreTimer);
    galleryBodyRestoreTimer = window.setTimeout(() => {
      setGalleryBrowsing(false);
    }, 140);
  };

  // ========================================
  // CREATE CARD
  // ========================================

  const createLetterCard = (letter) => {
    const card = document.createElement("button");
    const image = document.createElement("img");
    const logo = document.createElement("img");
    const sticker = document.createElement("img");
    const text = document.createElement("span");
    const country = document.createElement("span");

    card.type = "button";

    card.className = "letters__card letter-card";

    card.dataset.letterCard = letter.id;

    card.setAttribute("aria-label", "Открыть письмо: " + letter.text);

    if (letter.own) {
      card.classList.add("letter-card--own");
    }

    card.style.setProperty("--letter-x", letter.x + "rem");

    card.style.setProperty("--letter-y", letter.y + "rem");

    image.className = "letter-card__image";

    logo.className = "letter-card__logo";

    sticker.className = "letter-card__sticker";

    text.className = "letter-card__text";

    country.className = "letter-card__country";

    logo.src = "images/card-logo.png";

    logo.alt = "Oreo BTS";

    sticker.src = "images/stickers-img-1.png";

    sticker.alt = "";

    card.append(image, logo, sticker, text, country);

    updateLetterCard(card, letter);

    card.addEventListener("click", () => {
      openLetter(letter.id);
    });

    return card;
  };

  // ========================================
  // UPDATE CARD
  // ========================================

  const updateLetterCard = (card, letter) => {
    const image = card.querySelector(".letter-card__image");

    const text = card.querySelector(".letter-card__text");

    const country = card.querySelector(".letter-card__country");

    image.src = letter.image;

    image.alt = "Открытка BTS OREO";

    text.textContent = letter.text;

    country.textContent = letter.country;

    card.setAttribute("aria-label", "Открыть письмо: " + letter.text);
  };

  // ========================================
  // UPDATE OWN LETTER
  // ========================================

  const updateOwnLetter = () => {
    const ownLetter = letterById.get("mine");

    const configuratorCard = document.querySelector(".configurator .card");

    if (!ownLetter || !configuratorCard) {
      return;
    }

    const activeImage = configuratorCard.querySelector(
      ".card__img--active img",
    );

    const activeWord = configuratorCard.querySelector(".words__word--active");

    if (activeImage) {
      ownLetter.image = activeImage.getAttribute("src") || ownLetter.image;
    }

    if (activeWord && activeWord.textContent.trim()) {
      ownLetter.text = activeWord.textContent.trim();
    }

    const ownCard = cardById.get("mine");

    if (ownCard) {
      updateLetterCard(ownCard, ownLetter);
    }
  };

  // ========================================
  // CENTER LETTER
  // ========================================

 const centerOnLetter = (letterId) => {
  const card = cardById.get(letterId);

  if (!card || !lettersViewport) {
    return;
  }

  lettersViewport.scrollTo({
    left: Math.max(
      0,
      card.offsetLeft - lettersViewport.clientWidth / 2,
    ),

    top: Math.max(
      0,
      card.offsetTop - lettersViewport.clientHeight / 2,
    ),

    behavior: "smooth",
  });
};

  // ========================================
  // CENTER GALLERY
  // ========================================

  const centerGallery = () => {
    if (!lettersViewport || galleryCentered) {
      return;
    }

    galleryCentered = true;

    requestAnimationFrame(() => {
      lettersViewport.scrollLeft = Math.max(
        0,
        (lettersCanvas.clientWidth - lettersViewport.clientWidth) / 2,
      );

      lettersViewport.scrollTop = Math.max(
        0,
        (lettersCanvas.clientHeight - lettersViewport.clientHeight) / 2,
      );
    });
  };

  // ========================================
  // OPEN LETTER
  // ========================================

  const openLetter = (letterId) => {
    const letter = letterById.get(letterId);

    if (!letter || !lettersModal || !modalCard) {
      return;
    }

    openedLetterId = letterId;

    modalImage.src = letter.image;

    modalImage.alt = "Открытка BTS OREO";

    modalText.textContent = letter.text;

    modalCountry.textContent = letter.country;

    modalCard.style.transform = "translate(-50%, -50%)";

    lettersModal.classList.add("letters__modal--active");

    lettersModal.setAttribute("aria-hidden", "false");

    // Прячем burger,
    // чтобы он не мешал крестику.

    if (lettersBurger) {
      lettersBurger.classList.add("header__burger--modal-hidden");
    }
  };

  // ========================================
  // ADJACENT LETTER
  // ========================================

  const showAdjacentLetter = (direction) => {
    const currentIndex = letters.findIndex(
      (letter) => letter.id === openedLetterId,
    );

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      (currentIndex + direction + letters.length) % letters.length;

    openLetter(letters[nextIndex].id);
  };

  // ========================================
  // CLOSE LETTER
  // ========================================

  const closeLetter = () => {
    if (!lettersModal) {
      return;
    }

    lettersModal.classList.remove("letters__modal--active");

    lettersModal.setAttribute("aria-hidden", "true");

    openedLetterId = null;

    window.clearTimeout(findOwnLetterTimer);

    // После закрытия модального письма возвращаем центральный текст.
    restoreLettersBody();

    // Возвращаем burger.

    if (lettersBurger) {
      lettersBurger.classList.remove("header__burger--modal-hidden");
    }
  };

  // ========================================
  // CREATE LETTERS
  // ========================================

  letters.forEach((letter) => {
    const card = createLetterCard(letter);

    lettersCanvas.appendChild(card);

    cardById.set(letter.id, card);
  });

  // ========================================
  // FIND OWN LETTER
  // ========================================

  if (findOwnLetterButton) {
    findOwnLetterButton.addEventListener("click", () => {
      updateOwnLetter();

      // На время поиска оставляем только карточку: нижняя навигация
      // остаётся на месте, так как она находится вне letters__body.
      window.clearTimeout(galleryBodyRestoreTimer);
      setGalleryBrowsing(true);

      centerOnLetter("mine");

      const ownCard = cardById.get("mine");

      if (!ownCard) {
        return;
      }

      ownCard.classList.remove("letter-card--found");

      void ownCard.offsetWidth;

      ownCard.classList.add("letter-card--found");

      window.clearTimeout(findOwnLetterTimer);

      findOwnLetterTimer = window.setTimeout(() => {
        if (lettersScreen.classList.contains("screen--active")) {
          openLetter("mine");
        }
      }, 1000);
    });
  }

  // ========================================
  // CLOSE BUTTONS
  // ========================================

  closeLetterButtons.forEach((button) => {
    button.addEventListener("click", closeLetter);
  });

  // ========================================
  // PREVIOUS / NEXT
  // ========================================

  if (previousLetterButton) {
    previousLetterButton.addEventListener("click", () => {
      showAdjacentLetter(-1);
    });
  }

  if (nextLetterButton) {
    nextLetterButton.addEventListener("click", () => {
      showAdjacentLetter(1);
    });
  }

  // ========================================
  // KEYBOARD
  // ========================================

  document.addEventListener("keydown", (event) => {
    const isModalOpen =
      lettersModal && lettersModal.classList.contains("letters__modal--active");

    if (!isModalOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      closeLetter();

      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      showAdjacentLetter(-1);

      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      showAdjacentLetter(1);
    }
  });

  // ========================================
  // SCREEN SHOWN
  // ========================================

  document.addEventListener("screen:shown", (event) => {
    if (event.detail.screen !== "letters") {
      return;
    }

    updateOwnLetter();

    centerGallery();

    requestAnimationFrame(() => {
      requestAnimationFrame(updateLettersBodyCoverage);
    });
  });

  // ========================================
  // GALLERY DRAG
  // ========================================

  if (lettersViewport) {
    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragScrollLeft = 0;
    let dragScrollTop = 0;
    let hasDragged = false;
    let suppressCardClick = false;
    let dragCaptureTarget = null;

    lettersViewport.addEventListener("pointerdown", (event) => {
      const card = event.target.closest("[data-letter-card]");

      dragPointerId = event.pointerId;

      dragStartX = event.clientX;

      dragStartY = event.clientY;

      dragScrollLeft = lettersViewport.scrollLeft;

      dragScrollTop = lettersViewport.scrollTop;

      hasDragged = false;

      dragCaptureTarget = card || lettersViewport;

      dragCaptureTarget.setPointerCapture(dragPointerId);

      lettersViewport.classList.add("is-dragging");
    });

    lettersViewport.addEventListener("pointermove", (event) => {
      if (event.pointerId !== dragPointerId) {
        return;
      }

      const distanceX = event.clientX - dragStartX;

      const distanceY = event.clientY - dragStartY;

      if (Math.abs(distanceX) > 5 || Math.abs(distanceY) > 5) {
        if (!hasDragged) {
          window.clearTimeout(galleryBodyRestoreTimer);
          setGalleryBrowsing(true);
        }

        hasDragged = true;
      }

      lettersViewport.scrollLeft = dragScrollLeft - distanceX;

      lettersViewport.scrollTop = dragScrollTop - distanceY;
    });

    const stopGalleryDrag = (event) => {
      if (event.pointerId !== dragPointerId) {
        return;
      }

      if (
        dragCaptureTarget &&
        dragCaptureTarget.hasPointerCapture(dragPointerId)
      ) {
        dragCaptureTarget.releasePointerCapture(dragPointerId);
      }

      if (hasDragged) {
        suppressCardClick = true;

        requestAnimationFrame(() => {
          suppressCardClick = false;
        });

        restoreLettersBody();
      }

      dragPointerId = null;

      dragCaptureTarget = null;

      lettersViewport.classList.remove("is-dragging");
    };

    lettersViewport.addEventListener(
      "click",
      (event) => {
        if (!suppressCardClick) {
          return;
        }

        event.preventDefault();

        event.stopPropagation();
      },
      true,
    );

    lettersViewport.addEventListener("pointerup", stopGalleryDrag);

    lettersViewport.addEventListener("pointercancel", stopGalleryDrag);

    // Колёсико на desktop тоже двигает карточки, поэтому для него
    // используем то же поведение, что и для pointer-drag.
    lettersViewport.addEventListener(
      "wheel",
      () => {
        window.clearTimeout(galleryBodyRestoreTimer);
        setGalleryBrowsing(true);
        restoreLettersBody();
      },
      { passive: true },
    );

    lettersViewport.addEventListener(
      "scroll",
      () => {
        if (!lettersScreen.classList.contains("letters--is-browsing")) {
          updateLettersBodyCoverage();
        }
      },
      { passive: true },
    );

    window.addEventListener("resize", updateLettersBodyCoverage);
  }

  // ========================================
  // MODAL TILT
  // ========================================

  if (lettersModal && modalCard && !prefersReducedMotion) {
    const modalTilt = 12;

    const modalTiltEasing = 0.1;

    let targetModalTiltX = 0;
    let targetModalTiltY = 0;

    let currentModalTiltX = 0;
    let currentModalTiltY = 0;

    let modalTiltFrame = null;

    const renderModalTilt = () => {
      currentModalTiltX +=
        (targetModalTiltX - currentModalTiltX) * modalTiltEasing;

      currentModalTiltY +=
        (targetModalTiltY - currentModalTiltY) * modalTiltEasing;

      modalCard.style.transform =
        "translate(-50%, -50%) perspective(1100px) rotateX(" +
        currentModalTiltX.toFixed(2) +
        "deg) rotateY(" +
        currentModalTiltY.toFixed(2) +
        "deg)";

      if (
        Math.abs(targetModalTiltX - currentModalTiltX) > 0.01 ||
        Math.abs(targetModalTiltY - currentModalTiltY) > 0.01
      ) {
        modalTiltFrame = requestAnimationFrame(renderModalTilt);
      } else {
        currentModalTiltX = targetModalTiltX;

        currentModalTiltY = targetModalTiltY;

        modalTiltFrame = null;
      }
    };

    const requestModalTilt = () => {
      if (!modalTiltFrame) {
        modalTiltFrame = requestAnimationFrame(renderModalTilt);
      }
    };

    lettersModal.addEventListener("pointermove", (event) => {
      const rect = modalCard.getBoundingClientRect();

      const pointerX = (event.clientX - rect.left) / rect.width - 0.5;

      const pointerY = (event.clientY - rect.top) / rect.height - 0.5;

      targetModalTiltY = pointerX * modalTilt * 2;

      targetModalTiltX = -pointerY * modalTilt * 2;

      requestModalTilt();
    });

    lettersModal.addEventListener("pointerleave", () => {
      targetModalTiltX = 0;

      targetModalTiltY = 0;

      requestModalTilt();
    });
  }
}

// ==========================================
// REQUEST FORM
// ==========================================

const requestForm = document.querySelector(".request__form");

if (requestForm) {
  const firstNameInput = requestForm.querySelector('[name="firstName"]');
  const lastNameInput = requestForm.querySelector('[name="lastName"]');
  const emailInput = requestForm.querySelector('[name="email"]');
  const agreementInput = requestForm.querySelector('[name="agreement"]');

  const setBoxError = (input, hasError) => {
    const box = input.closest(".form__box");

    if (box) {
      box.classList.toggle("form__box--error", hasError);
    }

    input.setAttribute("aria-invalid", String(hasError));
  };

  const validateTextInput = (input) => {
    if (!input) return false;

    const isValid = input.value.trim().length >= 2;

    setBoxError(input, !isValid);

    return isValid;
  };

  const validateEmail = (input) => {
    if (!input) return false;

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

    setBoxError(input, !isValid);

    return isValid;
  };

  const validateAgreement = (input) => {
    if (!input) return false;

    const agreement = input.closest(".form__agree");
    const isValid = input.checked;

    if (agreement) {
      agreement.classList.toggle("form__agree--error", !isValid);
    }

    input.setAttribute("aria-invalid", String(!isValid));

    return isValid;
  };

  [firstNameInput, lastNameInput].forEach((input) => {
    if (!input) return;

    input.addEventListener("input", () => {
      if (input.value.trim().length >= 2) {
        setBoxError(input, false);
      }
    });
  });

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        setBoxError(emailInput, false);
      }
    });
  }

  if (agreementInput) {
    agreementInput.addEventListener("change", () => {
      if (agreementInput.checked) {
        const agreement = agreementInput.closest(".form__agree");

        if (agreement) {
          agreement.classList.remove("form__agree--error");
        }

        agreementInput.setAttribute("aria-invalid", "false");
      }
    });
  }

  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = [
      validateTextInput(firstNameInput),
      validateTextInput(lastNameInput),
      validateEmail(emailInput),
      validateAgreement(agreementInput),
    ].every(Boolean);

    if (!isFormValid) {
      const firstError = requestForm.querySelector(
        ".form__box--error .form__input, .form__agree--error .form__checkbox-input",
      );

      if (firstError) {
        firstError.focus();
      }

      return;
    }

    if (typeof window.showScreen === "function") {
      window.showScreen("success");
    }
  });
}

// ==========================================
// PLAYER
// ==========================================

const player = document.querySelector(".player");

if (player) {
  const audio = player.querySelector(".player__audio");
  const image = player.querySelector(".player__img img");
  const suptext = player.querySelector(".player__suptext");
  const title = player.querySelector(".player__text");
  const playButton = player.querySelector(".player__play");
  const playIcon = player.querySelector(".player__play-icon");
  const pauseIcon = player.querySelector(".player__pause-icon");

  const playlist = [
    {
      artist: "Hooligan",
      title: "BTS",
      image: "images/player-img-1.png",
      audio: "audio/hooligan.m4a",
    },
  ];

  let currentTrack = 0;

  function loadTrack(index) {
    const track = playlist[index];

    if (!track) return;

    currentTrack = index;
    audio.src = track.audio;
    image.src = track.image;
    image.alt = `${track.artist} - ${track.title}`;
    suptext.textContent = track.artist;
    title.textContent = track.title;
    audio.load();
  }

  async function playTrack() {
    try {
      await audio.play();
    } catch (error) {
      console.error("Не удалось запустить аудио:", error);
    }
  }

  function pauseTrack() {
    audio.pause();
  }

  function togglePlay() {
    if (audio.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  }

  function setPlayingState() {
    player.classList.add("is-playing");
    playIcon.hidden = true;
    pauseIcon.hidden = false;
    playButton.setAttribute("aria-label", "Pause");
  }

  function setPausedState() {
    player.classList.remove("is-playing");
    playIcon.hidden = false;
    pauseIcon.hidden = true;
    playButton.setAttribute("aria-label", "Play");
  }

  playButton.addEventListener("click", togglePlay);
  audio.addEventListener("play", setPlayingState);
  audio.addEventListener("pause", setPausedState);
  audio.loop = true;
  loadTrack(currentTrack);
}

// ==========================================
// CONFIGURATOR
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
  const configurator = document.querySelector(".configurator");

  if (!configurator) return;

  // ========================================
  // ELEMENTS
  // ========================================

  const form = configurator.querySelector("#configurator-form");

  const headItems = Array.prototype.slice.call(
    configurator.querySelectorAll("[data-step-head]"),
  );

  const stepPanels = Array.prototype.slice.call(
    configurator.querySelectorAll("[data-step-panel]"),
  );

  const stepTabs = Array.prototype.slice.call(
    configurator.querySelectorAll("[data-step-tab]"),
  );

  const nextButton = configurator.querySelector("[data-next-step]");

  const nextButtonText = nextButton ? nextButton.querySelector("span") : null;

  // ========================================
  // COLORS
  // ========================================

  const colorInputs = Array.prototype.slice.call(
    configurator.querySelectorAll(".choose-colors__input"),
  );

  const colorPreviews = Array.prototype.slice.call(
    configurator.querySelectorAll("[data-color-preview]"),
  );

  const card = configurator.querySelector(".card");

  // ========================================
  // WORDS
  // ========================================

  const wordInputs = Array.prototype.slice.call(
    configurator.querySelectorAll(".choose-words__input"),
  );

  const wordPreviews = Array.prototype.slice.call(
    configurator.querySelectorAll("[data-word-preview]"),
  );

  // ========================================
  // STICKERS
  // ========================================

  const stickerInputs = Array.prototype.slice.call(
    configurator.querySelectorAll(".choose-stickers__input"),
  );

  const stickerPreviews = Array.prototype.slice.call(
    configurator.querySelectorAll("[data-sticker-preview]"),
  );

  const stickersSwiperElement = configurator.querySelector(
    ".choose-stickers__swiper",
  );

  // ========================================
  // STATE
  // ========================================

  const state = {
    step: 1,
    color: null,
    word: null,
    stickers: [],
  };

  // ========================================
  // SWIPERS
  // ========================================

  let wordsSwiper = null;
  let stickersSwiper = null;

  // ========================================
  // STICKER PLACEMENT
  // ========================================

  const maxActiveStickers = 12;

const stickerConfig = {
  maxRotate: 12,
  attempts: 300,

  // Теперь относительно размера карточки,
  // а не фиксированные px/rem.
  centerZone: {
    rx: 0.35,
    ry: 0.2,
  },

  blockedRects: [
    {
      x1: 0.64,
      y1: 0.04,
      x2: 0.94,
      y2: 0.2,
    },
    {
      x1: 0.2,
      y1: 0.85,
      x2: 0.8,
      y2: 0.97,
    },
  ],

  fallbackWidth: 614,
  fallbackHeight: 439,
};

  function getStickerMetrics(area) {
    const smallestSide = Math.max(1, Math.min(area.width, area.height));
    const maxSize = Math.round(
      Math.max(42, Math.min(96, smallestSide * 0.18)),
    );

    return {
      minSize: Math.round(maxSize * 0.78),
      maxSize,
      edgePadding: Math.max(4, Math.round(maxSize * 0.11)),
      gap: Math.max(3, Math.round(maxSize * 0.1)),
    };
  }

  const stickerPlacementById = {};

  // ========================================
  // STICKER HELPERS
  // ========================================

  function getStickerInput(stickerId) {
    let stickerInput = null;

    stickerInputs.forEach(function (input) {
      if (input.getAttribute("data-sticker-id") === stickerId) {
        stickerInput = input;
      }
    });

    return stickerInput;
  }

  function getStickerPreview(stickerId) {
    let stickerPreview = null;

    stickerPreviews.forEach(function (preview) {
      if (preview.getAttribute("data-sticker-preview") === stickerId) {
        stickerPreview = preview;
      }
    });

    return stickerPreview;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

function getRootRemSize() {
  return (
    parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    ) || 1
  );
}

function getStickerAreaSize() {
  const holder = stickerPreviews.length
    ? stickerPreviews[0].parentElement
    : null;

  const remSize = getRootRemSize();

  let width = holder ? holder.clientWidth : 0;
  let height = holder ? holder.clientHeight : 0;

  if (!width || !height) {
    width = card ? card.clientWidth : 0;
    height = card ? card.clientHeight : 0;
  }

  // clientWidth/clientHeight возвращают px.
  // Переводим всё пространство в rem,
  // чтобы дальше вся математика была в rem.
  return {
    width: width
      ? width / remSize
      : stickerConfig.fallbackWidth,

    height: height
      ? height / remSize
      : stickerConfig.fallbackHeight,
  };
}

function isInBlockedZone(cx, cy, r, area) {
  const zone = stickerConfig.centerZone;

  const dx = cx - area.width / 2;
  const dy = cy - area.height / 2;

  const zx = area.width * zone.rx + r;
  const zy = area.height * zone.ry + r;

  if ((dx * dx) / (zx * zx) + (dy * dy) / (zy * zy) < 1) {
    return true;
  }

  for (let i = 0; i < stickerConfig.blockedRects.length; i += 1) {
    const rect = stickerConfig.blockedRects[i];

    const x1 = rect.x1 * area.width - r;
    const x2 = rect.x2 * area.width + r;
    const y1 = rect.y1 * area.height - r;
    const y2 = rect.y2 * area.height + r;

    if (cx > x1 && cx < x2 && cy > y1 && cy < y2) {
      return true;
    }
  }

  return false;
}

  function getGapToStickers(cx, cy, r) {
    let minGap = Infinity;

    Object.keys(stickerPlacementById).forEach(function (stickerId) {
      const other = stickerPlacementById[stickerId];

      const otherR = other.size / 2;

      const ox = other.left + otherR;

      const oy = other.top + otherR;

      const distance = Math.sqrt((cx - ox) * (cx - ox) + (cy - oy) * (cy - oy));

      const gap = distance - r - otherR;

      if (gap < minGap) {
        minGap = gap;
      }
    });

    return minGap;
  }

function findStickerPlacement() {
  const area = getStickerAreaSize();

  const metrics = getStickerMetrics(area);

  const pad = metrics.edgePadding;

  let best = null;
  let bestGap = -Infinity;

  for (
    let attempt = 0;
    attempt < stickerConfig.attempts;
    attempt += 1
  ) {
    const size = Math.round(
      randomBetween(metrics.minSize, metrics.maxSize),
    );

    const r = size / 2;

    const maxLeft = Math.max(pad, area.width - pad - size);
    const maxTop = Math.max(pad, area.height - pad - size);

    const left = Math.round(
      randomBetween(pad, maxLeft),
    );

    const top = Math.round(
      randomBetween(pad, maxTop),
    );

    const cx = left + r;
    const cy = top + r;

    if (isInBlockedZone(cx, cy, r, area)) {
      continue;
    }

    const candidate = {
      left,
      top,
      size,

      rotate: Math.round(
        randomBetween(
          -stickerConfig.maxRotate,
          stickerConfig.maxRotate,
        ),
      ),
    };

    const gap = getGapToStickers(cx, cy, r);

    if (gap >= metrics.gap) {
      return candidate;
    }

    if (gap > bestGap) {
      bestGap = gap;
      best = candidate;
    }
  }

  return best;
}

  // ========================================
  // SET STICKER POSITIONS
  // ========================================

 function setStickerPosition(stickerId) {
  const placement = stickerPlacementById[stickerId];

  const sticker = getStickerPreview(stickerId);

  if (!sticker || !placement) {
    return;
  }

  sticker.style.left = placement.left + "rem";
  sticker.style.top = placement.top + "rem";

  sticker.style.setProperty(
    "--sticker-size",
    placement.size + "rem",
  );

  sticker.style.transform =
    "rotate(" + placement.rotate + "deg)";
}

  function setStickerPositions() {
    Object.keys(stickerPlacementById).forEach(function (stickerId) {
      setStickerPosition(stickerId);
    });
  }

  // ========================================
  // SET STEP
  // ========================================

  function setStep(step) {
    const newStep = Math.min(Math.max(step, 1), 3);

    let activeHeadItem = null;

    let activeStepPanel = null;

    state.step = newStep;

    // HEAD

    headItems.forEach(function (item) {
      const itemStep = Number(item.getAttribute("data-step-head"));

      if (itemStep === newStep) {
        item.classList.add("configurator-head__item--active");

        activeHeadItem = item;
      } else {
        item.classList.remove("configurator-head__item--active");
      }
    });

    // BODY

    stepPanels.forEach(function (panel) {
      const panelStep = Number(panel.getAttribute("data-step-panel"));

      if (panelStep === newStep) {
        panel.classList.add("config__step--active");

        activeStepPanel = panel;
      } else {
        panel.classList.remove("config__step--active");
      }
    });

    // BOTTOM TABS

    stepTabs.forEach(function (tab) {
      const tabStep = Number(tab.getAttribute("data-step-tab"));

      const item = tab.closest(".steps__item");

      if (!item) return;

      if (tabStep === newStep) {
        item.classList.add("steps__item--active");
      } else {
        item.classList.remove("steps__item--active");
      }
    });

    // BUTTON TEXT

    if (nextButtonText) {
      if (newStep === 3) {
        nextButtonText.textContent = "Отправить письмо";
      } else {
        nextButtonText.textContent = "Далее";
      }
    }

    // SWIPERS

    if (newStep === 2 && wordsSwiper) {
      wordsSwiper.update();
    }

    if (newStep === 3 && stickersSwiper) {
      stickersSwiper.update();
    }

    // AOS

    replayAosElements([activeHeadItem, activeStepPanel]);
  }

  // ========================================
  // SET COLOR
  // ========================================

  function setColor(input) {
    if (!input) return;

    const colorId = input.getAttribute("data-color-id");

    state.color = colorId;

    colorInputs.forEach(function (item) {
      const parent = item.closest(".choose-colors__color");

      if (!parent) return;

      if (item.checked) {
        parent.classList.add("choose-colors__color--active");
      } else {
        parent.classList.remove("choose-colors__color--active");
      }
    });

    colorPreviews.forEach(function (preview) {
      const previewId = preview.getAttribute("data-color-preview");

      if (previewId === colorId) {
        preview.classList.add("card__img--active");
      } else {
        preview.classList.remove("card__img--active");
      }
    });

    if (card) {
      card.classList.toggle(
        "card--white",
        colorId === "color-2" || colorId === "color-3",
      );
    }
  }

  // ========================================
  // SET WORD
  // ========================================

  function setWord(input) {
    if (!input) return;

    const wordId = input.getAttribute("data-word-id");

    state.word = wordId;

    wordInputs.forEach(function (item) {
      const parent = item.closest(".choose-words__word");

      if (!parent) return;

      if (item.checked) {
        parent.classList.add("choose-words__word--active");
      } else {
        parent.classList.remove("choose-words__word--active");
      }
    });

    wordPreviews.forEach(function (preview) {
      const previewId = preview.getAttribute("data-word-preview");

      if (previewId === wordId) {
        preview.classList.add("words__word--active");
      } else {
        preview.classList.remove("words__word--active");
      }
    });
  }

  // ========================================
  // SET STICKER
  // ========================================

  function setStickerVisualState(stickerId, isActive) {
    const input = getStickerInput(stickerId);

    const chooser = input ? input.closest(".choose-stickers__sticker") : null;

    const preview = getStickerPreview(stickerId);

    if (chooser) {
      chooser.classList.toggle("choose-stickers__sticker--active", isActive);
    }

    if (!preview) return;

    preview.classList.toggle("stikers__item--active", isActive);

    if (!isActive) {
      preview.classList.remove("stikers__item--selected");
    }
  }

  function removeSticker(stickerId) {
    const stickerIndex = state.stickers.indexOf(stickerId);

    const input = getStickerInput(stickerId);

    if (stickerIndex !== -1) {
      state.stickers.splice(stickerIndex, 1);
    }

    if (input) {
      input.checked = false;
    }

    delete stickerPlacementById[stickerId];

    setStickerVisualState(stickerId, false);
  }

  function addSticker(stickerId) {
    if (state.stickers.indexOf(stickerId) !== -1) {
      setStickerVisualState(stickerId, true);

      return;
    }

    if (state.stickers.length >= maxActiveStickers) {
      removeSticker(state.stickers[0]);
    }

    const placement = findStickerPlacement();

    if (!placement) {
      const input = getStickerInput(stickerId);

      if (input) {
        input.checked = false;
      }

      return;
    }

    state.stickers.push(stickerId);

    stickerPlacementById[stickerId] = placement;

    setStickerPosition(stickerId);

    setStickerVisualState(stickerId, true);
  }

  function setSticker(input) {
    if (!input) return;

    const stickerId = input.getAttribute("data-sticker-id");

    if (input.checked) {
      addSticker(stickerId);
    } else {
      removeSticker(stickerId);
    }
  }

  // ========================================
  // RESET CONFIGURATOR
  // ========================================

  function resetConfigurator() {
    state.stickers.slice().forEach(function (stickerId) {
      removeSticker(stickerId);
    });

    stickerInputs.forEach(function (input) {
      input.checked = false;
    });

    stickerPreviews.forEach(function (preview) {
      preview.classList.remove(
        "stikers__item--active",
        "stikers__item--selected",
      );

      preview.style.removeProperty("left");

      preview.style.removeProperty("top");

      preview.style.removeProperty("transform");

      preview.style.removeProperty("--sticker-size");
    });

    Object.keys(stickerPlacementById).forEach(function (stickerId) {
      delete stickerPlacementById[stickerId];
    });

    state.stickers = [];

    state.word = null;

    wordInputs.forEach(function (input) {
      input.checked = false;
    });

    wordPreviews.forEach(function (preview) {
      preview.classList.remove("words__word--active");
    });

    if (initialColor) {
      colorInputs.forEach(function (input) {
        input.checked = input === initialColor;
      });

      setColor(initialColor);
    }

    setStep(1);

    if (wordsSwiper && typeof wordsSwiper.slideToLoop === "function") {
      wordsSwiper.slideToLoop(1, 0);
    }

    if (stickersSwiper && typeof stickersSwiper.slideToLoop === "function") {
      stickersSwiper.slideToLoop(1, 0);
    }
  }

  window.resetConfigurator = resetConfigurator;

  // ========================================
  // COLORS EVENTS
  // ========================================

  colorInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      setColor(input);
    });
  });

  // ========================================
  // WORDS EVENTS
  // ========================================

  wordInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      setWord(input);
    });
  });

  // ========================================
  // STICKERS EVENTS
  // ========================================

  stickerInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      setSticker(input);
    });
  });

  // Swiper дублирует слайды в loop-режиме. На мобильном устройстве тап
  // часто попадает именно в копию стикера, поэтому переключаем оригинальный
  // input по data-sticker-id и не даём браузеру фокусировать скрытый checkbox.
  if (stickersSwiperElement) {
    stickersSwiperElement.addEventListener("click", function (event) {
      const chooser = event.target.closest(".choose-stickers__sticker");

      if (!chooser || !stickersSwiperElement.contains(chooser)) {
        return;
      }

      const clickedInput = chooser.querySelector("[data-sticker-id]");
      const stickerId = clickedInput
        ? clickedInput.getAttribute("data-sticker-id")
        : null;
      const input = stickerId ? getStickerInput(stickerId) : null;

      if (!input) {
        return;
      }

      event.preventDefault();
      input.checked = !input.checked;
      setSticker(input);
    });
  }

  // ========================================
  // DELETE STICKER FROM CARD
  // ========================================

  stickerPreviews.forEach(function (preview) {
    const deleteButton = preview.querySelector(".stikers__delete");

    preview.addEventListener("click", function (event) {
      if (event.target.closest(".stikers__delete")) {
        return;
      }

      stickerPreviews.forEach(function (item) {
        item.classList.remove("stikers__item--selected");
      });

      preview.classList.add("stikers__item--selected");
    });

    if (!deleteButton) return;

    deleteButton.addEventListener("click", function (event) {
      event.preventDefault();

      const stickerId = preview.getAttribute("data-sticker-preview");

      const input = getStickerInput(stickerId);

      if (!input) return;

      input.checked = false;

      setSticker(input);
    });
  });

  // ========================================
  // STEP TABS
  // ========================================

  stepTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const step = Number(tab.getAttribute("data-step-tab"));

      setStep(step);
    });
  });

  // ========================================
  // NEXT BUTTON
  // ========================================

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      // STEP 1 -> STEP 2
      // STEP 2 -> STEP 3

      if (state.step < 3) {
        setStep(state.step + 1);

        return;
      }

      // ==================================
      // STEP 3 -> REQUEST SCREEN
      // ==================================

      if (typeof window.showScreen === "function") {
        window.showScreen("request");
      }
    });
  }

  // ========================================
  // CONFIGURATOR FORM SUBMIT
  // ========================================

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Здесь позже можно будет
      // подключить обработку данных
      // конфигуратора.
    });
  }

  // ========================================
  // WORDS SWIPER
  // ========================================

  if (document.querySelector(".choose-words__swiper")) {
    wordsSwiper = new Swiper(".choose-words__swiper", {
      speed: 750,

      slidesPerView: 2,

      centeredSlides: true,

      initialSlide: 1,

      spaceBetween: 10,

      loop: true,

      navigation: {
        prevEl: ".choose-words-arrow--prev",

        nextEl: ".choose-words-arrow--next",
      },
    });
  }

  // ========================================
  // STICKERS SWIPER
  // ========================================

  if (document.querySelector(".choose-stickers__swiper")) {
    stickersSwiper = new Swiper(".choose-stickers__swiper", {
      speed: 750,

      slidesPerView: 18,

      centeredSlides: true,

      initialSlide: 1,

      spaceBetween: 10,

      loop: true,

      navigation: {
        prevEl: ".choose-stickers-arrow--prev",

        nextEl: ".choose-stickers-arrow--next",
      },

      breakpoints: {
        0: {
          speed: 750,

          slidesPerView: 10,

          centeredSlides: true,

          initialSlide: 1,

          spaceBetween: 10,

          loop: true,
        },

        768: {
          speed: 750,

          slidesPerView: 12,

          centeredSlides: true,

          initialSlide: 1,

          spaceBetween: 10,

          loop: true,
        },

        993: {
          speed: 750,

          slidesPerView: 18,

          centeredSlides: true,

          initialSlide: 1,

          spaceBetween: 10,

          loop: true,
        },
      },
    });
  }

  // ========================================
  // INITIAL COLOR
  // ========================================

  let initialColor = null;

  colorInputs.forEach(function (input) {
    if (input.checked) {
      initialColor = input;
    }
  });

  if (!initialColor && colorInputs.length) {
    initialColor = colorInputs[0];
  }

  if (initialColor) {
    initialColor.checked = true;

    setColor(initialColor);
  }

  // ========================================
  // INITIAL WORD
  // ========================================

  wordInputs.forEach(function (input) {
    input.checked = false;
  });

  wordPreviews.forEach(function (preview) {
    preview.classList.remove("words__word--active");
  });

  // ========================================
  // INITIAL STICKERS
  // ========================================

  stickerInputs.forEach(function (input) {
    setSticker(input);
  });

  // ========================================
  // STICKER POSITIONS
  // ========================================

  setStickerPositions();

  // ========================================
  // INITIAL STEP
  // ========================================

  setStep(1);
});
