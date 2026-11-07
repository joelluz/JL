/* ===========================================================
   EDITA AQUÍ LOS DATOS DE TU INVITACIÓN
   =========================================================== */
const CONFIG = {
  novios: 'Joel y Luz',
  // Perú UTC-05:00. La hora 15:30 significa 3:30 p. m.
  fechaISO: '2026-12-26T15:30:00-05:00',
  finISO: '2026-12-26T23:00:00-05:00', // solo para calendario
  // ESCRIBE TU NÚMERO PERUANO, con código 51, sin + ni espacios.
  // Ejemplo ficticio de formato: '519XXXXXXXX'. Déjalo vacío para probar.
  // El número se conserva tal como fue proporcionado. Para abrir wa.me debe incluir 51 delante.
  whatsappConfirmaciones: '51952349829',
  // Reemplaza estos enlaces por ubicaciones precisas de Google Maps si las tienes.
  mapsIglesia: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Parroquia San José Misericordioso Tacna Perú'),
  mapsRecepcion: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('La Gran Reserva Santa Elena Av. Los Viñedos D-4 Pago Peschay Pocollay Tacna Perú'),
  // Fotos de muestra. Para tus fotos escribe 'assets/foto1.jpg', etc.
  fotoPortada: 'assets/portada.jpg',
  fotos: ['assets/foto1.jpg', 'assets/foto2.jpg', 'assets/foto3.jpg', 'assets/foto4.jpg'],
  musica: 'assets/kane.mp3', // opcional: agrega tu archivo de audio,
  video: 'assets/video-demo.mp4' // opcional: agrega tu video
};

const $ = s => document.querySelector(s);
const on = (element, event, handler) => {
  if (element) element.addEventListener(event, handler);
};
const music = $('#bgMusic');
const toggle = $('#musicToggle');
const video = $('#ourVideo');
const toast = $('#toast');
let toastTimer;
const showToast = message => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
};

// Asigna las rutas de fotos, música y video desde CONFIG.
document.documentElement.style.setProperty('--hero-photo', `url('${CONFIG.fotoPortada}')`);
if ($('.hero')) $('.hero').style.backgroundImage = `url('${CONFIG.fotoPortada}')`;
document.querySelectorAll('[data-photo]').forEach((img, index) => {
  img.src = CONFIG.fotos[index] || CONFIG.fotos[0];
  img.onerror = () => { img.alt = 'Agrega tu fotografía en assets'; img.style.opacity = '.25'; };
});
if (music) music.src = CONFIG.musica;
if (video) {
  const videoSource = video.querySelector('source');
  if (videoSource) videoSource.src = CONFIG.video;
  video.poster = CONFIG.fotoPortada;
  video.load();
}
if ($('#churchMap')) $('#churchMap').href = CONFIG.mapsIglesia;
if ($('#receptionMap')) $('#receptionMap').href = CONFIG.mapsRecepcion;

// En móviles, la música comienza al abrir la invitación, tras un toque del usuario.
async function playMusic() {
  if (!music || !music.getAttribute('src')) { showToast('Agrega tu música en la carpeta assets.'); return; }
  try { music.volume = .35; await music.play(); toggle.classList.add('playing'); $('#musicText').textContent = 'Pausar'; toggle.setAttribute('aria-label','Pausar música'); }
  catch { toggle.classList.remove('playing'); $('#musicText').textContent = 'Música'; showToast('Toca el botón ♫ para activar la música.'); }
}
function pauseMusic() { music.pause(); toggle.classList.remove('playing'); $('#musicText').textContent = 'Música'; toggle.setAttribute('aria-label','Activar música'); }
on($('#openInvite'), 'click', () => {
  $('#intro').classList.add('hidden');
  document.body.classList.remove('locked');
  playMusic();
  setTimeout(() => $('#intro').setAttribute('aria-hidden', 'true'), 900);
});
on(toggle, 'click', () => music && (music.paused ? playMusic() : pauseMusic()));
// Al reproducir un video, detener la música para evitar que se superpongan.
on(video, 'play', () => { if (music && !music.paused) pauseMusic(); });

// Cuenta regresiva con huso horario explícito de Perú.
const date = new Date(CONFIG.fechaISO).getTime();
function updateCountdown() {
  const diff = Math.max(0, date - Date.now());
  $('#days').textContent = Math.floor(diff/86400000);
  $('#hours').textContent = String(Math.floor(diff/3600000)%24).padStart(2,'0');
  $('#minutes').textContent = String(Math.floor(diff/60000)%60).padStart(2,'0');
  $('#seconds').textContent = String(Math.floor(diff/1000)%60).padStart(2,'0');
  if (diff === 0) $('#countdownMessage').textContent = '¡Nuestro gran día ha llegado!';
}
updateCountdown(); setInterval(updateCountdown,1000);




// Scroll reveal sin librerías.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
} else {document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}

// Generar evento .ics compatible con calendarios móviles.
function formatICS(iso) { return new Date(iso).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'); }
on($('#calendarBtn'), 'click', () => {
  const details = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Joel Luz//Invitacion//ES',
    'BEGIN:VEVENT','UID:joel-luz-20261226@invitacion',`DTSTAMP:${formatICS(new Date().toISOString())}`,
    `DTSTART:${formatICS(CONFIG.fechaISO)}`,`DTEND:${formatICS(CONFIG.finISO)}`,
    'SUMMARY:Boda de Joel y Luz',
    'LOCATION:Parroquia San José Misericordioso, Tacna, Perú',
    'DESCRIPTION:Ceremonia 3:30 p. m. Recepción en La Gran Reserva Santa Elena, Pocollay.',
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([details],{type:'text/calendar;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='boda-joel-y-luz.ics';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
});

// La web estática no guarda respuestas en servidores. En su lugar abre WhatsApp.
on($('#rsvpForm'), 'submit', async event => {
  event.preventDefault();
  const name = $('#guestName').value.trim();
  const attendance = $('#attendance').value;
  const note = $('#note').value.trim();
  if (!name || !attendance) return;
  const msg = `💍 *Boda de Joel y Luz*\n\nHola, soy *${name}*.\nConfirmación: *${attendance}*.${note ? `\nMensaje: ${note}` : ''}\n\n¡Gracias por la invitación!`;
  if (!/^\d{10,15}$/.test(CONFIG.whatsappConfirmaciones)) {
    try { await navigator.clipboard.writeText(msg); showToast('Confirmación copiada. Configura whatsappConfirmaciones en script.js para enviarla directamente.'); }
    catch { showToast('Configura el número de WhatsApp en script.js para activar la confirmación.'); }
    return;
  }
  window.open(`https://wa.me/${CONFIG.whatsappConfirmaciones}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
});

on($('#shareBtn'), 'click', async () => {
 const data={title:'Boda de Joel y Luz',text:'¡Estás invitado a nuestra boda el 26 de diciembre de 2026! 💍',url:location.href};
 if(navigator.share){try{await navigator.share(data);return}catch(e){if(e.name==='AbortError')return;}}
 try{await navigator.clipboard.writeText(location.href);showToast('¡Enlace copiado para enviarlo por WhatsApp!');}catch{showToast('Copia la dirección de esta página y compártela.');}
});


// DETALLES INTERACTIVOS · GALERÍA, ACCESIBILIDAD Y PROGRESO
const progress = $('#pageProgress');
let scrollPending = false;
function paintScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  scrollPending = false;
}
on(window, 'scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(paintScrollProgress); } }, { passive: true });
paintScrollProgress();
const galleryImages = [...document.querySelectorAll('#gallery img')];
const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImage');
let activePhoto = 0;
let previousFocus = null;
function showPhoto(index) {
  if (!galleryImages.length) return;
  activePhoto = (index + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[activePhoto].src;
  lightboxImg.alt = galleryImages[activePhoto].alt;
  $('#lightboxCounter').textContent = `${activePhoto + 1} / ${galleryImages.length}`;
}
function openPhoto(index) {
  previousFocus = document.activeElement;
  showPhoto(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#lightboxClose').focus();
}
function closePhoto() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (previousFocus && previousFocus.focus) previousFocus.focus();
}
galleryImages.forEach((img, index) => {
  const figure = img.closest('figure');
  figure.setAttribute('tabindex', '0');
  figure.setAttribute('role', 'button');
  figure.setAttribute('aria-label', `Ampliar fotografía ${index + 1}`);
  on(figure, 'click', () => openPhoto(index));
  on(figure, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhoto(index); } });
});
on($('#lightboxClose'), 'click', closePhoto);
on($('#lightboxPrev'), 'click', () => showPhoto(activePhoto - 1));
on($('#lightboxNext'), 'click', () => showPhoto(activePhoto + 1));
on(lightbox, 'click', e => { if (e.target === lightbox) closePhoto(); });
on(document, 'keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closePhoto();
  if (e.key === 'ArrowRight') showPhoto(activePhoto + 1);
  if (e.key === 'ArrowLeft') showPhoto(activePhoto - 1);
  if (e.key === 'Tab') {
    const controls = [$('#lightboxClose'), $('#lightboxPrev'), $('#lightboxNext')];
    const idx = controls.indexOf(document.activeElement);
    if (e.shiftKey && idx <= 0) { e.preventDefault(); controls[controls.length - 1].focus(); }
    else if (!e.shiftKey && idx === controls.length - 1) { e.preventDefault(); controls[0].focus(); }
  }
});
// Evitar mostrar video vacío como error de reproducción si aún no se ha añadido.
if (video) on(video, 'error', () => { video.setAttribute('title', 'Agrega tu video en assets/video-demo.mp4'); });
