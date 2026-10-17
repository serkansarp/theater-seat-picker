const MAX_SEATS = 8;

// Fiyat bölümleri
const FRONT_ROWS = 'ABCD'; // ön sıralar
const FRONT_FEE = 1500;
const BACK_FEE = 950;

const KEY = 'theater-seat-picker:seats';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
function save(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* depolama kapalı ya da dolu olabilir, sessizce geç */
  }
}

let selectedSeats = load();

const listEl = document.getElementById('selectedList');
const countEl = document.getElementById('selectedCount');
const totalEl = document.getElementById('totalPrice');
const buyBtn = document.getElementById('buySeats');
const limitMsg = document.getElementById('seatLimitMsg'); // YENİ

document.getElementById('feeFront').textContent = FRONT_FEE.toFixed(2);
document.getElementById('feeBack').textContent = BACK_FEE.toFixed(2);

// "A19" gibi bir koltuk kodunun ilk harfi sırayı verir
function feeOf(id) {
  return FRONT_ROWS.includes(id.charAt(0)) ? FRONT_FEE : BACK_FEE;
}

function findSeat(id) {
  return document.querySelector(`.seat[aria-label="${id}"]`);
}

function render() {
  listEl.textContent = selectedSeats.length
    ? selectedSeats.join(', ')
    : 'Henüz seçim yok';
  countEl.textContent = selectedSeats.length;

  const total = selectedSeats.reduce((sum, id) => sum + feeOf(id), 0);
  totalEl.textContent = total.toFixed(2);

  buyBtn.disabled = !selectedSeats.length; // YENİ: seçim yoksa kapalı

  const full = selectedSeats.length >= MAX_SEATS;
  limitMsg.hidden = !full;
  document.querySelectorAll('.seat:not(.occupied)').forEach((seat) => {
    seat.disabled = full && !seat.classList.contains('selected');
  });
}

// ---- Sayfa açılırken kayıtlı koltukları seçili olarak göster ----
selectedSeats = selectedSeats
  .filter((id) => {
    const seat = findSeat(id);
    return seat && !seat.classList.contains('occupied');
  })
  .slice(0, MAX_SEATS); // YENİ: kayıt 8'den fazlaysa kırp
selectedSeats.forEach((id) => {
  const seat = findSeat(id);
  seat.classList.add('selected');
  seat.setAttribute('aria-pressed', 'true');
});

// ---- Koltuk tıklama ----
document.querySelectorAll('.seat').forEach((seat) => {
  seat.addEventListener('click', () => {
    if (seat.classList.contains('occupied')) return;

    const id = seat.querySelector('.seat-number').textContent;
    const wasSelected = seat.classList.contains('selected');

    // YENİ: sınır doluysa yeni seçime izin verme
    if (!wasSelected && selectedSeats.length >= MAX_SEATS) return;

    const selected = !wasSelected;
    seat.classList.toggle('selected', selected);

    if (selected) {
      selectedSeats.push(id);
    } else {
      selectedSeats = selectedSeats.filter((s) => s !== id);
    }

    seat.setAttribute('aria-pressed', selected);
    render();
  });
});

// ---- Seçimleri kaldır ----
document.getElementById('clearSeats').addEventListener('click', () => {
  selectedSeats = [];

  document.querySelectorAll('.seat.selected').forEach((seat) => {
    seat.classList.remove('selected');
    seat.setAttribute('aria-pressed', 'false');
  });

  try {
    localStorage.removeItem(KEY);
  } catch {
    /* önemli değil */
  }
  render();
});

// ---- Satın al ----
buyBtn.addEventListener('click', () => {
  if (!selectedSeats.length) return;

  save(selectedSeats);

  buyBtn.textContent = 'Kaydedildi';
  setTimeout(() => (buyBtn.textContent = 'Satın al'), 1500);
});

render();
