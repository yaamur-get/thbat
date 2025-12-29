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
