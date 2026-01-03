const CACHE_NAME = 'plano-bienal-v2'; // Mudei para V2 para forçar a atualização dos ícones
const DINAMICO_CACHE = 'devocionais-dinamicos-v1';

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

// Instalação: Salva a nova Bíblia e Layout (V2)
self.addEventListener('install', event => {
  console.log('[SW] Instalando Versão V2...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
  self.skipWaiting(); // Força o novo SW a assumir o controle imediatamente
});

// Ativação: Apaga o cache da V1 antigo para liberar espaço
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DINAMICO_CACHE) {
            console.log('[SW] Apagando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Busca Inteligente
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Lógica para os Devocionais (Baixa e Salva se houver internet)
  if (url.includes('Devocional_Diario/devocional_')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(DINAMICO_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Para o resto do App (Bíblia/Layout), usa o cache fixo da V2
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
