import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '6.4.34:1',
  releaseNotes: {
    en_US: `Requires StartOS 0.4.2 or later.

Chama now asks for a password before it opens. After updating, run the **Create UI Password** action (Chama does not start until you do), then sign in with username **admin** and that password when your browser asks. Your identity, settings and wallet are unchanged.`,
    es_ES: `Requiere StartOS 0.4.2 o posterior.

Chama ahora pide una contraseña antes de abrirse. Después de actualizar, ejecuta la acción **Crear contraseña de la interfaz** (Chama no se inicia hasta que lo hagas) e inicia sesión con el usuario **admin** y esa contraseña cuando tu navegador lo pida. Tu identidad, tus ajustes y tu monedero no cambian.`,
    de_DE: `Erfordert StartOS 0.4.2 oder neuer.

Chama fragt jetzt nach einem Passwort, bevor es sich öffnet. Führe nach dem Update die Aktion **UI-Passwort erstellen** aus (Chama startet erst danach) und melde dich mit dem Benutzernamen **admin** und diesem Passwort an, wenn dein Browser danach fragt. Deine Identität, Einstellungen und Wallet bleiben unverändert.`,
    pl_PL: `Wymaga StartOS 0.4.2 lub nowszego.

Chama prosi teraz o hasło przed otwarciem. Po aktualizacji uruchom akcję **Utwórz hasło interfejsu** (Chama nie uruchomi się, dopóki tego nie zrobisz), a gdy przeglądarka zapyta, zaloguj się nazwą użytkownika **admin** i tym hasłem. Twoja tożsamość, ustawienia i portfel pozostają bez zmian.`,
    fr_FR: `Nécessite StartOS 0.4.2 ou ultérieur.

Chama demande désormais un mot de passe avant de s'ouvrir. Après la mise à jour, lancez l'action **Créer le mot de passe de l'interface** (Chama ne démarre pas tant que ce n'est pas fait), puis connectez-vous avec le nom d'utilisateur **admin** et ce mot de passe quand votre navigateur le demande. Votre identité, vos réglages et votre portefeuille ne changent pas.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
