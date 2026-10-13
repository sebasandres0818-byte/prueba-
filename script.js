// Solo maneja el menú y el carrito. Los textos, precios y fotos se editan en index.html
var tel = document.body.dataset.whatsapp, cart = {};
try { cart = JSON.parse(localStorage.getItem('cv_cart') || '{}'); } catch (e) {}
function $(s) { return document.querySelector(s); }
function money(n) { return '$' + Number(n).toFixed(2); }
function save() { try { localStorage.setItem('cv_cart', JSON.stringify(cart)); } catch (e) {} }
function aviso(m) { var t = $('#aviso'); t.textContent = m; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1400); }

// Copia automática: ofertas -> Inicio, primeras 4 fotos de la galería -> Inicio
document.querySelectorAll('#tienda .producto[data-oferta]').forEach(function (p) { $('#ofertas').appendChild(p.cloneNode(true)); });
if (!$('#ofertas').children.length) $('#ofertas').innerHTML = '<p>Pronto habrá ofertas.</p>';
Array.prototype.slice.call(document.querySelectorAll('#galeria .item'), 0, 4).forEach(function (g) { $('#galeria-inicio').appendChild(g.cloneNode(true)); });

// Prepara cada producto: precio, etiqueta de oferta y botón
document.querySelectorAll('.producto').forEach(function (p) {
  var precio = +p.dataset.precio, antes = +p.dataset.oferta || 0;
  p.querySelector('.precio').innerHTML = (antes ? '<s>' + money(antes) + '</s>' : '') + money(precio);
  if (antes) { var e = document.createElement('span'); e.className = 'etiqueta'; e.textContent = 'Oferta'; p.querySelector('.imagen').appendChild(e); }
  p.querySelector('button').onclick = function () { var n = p.dataset.nombre; cart[n] = cart[n] || { p: precio, q: 0 }; cart[n].q++; save(); draw(); aviso('Añadido al carrito ✓'); };
});

function cambiar(n, d) { cart[n].q += d; if (cart[n].q <= 0) delete cart[n]; save(); draw(); }
function vaciar() { cart = {}; save(); draw(); }
function total() { return Object.keys(cart).reduce(function (a, n) { return a + cart[n].p * cart[n].q; }, 0); }
function pedir() {
  if (!total()) return aviso('Tu carrito está vacío');
  var m = 'Hola, soy ' + ($('#nombre').value || 'un cliente') + '. Quiero pedir:\n';
  Object.keys(cart).forEach(function (n) { m += '• ' + cart[n].q + ' x ' + n + '\n'; });
  m += 'Total: ' + money(total()) + ($('#nota').value ? '\nNota: ' + $('#nota').value : '');
  window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(m), '_blank');
}
function draw() {
  var ns = Object.keys(cart);
  $('#contador').textContent = ns.reduce(function (a, n) { return a + cart[n].q; }, 0);
  $('#items').innerHTML = ns.length ? ns.map(function (n, i) {
    return '<div class="fila"><div><b>' + n.replace(/</g, '&lt;') + '</b><br>' + money(cart[n].p) + '</div><div class="cantidad"><button data-n="' + i + '" data-d="-1">−</button>' + cart[n].q + '<button data-n="' + i + '" data-d="1">+</button></div></div>';
  }).join('') : '<p>Aún no has añadido productos.</p>';
  document.querySelectorAll('.cantidad button').forEach(function (b) { b.onclick = function () { cambiar(ns[b.dataset.n], +b.dataset.d); }; });
  $('#total').textContent = 'Total: ' + money(total());
}

// Menú: muestra una sección según el enlace (#inicio, #tienda, #galeria, #contacto, #carrito)
function mostrar() {
  var v = location.hash.slice(1); if (!$('#' + v) || !$('#' + v).classList.contains('vista')) v = 'inicio';
  document.querySelectorAll('.vista').forEach(function (s) { s.classList.toggle('activa', s.id === v); });
  document.querySelectorAll('nav a').forEach(function (a) { a.classList.toggle('activo', a.getAttribute('href') === '#' + v); });
  scrollTo(0, 0);
}
window.onhashchange = mostrar; mostrar(); draw();
