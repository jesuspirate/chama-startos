import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '6.4.34:2',
  releaseNotes: {
    en_US:
      "Chama's wallet now answers only Chama's own page: requests to it from other websites are refused.",
    es_ES:
      'El monedero de Chama ahora responde solo a la propia página de Chama: se rechazan las solicitudes que le llegan desde otros sitios web.',
    de_DE:
      'Die Wallet von Chama antwortet jetzt nur noch der eigenen Seite von Chama: Anfragen von anderen Websites werden abgelehnt.',
    pl_PL:
      'Portfel Chama odpowiada teraz tylko własnej stronie Chama: żądania z innych stron internetowych są odrzucane.',
    fr_FR:
      "Le portefeuille de Chama ne répond désormais qu'à la page de Chama elle-même : les requêtes provenant d'autres sites web sont refusées.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
