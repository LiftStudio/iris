"""Serveur local d'IRIS (http://localhost:8124) : comme `python -m http.server` mais les fichiers .js/.json/.html
sont revalidés à chaque requête (sinon le navigateur garde d'anciens modules ES ou clips après une modification)."""
import http.server, os, socket, socketserver, sys

# Le port : l'argument de ligne de commande d'abord (Lancer.bat passe 8124), sinon la variable
# d'environnement PORT, sinon 8124 (LA CAGE garde le 8123 : les deux jeux tournent en même temps). La variable sert aux lanceurs qui choisissent eux-memes un port
# libre : sans elle, deux serveurs se disputaient le même port et le second ne demarrait pas.
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT') or 8124)
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # tout est revalidé à chaque requête (If-Modified-Since -> 304 si inchangé) : un clip .glb ou un module modifié
        # est rechargé à coup sûr, sans re-télécharger les gros fichiers inchangés
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):  # silencieux (le terminal de Lancer.bat reste lisible)
        pass


# IPv6 ET IPv4 sur le même port (06/10/2026). Le navigateur résout « localhost » en ::1 d'abord : un serveur qui
# n'écoute qu'en IPv4 lui fait attendre ~300 ms avant de se rabattre sur 127.0.0.1, À CHAQUE connexion — mesuré : les
# modules du jeu arrivaient en 7,5 s au lieu de 0,8 s, et l'écran de chargement piétinait. Sans IPv6 sur la machine, on reste en IPv4 comme avant.
class Serveur(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


class Serveur6(Serveur):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


try:
    httpd = Serveur6(('::', PORT), Handler) if socket.has_ipv6 else Serveur(('', PORT), Handler)
except OSError:
    httpd = Serveur(('', PORT), Handler)
with httpd:
    print(f'IRIS : http://localhost:{PORT}  (Ctrl+C pour arrêter)')
    httpd.serve_forever()
