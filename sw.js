const CACHE_NAME = 'plano-bienal-v1';

// Arquivos que o celular baixa "invisivelmente" assim que instala
const assets = [
  './',
  './index.html',
  './manifest.json',
  './assets/icone.png',
  './assets/icone_abertura.png',
  './assets/icone_tela.png',
  './assets/icone_titulo_devocional.png',
  './acf.json',
  './kja.json',
  './kjv.json',
  './nvi.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_001.json'
];

// MANTENHA O INSTALL (Ele baixa a Bíblia e o Layout)
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando recursos fixos...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

// MANTENHA O ACTIVATE (Ele limpa lixo de versões antigas)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== 'devocionais-dinamicos') {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ESTE É O NOVO FETCH (A inteligência para os devocionais novos)
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Se o App estiver pedindo um devocional (Ex: 002, 003...)
  if (url.includes('Devocional_Diario/devocional_')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Se tiver internet e o arquivo existir no GitHub, salva no cache novo
          return caches.open('devocionais-dinamicos').then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Se estiver offline, entrega o que estiver guardado
          return caches.match(event.request);
        })
    );
  } else {
    // Para Bíblia e Layout, usa o cache principal
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
