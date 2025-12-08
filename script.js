function updateCountdown() {
  const now = new Date();
  const future = new Date('2025-12-31T00:00:00');
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

setInterval(updateCountdown, 100);
updateCountdown();
// --------------------
// 2. نسبة الإنجاز
// --------------------
function setProgress(percent) {
  const fill = document.getElementById("gauge-fill");
  const text = document.getElementById("gauge-text");

  // تأكد أن القيمة بين 0 و 100
  percent = Math.max(0, Math.min(percent, 100));

  const circumference = 126;
  const offset = circumference - (circumference * percent / 100);

  // تحديث القوس والنص
  fill.style.strokeDasharray = `${circumference}`;
  fill.style.strokeDashoffset = offset;
  text.textContent = `${percent.toFixed(2)} %`;
}

// استدعاء لتحديث القوس بنسبة معينة (عدّل الرقم حسب الحاجة)
setProgress(35); // ✅ غيّر الرقم هنا حسب نسبة الإنجاز المطلوبة
