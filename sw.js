const CACHE_NAME = 'projeto-familiar-v13'; 
const DINAMICO_CACHE = 'devocionais-dinamicos-v1';

// 1. ARQUIVOS PARA BAIXAR IMEDIATAMENTE (OFFLINE TOTAL)
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
  './rv60.json',
  // Inserindo os devocionais 01 a 03 para garantir download offline imediato
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_001.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_002.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_003.json'
];

// Instalação: Baixa tudo o que está na lista acima
self.addEventListener('install', event => {
  console.log('[SW] Instalando Versão V13 (Familiar)...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache fixo preenchido com bíblias e devocionais 01-03');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa versões antigas para não ocupar memória do celular da família
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DINAMICO_CACHE) {
            console.log('[SW] Removendo cache obsoleto:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ESTRATÉGIA DE BUSCA INTELIGENTE
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Lógica para os Devocionais (Novos e Antigos)
  if (url.includes('Devocional_Diario/devocional_')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Se tiver internet, baixa o novo e salva no cache dinâmico
          return caches.open(DINAMICO_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Se estiver offline, tenta achar no cache (estático ou dinâmico)
          return caches.match(event.request);
        })
    );
  } else {
    // Para Bíblia e Interface: Usa o cache primeiro para ser instantâneo
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
