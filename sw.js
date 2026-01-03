const CACHE_NAME = 'plano-bienal-v1';

// Lista de arquivos para salvar no celular do usuário
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
  './nvi.json'
];

// Instalação do Service Worker: Salva os arquivos no Cache
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando: PLANO BIENAL DE LEITURA BÍBLICA & DEVOCIONAL');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Ativação: Limpa caches antigos se você atualizar a versão
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Estratégia de Busca: Tenta o Cache primeiro, se não tiver, busca na rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
