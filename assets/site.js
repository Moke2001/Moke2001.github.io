(() => {
  function initFigureCarousels() {
    document.querySelectorAll("[data-figure-carousel]").forEach(carousel => {
      const slides = Array.from(carousel.querySelectorAll(".figure-slide"));
      const current = carousel.querySelector("[data-figure-current]");
      let index = 0;
      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === index);
          slide.setAttribute("aria-hidden", slideIndex === index ? "false" : "true");
        });
        if (current) current.textContent = String(index + 1);
      }
      carousel.addEventListener("click", event => {
        const button = event.target.closest("[data-figure-step]");
        if (!button || !carousel.contains(button)) return;
        event.preventDefault();
        show(index + Number(button.dataset.figureStep || 0));
      });
      show(0);
    });
  }

  initFigureCarousels();

  const shell = document.querySelector("[data-page-shell]");
  if (!shell) return;

  const sections = Array.from(shell.querySelectorAll(".page-section"));
  const dots = Array.from(document.querySelectorAll("[data-page-target]"));
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const carousel = document.querySelector("[data-carousel]");
  const carouselSlides = Array.from(carousel?.querySelectorAll(".paper-slide") || []);
  const carouselDots = Array.from(carousel?.querySelectorAll("[data-carousel-target]") || []);
  const pageIds = sections.map(section => section.id);
  let activeIndex = Math.max(0, pageIds.indexOf(window.location.hash.slice(1)));
  let locked = false;
  let touchStartY = 0;
  let carouselIndex = 0;

  function clamp(index) {
    return Math.max(0, Math.min(sections.length - 1, index));
  }

  function syncHash(index) {
    const id = sections[index]?.id;
    if (!id) return;
    const nextHash = `#${id}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
    }
  }

  function setActive(index, source = "direct") {
    const nextIndex = clamp(index);
    const previousIndex = activeIndex;
    activeIndex = nextIndex;

    sections.forEach((section, sectionIndex) => {
      section.classList.toggle("is-active", sectionIndex === activeIndex);
      section.classList.toggle("is-prev", sectionIndex < activeIndex);
      section.setAttribute("aria-hidden", sectionIndex === activeIndex ? "false" : "true");
    });

    if (previousIndex !== activeIndex) {
      sections[activeIndex].scrollTop = 0;
    }

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "page" : "false");
    });

    navLinks.forEach(link => {
      const target = link.hash ? link.hash.slice(1) : "";
      link.classList.toggle("is-active", target === "home" || target === sections[activeIndex]?.id);
    });

    if (source !== "hash") syncHash(activeIndex);
    window.EurekaParticles?.setPage(activeIndex);
    window.dispatchEvent(new CustomEvent("eureka:pagechange", { detail: { index: activeIndex, previousIndex } }));
  }

  function setCarousel(index) {
    if (!carouselSlides.length) return;
    carouselIndex = Math.max(0, Math.min(carouselSlides.length - 1, index));
    carouselSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === carouselIndex);
    });
    carouselDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === carouselIndex);
    });
  }

  function go(direction) {
    if (locked) return;
    const nextIndex = clamp(activeIndex + direction);
    if (nextIndex === activeIndex) return;
    locked = true;
    setActive(nextIndex, "wheel");
    window.setTimeout(() => {
      locked = false;
    }, 850);
  }

  function canScrollActivePage(direction) {
    const section = sections[activeIndex];
    if (!section) return false;
    const maxScroll = section.scrollHeight - section.clientHeight;
    if (maxScroll <= 2) return false;
    if (direction > 0) return section.scrollTop < maxScroll - 2;
    return section.scrollTop > 2;
  }

  window.addEventListener(
    "wheel",
    event => {
      if (Math.abs(event.deltaY) < 18) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      if (canScrollActivePage(direction)) return;
      event.preventDefault();
      go(direction);
    },
    { passive: false }
  );

  window.addEventListener("keydown", event => {
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      go(1);
    } else if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      go(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0, "key");
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(sections.length - 1, "key");
    }
  });

  window.addEventListener("touchstart", event => {
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener("touchend", event => {
    const touchEndY = event.changedTouches[0]?.clientY || 0;
    const delta = touchStartY - touchEndY;
    if (Math.abs(delta) > 48) {
      const direction = delta > 0 ? 1 : -1;
      if (!canScrollActivePage(direction)) go(direction);
    }
  }, { passive: true });

  document.addEventListener("click", event => {
    const dot = event.target.closest("[data-page-target]");
    if (dot) {
      setActive(Number(dot.dataset.pageTarget || 0), "click");
      return;
    }

    const carouselDot = event.target.closest("[data-carousel-target]");
    if (carouselDot) {
      setCarousel(Number(carouselDot.dataset.carouselTarget || 0));
      return;
    }

    const carouselStep = event.target.closest("[data-carousel-step]");
    if (carouselStep) {
      const step = Number(carouselStep.dataset.carouselStep || 0);
      if (carouselSlides.length) {
        setCarousel((carouselIndex + step + carouselSlides.length) % carouselSlides.length);
      }
      return;
    }

    const link = event.target.closest("a[href^='#'], a[href*='index.html#']");
    if (!link?.hash) return;
    const targetIndex = pageIds.indexOf(link.hash.slice(1));
    if (targetIndex < 0) return;
    event.preventDefault();
    setActive(targetIndex, "nav");
  });

  window.addEventListener("hashchange", () => {
    const targetIndex = pageIds.indexOf(window.location.hash.slice(1));
    if (targetIndex >= 0) setActive(targetIndex, "hash");
  });

  setActive(activeIndex, "hash");
  setCarousel(0);
  if (carouselSlides.length > 1) {
    window.setInterval(() => {
      setCarousel((carouselIndex + 1) % carouselSlides.length);
    }, 4600);
  }
})();
