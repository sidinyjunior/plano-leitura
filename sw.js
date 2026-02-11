/**

 * SERVICE WORKER - PLANO BIENAL DE LEITURA BÍBLICA & DEVOCIONAL
 * Objetivo: Garantir bíblias e devocionais disponíveis 100% Offline
 
 */

const CACHE_NAME = 'PLANO BIENAL DE LEITURA BÍBLICA & DEVOCIONAL'; 
const DINAMICO_CACHE = 'VERSAO_V28';

// 1. ARQUIVOS PARA BAIXAR IMEDIATAMENTE (CACHE ESTRUTURAL + CONTEÚDO INICIAL)
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
  
  // Devocionais postados no GitHub (Download Automático para Offline)
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_001.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_002.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_003.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_004.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_005.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_006.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_007.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_008.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_009.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_010.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_011.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_012.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_013.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_014.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_015.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_016.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_017.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_018.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_019.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_020.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_021.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_022.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_023.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_024.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_025.json',
  'https://raw.githubusercontent.com/sidinyjunior/plano-leitura/main/Devocional_Diario/devocional_025.json'
];

// EVENTO DE INSTALAÇÃO: Acontece quando o app é aberto pela primeira vez ou quando a versão muda
self.addEventListener('install', event => {
  console.log('[SW] Instalando Versão V14 (Projeto Familiar)...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Sucesso: Bíblias e Devocionais (01 ao 05) salvos para uso Offline.');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // Força o novo Service Worker a assumir o controle na hora
});

// EVENTO DE ATIVAÇÃO: Limpa o lixo de versões antigas (V13, V12, etc)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DINAMICO_CACHE) {
            console.log('[SW] Removendo cache obsoleto para liberar espaço:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ESTRATÉGIA DE BUSCA (FETCH): O segredo da velocidade e do funcionamento offline
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Lógica para Devocionais: Tenta baixar o mais novo, se falhar, usa o que está no bolso (cache)
  if (url.includes('Devocional_Diario/devocional_')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Se houver internet, atualiza o cache com a versão do GitHub
          return caches.open(DINAMICO_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Se estiver sem internet, entrega o que foi baixado anteriormente
          return caches.match(event.request);
        })
    );
  } else {
    // Para o restante do App (Bíblias, Imagens e Layout):
    // Prioriza o Cache (Instantâneo). Se não achar, busca na rede.
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
