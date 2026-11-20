(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia('(pointer: fine)').matches;

  // 1. Escritura del rol (una sola vez)
  var rol = document.getElementById('rol');
  var texto = rol.textContent;
  if (!reduce) {
    rol.textContent = '';
    var i = 0;
    var escribe = setInterval(function () {
      rol.textContent = texto.slice(0, ++i);
      if (i >= texto.length) { clearInterval(escribe); rol.classList.add('listo'); }
    }, 45);
  } else {
    rol.classList.add('listo');
  }

  // 2. Brillo que sigue el cursor
  var halo = document.getElementById('halo');
  if (fino && !reduce) {
    window.addEventListener('pointermove', function (e) {
      halo.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      halo.classList.add('activo');
    });
    document.addEventListener('pointerleave', function () { halo.classList.remove('activo'); });
  }

  // 3. Tarjetas que se inclinan con el mouse
  if (fino && !reduce) {
    document.querySelectorAll('[data-inclinable]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--ty', (x * 8).toFixed(2) + 'deg');
        c.style.setProperty('--tx', (-y * 8).toFixed(2) + 'deg');
      });
      c.addEventListener('pointerleave', function () {
        c.style.setProperty('--tx', '0deg');
        c.style.setProperty('--ty', '0deg');
      });
    });
  }

  // 4. Detalles desplegables de proyectos
  document.querySelectorAll('.caso .boton[aria-expanded]').forEach(function (b) {
    b.addEventListener('click', function () {
      var caso = b.closest('.caso');
      var abierto = caso.classList.toggle('abierto');
      b.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      b.textContent = abierto ? 'Cerrar detalle' : 'Ver detalle';
    });
  });

  // 5. Explicación de cada tecnología
  var explica = document.getElementById('explica');
  var botones = document.querySelectorAll('.nube button');
  botones.forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      botones.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      explica.textContent = b.getAttribute('data-uso');
    });
  });

  // 6. Cambio de tema claro / oscuro
  var tema = document.getElementById('tema');
  tema.addEventListener('click', function () {
    var html = document.documentElement;
    var claro = html.getAttribute('data-theme') === 'light';
    html.setAttribute('data-theme', claro ? 'dark' : 'light');
    tema.textContent = claro ? '☾' : '☀';
  });

  // 7. Copiar correo
  var copiar = document.getElementById('copiar');
  copiar.addEventListener('click', function () {
    var correo = copiar.getAttribute('data-correo');
    var marcar = function (txt) {
      copiar.textContent = txt;
      copiar.classList.add('ok');
      setTimeout(function () {
        copiar.textContent = 'Copiar correo';
        copiar.classList.remove('ok');
      }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(correo).then(function () {
        marcar('¡Correo copiado!');
      }, function () {
        marcar(correo);
      });
    } else {
      marcar(correo);
    }
  });

  // 8. Resaltar la sección activa en la barra
  var enlaces = document.querySelectorAll('.barra a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          enlaces.forEach(function (a) {
            a.classList.toggle('activa', a.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(function (s) { obs.observe(s); });
  }

  // 9. Lluvia de código
  var canvas = document.getElementById('lluvia');
  var ctx = canvas.getContext('2d');
  var botonLluvia = document.getElementById('lluvia-btn');
  var simbolos = '01{}<>;=()/+*#&$:[]ab cdefhjkmnpqrstuvwxyz'.split('');
  var tam = 16;
  var columnas = [];
  var lluviaActiva = false;
  var ultimo = 0;

  function ajustar() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.floor(window.innerWidth / tam);
    columnas = [];
    for (var c = 0; c < n; c++) {
      columnas.push({
        y: Math.random() * -window.innerHeight / tam,
        vel: .4 + Math.random() * .9
      });
    }
  }

  function dibujar(t) {
    requestAnimationFrame(dibujar);
    if (!lluviaActiva || document.hidden) return;
    if (t - ultimo < 60) return;
    ultimo = t;
    var claro = document.documentElement.getAttribute('data-theme') === 'light';
    var color = claro ? '#1E7A57' : '#8BE0BC';
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = '600 ' + tam + 'px IBM Plex Mono, ui-monospace, Menlo, monospace';
    var alto = window.innerHeight;
    for (var c = 0; c < columnas.length; c++) {
      var col = columnas[c];
      var x = c * tam;
      var y = col.y * tam;
      ctx.fillStyle = color;
      ctx.globalAlpha = .9;
      ctx.fillText(simbolos[Math.floor(Math.random() * simbolos.length)], x, y);
      ctx.globalAlpha = .35;
      ctx.fillText(simbolos[Math.floor(Math.random() * simbolos.length)], x, y - tam);
      col.y += col.vel;
      if (y > alto && Math.random() > .975) {
        col.y = Math.random() * -20;
        col.vel = .4 + Math.random() * .9;
      }
    }
    ctx.globalAlpha = 1;
  }

  ajustar();
  window.addEventListener('resize', ajustar);
  if (!lluviaActiva) canvas.classList.add('apagada');
  botonLluvia.setAttribute('aria-pressed', lluviaActiva ? 'true' : 'false');
  botonLluvia.addEventListener('click', function () {
    lluviaActiva = !lluviaActiva;
    canvas.classList.toggle('apagada', !lluviaActiva);
    botonLluvia.setAttribute('aria-pressed', lluviaActiva ? 'true' : 'false');
    if (!lluviaActiva) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  });
  requestAnimationFrame(dibujar);

  // 12. Versión para empresas (impresión a PDF)
  var btnPdf = document.getElementById('btn-pdf');
  if (btnPdf) btnPdf.addEventListener('click', function () { window.print(); });

  // 11. Menú flotante en celular
  var barra = document.getElementById('barra');
  var menuBtn = document.getElementById('menu-btn');
  function alternarMenu(forzar) {
    var abrir = typeof forzar === 'boolean' ? forzar : !barra.classList.contains('abierta');
    barra.classList.toggle('abierta', abrir);
    menuBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    menuBtn.textContent = abrir ? '✕' : '☰';
  }
  menuBtn.addEventListener('click', function () { alternarMenu(); });
  barra.querySelectorAll('.enlaces a').forEach(function (a) {
    a.addEventListener('click', function () { alternarMenu(false); });
  });

  // 10. Música ambiente generada en el navegador (Web Audio)
  var botonMusica = document.getElementById('musica');
  var audio = null, master = null, timers = [], paso = 0;
  var acordes = [
    [261.63, 329.63, 392.00, 493.88], // Do mayor con séptima
    [220.00, 261.63, 329.63, 392.00], // La menor con séptima
    [174.61, 220.00, 261.63, 329.63], // Fa mayor con séptima
    [196.00, 246.94, 293.66, 392.00]  // Sol
  ];
  var escala = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

  function tocarAcorde() {
    var t = audio.currentTime;
    var acorde = acordes[paso % acordes.length];
    var pianoNota = function (f, st, dur, vol) {
      var o = audio.createOscillator();
      var g = audio.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(vol, st + .01);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(g).connect(master);
      o.start(st);
      o.stop(st + dur + .05);
    };
    acorde.forEach(function (f, i) {
      pianoNota(f, t + i * .5, 3.4, .08);
      pianoNota(f * 2, t + i * .5, 1.8, .015);
    });
    paso++;
  }

  function tocarNota() {
    if (Math.random() > .55) return;
    var t = audio.currentTime;
    var o = audio.createOscillator();
    var g = audio.createGain();
    o.type = 'triangle';
    o.frequency.value = escala[Math.floor(Math.random() * escala.length)];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.05, t + .03);
    g.gain.linearRampToValueAtTime(0, t + 1.1);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 1.2);
  }

  function encenderMusica() {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      var filtro = audio.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.value = 1500;
      master = audio.createGain();
      master.gain.value = 0;
      master.connect(filtro).connect(audio.destination);
    }
    audio.resume();
    master.gain.cancelScheduledValues(audio.currentTime);
    master.gain.linearRampToValueAtTime(.7, audio.currentTime + 2);
    paso = 0;
    tocarAcorde();
    timers.push(setInterval(tocarAcorde, 4000));
    timers.push(setInterval(tocarNota, 1500));
  }

  function apagarMusica() {
    timers.forEach(clearInterval);
    timers = [];
    if (!audio) return;
    master.gain.cancelScheduledValues(audio.currentTime);
    master.gain.linearRampToValueAtTime(0, audio.currentTime + .6);
    setTimeout(function () { audio.suspend(); }, 700);
  }

  botonMusica.addEventListener('click', function () {
    var encendida = botonMusica.getAttribute('aria-pressed') === 'true';
    if (encendida) {
      apagarMusica();
      botonMusica.setAttribute('aria-pressed', 'false');
      botonMusica.textContent = '♪ Música';
    } else {
      encenderMusica();
      botonMusica.setAttribute('aria-pressed', 'true');
      botonMusica.textContent = '♪ Sonando';
    }
  });
})();