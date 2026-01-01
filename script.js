function updateCountdown() {
  const now = new Date();
  // حاول الحصول على تاريخ من حقول الإدخال إن وُجدت (عنصر واجهة المستخدم قد يزوّد السنة/الشهر/اليوم)
  // إذا لم توجد الحقول، نستخدم قيمة افتراضية بطريقة آمنة.
  function getSelectedFuture() {
    const yEl = document.getElementById('year');
    const mEl = document.getElementById('month');
    const dEl = document.getElementById('day');
    if (yEl && mEl && dEl) {
      const y = parseInt(yEl.value, 10);
      const m = parseInt(mEl.value, 10);
      const d = parseInt(dEl.value, 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        // ملاحظة مهمة: في مُنشئ Date بالأرقام، الشهور تبدأ من 0 (يناير = 0)
        // لذلك إذا كان المستخدم يختار الشهر برقم 1-12، نحتاج إلى طرح 1.
        return new Date(y, m - 1, d, 0, 0, 0);
      }
    }

    // fallback: جرب تحليل سلسلة ISO (بتنسيق صحيح) ثم انتحل إلى منشئ أرقام إن فشل التحليل
    const iso = '2026-08-12T00:00:00';
    const parsed = new Date(iso);
    if (!isNaN(parsed.getTime())) return parsed;
    // افتراضي آمن: 12 أغسطس 2026 (ملاحظة: الشهر هنا 0-based لذلك أغسطس = 7)
    return new Date(2026, 7, 12, 0, 0, 0);
  }

  const future = getSelectedFuture();
  const diff = future - now;

  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// لا حاجة للتحديث كل 100ms — ثانية واحدة كافية لعداد الثواني
setInterval(updateCountdown, 1000);
updateCountdown();
// --------------------
// 2. نسبة الإنجاز
// --------------------
function setProgress(percent) {
  const fill = document.getElementById("gauge-fill");
  const text = document.getElementById("gauge-text");

  // تأكد أن القيمة بين 0 و 100
  percent = Math.max(0, Math.min(percent, 100));

  // استخدم طول المسار الفعلي لتجنب اختلاف الشكل عند تغيّر العرض
  // getTotalLength() يعطي طول المسار بالوحدات المستخدمة في الـ SVG
  const circumference = fill.getTotalLength();
  const offset = circumference - (circumference * percent / 100);

  // تحديث القوس والنص
  fill.style.strokeDasharray = `${circumference}`;
  fill.style.strokeDashoffset = offset;
  text.textContent = `${percent.toFixed(2)} %`;
}

// استدعاء لتحديث القوس بنسبة معينة (عدّل الرقم حسب الحاجة)
setProgress(19); // ✅ تم ضبط النسبة إلى 19%

// --------------------
// 3. Images carousel
// --------------------
(function initCarousel() {
  const section = document.querySelector('.images-carousel');
  if (!section) return;

  const carousel = section.querySelector('.carousel');
  const track = section.querySelector('.carousel-track');
  const viewport = section.querySelector('.carousel-viewport');
  const prevBtn = section.querySelector('.carousel-btn.prev');
  const nextBtn = section.querySelector('.carousel-btn.next');
  const dotsContainer = section.querySelector('.carousel-dots');

  if (!track || !viewport) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let originalSlides = Array.from(track.children);
  if (originalSlides.length <= 1) return;

  let perView = getPerView();
  let cloneCount = 0;
  let index = 0;
  let isAnimating = false;
  let autoTimer = null;

  function getPerView() {
    return window.matchMedia('(max-width: 768px)').matches ? 1 : 2;
  }

  function getSlideWidth() {
    return viewport.clientWidth / perView;
  }

  function setSlideWidths() {
    const width = getSlideWidth();
    track.querySelectorAll('.carousel-slide').forEach((slide) => {
      slide.style.width = `${width}px`;
    });
  }

  function cloneSlide(slide) {
    const clone = slide.cloneNode(true);
    clone.dataset.clone = 'true';
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  }

  function clearClones() {
    track.querySelectorAll('[data-clone="true"]').forEach((clone) => clone.remove());
  }

  function rebuildClones(activeIndex) {
    clearClones();
    isAnimating = false;
    originalSlides = Array.from(track.children).filter(
      (slide) => !slide.hasAttribute('data-clone')
    );
    cloneCount = Math.min(perView, originalSlides.length);

    const headClones = originalSlides.slice(0, cloneCount).map(cloneSlide);
    const tailClones = originalSlides.slice(-cloneCount).map(cloneSlide);
    const firstOriginal = originalSlides[0];

    tailClones.forEach((clone) => track.insertBefore(clone, firstOriginal));
    headClones.forEach((clone) => track.appendChild(clone));

    setSlideWidths();
    index = cloneCount + (activeIndex || 0);
    jumpTo(index);
    updateDots();
  }

  function translateTo(idx, animate) {
    track.style.transition = animate ? 'transform 0.6s ease' : 'none';
    track.style.transform = `translateX(${-idx * getSlideWidth()}px)`;
  }

  function jumpTo(idx) {
    translateTo(idx, false);
  }

  function goToIndex(idx) {
    if (isAnimating) return;
    index = idx;
    isAnimating = true;
    translateTo(index, !prefersReducedMotion.matches);
    updateDots();

    if (prefersReducedMotion.matches) {
      isAnimating = false;
      handleLoop();
    }
  }

  function goToOriginal(idx) {
    goToIndex(cloneCount + idx);
  }

  function moveBy(step) {
    goToIndex(index + step);
  }

  function getActiveOriginalIndex() {
    const total = originalSlides.length;
    return ((index - cloneCount) % total + total) % total;
  }

  function handleLoop() {
    const total = originalSlides.length;
    if (index >= total + cloneCount) {
      index = cloneCount;
      jumpTo(index);
    } else if (index < cloneCount) {
      index = total + cloneCount - 1;
      jumpTo(index);
    }
    updateDots();
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    originalSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToOriginal(i));
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const activeIndex = getActiveOriginalIndex();
    dots.forEach((dot, i) => {
      const isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function startAuto() {
    if (prefersReducedMotion.matches) return;
    stopAuto();
    autoTimer = setInterval(() => moveBy(1), 2300);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform') return;
    isAnimating = false;
    handleLoop();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => moveBy(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveBy(1));

  if (carousel) {
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);
    carousel.addEventListener('touchstart', stopAuto, { passive: true });
    carousel.addEventListener('touchend', startAuto, { passive: true });
  }

  window.addEventListener('resize', () => {
    const activeIndex = getActiveOriginalIndex();
    perView = getPerView();
    rebuildClones(activeIndex);
  });

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', () => {
      if (prefersReducedMotion.matches) {
        stopAuto();
      } else {
        startAuto();
      }
    });
  }

  buildDots();
  rebuildClones(0);
  startAuto();
})();
