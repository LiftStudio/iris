"""LES PORTRAITS ÉCRITS (lot L-U, 23/10 ; spec § 4.5.16) — l'autre moitié de tools/portraits/outil.js.

    python -I tools/portraits/ecrire.py portraits.json assets/portraits/
        décode un JSON { id: dataURL WebP } (window.__portraits, ou { portraits, planche }) en <id>.webp ;
    python -I tools/portraits/ecrire.py --ecouter <port> assets/portraits/ [--planche tools/portraits/planche.webp]
        attend, sur 127.0.0.1:<port>, le POST de la page de l'outil (/tools/portraits/?envoyer=<port>), écrit les images
        (et la planche), répond, puis s'arrête.

Chaque image est vérifiée : en-tête RIFF/WEBP, 192 × 192, une couche alpha (VP8X avec le drapeau alpha, ou VP8L), au plus
30 Ko ; une image fautive n'est pas écrite. Sortie : une ligne par fichier, puis « OK <n> portraits » (code 0) ou les
fautes (code 1).
"""
import base64, http.server, json, os, struct, sys

TAILLE, MAX_OCTETS = 192, 30 * 1024
ATTENDUS = ['haythem', 'gabriel', 'imad', 'marcantoine', 'koji', 'djafar', 'ethan']


def decoder(url):
    if not isinstance(url, str) or not url.startswith('data:image/webp;base64,'):
        raise ValueError('pas une image WebP en data URL')
    return base64.b64decode(url.split(',', 1)[1])


def examiner(b):
    """(largeur, hauteur, alpha) d'un WebP, ou une exception."""
    if len(b) < 30 or b[0:4] != b'RIFF' or b[8:12] != b'WEBP':
        raise ValueError('en-tête RIFF/WEBP absent')
    morceau = b[12:16]
    if morceau == b'VP8X':
        drapeaux = b[20]
        l = 1 + int.from_bytes(b[24:27], 'little')
        h = 1 + int.from_bytes(b[27:30], 'little')
        return l, h, bool(drapeaux & 0x10)
    if morceau == b'VP8L':
        v = struct.unpack('<I', b[21:25])[0]
        return 1 + (v & 0x3FFF), 1 + ((v >> 14) & 0x3FFF), bool((v >> 28) & 1)
    if morceau == b'VP8 ':
        l, h = struct.unpack('<HH', b[26:30])
        return l & 0x3FFF, h & 0x3FFF, False
    raise ValueError('morceau WebP inconnu : %r' % morceau)


def ecrire(donnees, dossier, planche=None):
    portraits = donnees.get('portraits', donnees) if isinstance(donnees, dict) else {}
    os.makedirs(dossier, exist_ok=True)
    fautes, n = [], 0
    for ident in ATTENDUS:
        if ident not in portraits:
            fautes.append('%s : absent' % ident)
            continue
        try:
            b = decoder(portraits[ident])
            l, h, alpha = examiner(b)
            print('%-12s %6d octets  %dx%d  alpha %s' % (ident, len(b), l, h, 'oui' if alpha else 'NON'))
            ko = [] if (l, h) == (TAILLE, TAILLE) else ['%dx%d (192x192 attendu)' % (l, h)]
            if not alpha:
                ko.append('sans couche alpha')
            if len(b) > MAX_OCTETS:
                ko.append('%d octets (30 Ko au plus)' % len(b))
            if ko:
                # (une image fautive n'écrase jamais la bonne qui est déjà dans assets/portraits/)
                fautes.append('%s : %s (non ecrit)' % (ident, ', '.join(ko)))
                continue
            with open(os.path.join(dossier, ident + '.webp'), 'wb') as f:
                f.write(b)
            n += 1
        except Exception as e:  # noqa: BLE001 (une image abîmée est une faute, pas un arrêt)
            fautes.append('%s : %s' % (ident, e))
    if planche and isinstance(donnees, dict) and donnees.get('planche'):
        try:
            b = decoder(donnees['planche'])
            os.makedirs(os.path.dirname(planche) or '.', exist_ok=True)
            with open(planche, 'wb') as f:
                f.write(b)
            print('planche      %6d octets  -> %s' % (len(b), planche))
        except Exception as e:  # noqa: BLE001
            fautes.append('planche : %s' % e)
    if fautes:
        print('FAUTES :\n  ' + '\n  '.join(fautes))
        return 1
    print('OK %d portraits' % n)
    return 0


def ecouter(port, dossier, planche):
    resultat = {}

    class Recepteur(http.server.BaseHTTPRequestHandler):
        def _entetes(self, code):
            self.send_response(code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()

        def do_OPTIONS(self):  # noqa: N802 (nom imposé par http.server)
            # (un pré-vol, si un navigateur en envoyait un : ses en-têtes AVANT la fin des en-têtes)
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

        def do_POST(self):  # noqa: N802
            n = int(self.headers.get('Content-Length') or 0)
            try:
                donnees = json.loads(self.rfile.read(n).decode('utf-8'))
                resultat['code'] = ecrire(donnees, dossier, planche)
                self._entetes(200)
                self.wfile.write(('écrits : code %d' % resultat['code']).encode('utf-8'))
            except Exception as e:  # noqa: BLE001
                resultat['code'] = 1
                self._entetes(400)
                self.wfile.write(('refusé : %s' % e).encode('utf-8'))

        def log_message(self, *a):
            pass

    serveur = http.server.HTTPServer(('127.0.0.1', port), Recepteur)
    print("en attente de la page de l'outil sur 127.0.0.1:%d..." % port, flush=True)
    while 'code' not in resultat:
        serveur.handle_request()
    serveur.server_close()
    return resultat['code']


def principal(args):
    planche = None
    if '--planche' in args:
        i = args.index('--planche')
        planche = args[i + 1]
        del args[i:i + 2]
    if len(args) == 3 and args[0] == '--ecouter':
        return ecouter(int(args[1]), args[2], planche)
    if len(args) == 2:
        with open(args[0], encoding='utf-8') as f:
            return ecrire(json.load(f), args[1], planche)
    print(__doc__)
    return 2


if __name__ == '__main__':
    sys.exit(principal(sys.argv[1:]))
