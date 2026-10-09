"""Le logo d'IRIS partout où le jeu se présente : icônes, favicon, logo de l'écran de chargement.

    python tools/icones.py

Dépendance : Pillow. Tout se refait d'une commande, à relancer dès que le logo change.

LE LOGO : le mot « iris » en minuscules, dans une police géométrique (Century Gothic gras, C:/Windows/Fonts/GOTHICB.TTF ;
à défaut Segoe UI gras, puis la police par défaut de Pillow), en NOIR sur une plaque JAUNE — le jaune orangé des murs
de l'école (#f0a417, photos 02 à 05) et l'enseigne en minuscules de l'entrée (photo 08). Simple et propre : pas de
dégradé, pas d'effet. Le logo de LA CAGE n'y est plus.

Ce qu'il fabrique :
  assets/icons/
    icon-16.png, icon-32.png, favicon.ico (16 + 32 + 48)   la plaque jaune aux coins arrondis, « iris » au plus large
    icon-152.png, icon-167.png (iPad), icon-180.png (iPhone, apple-touch-icon), icon-192.png, icon-512.png
                                                          carré jaune plein (iOS arrondit lui-même les coins)
    icon-maskable-192.png, icon-maskable-512.png          le mot dans la zone sûre (cercle de 80 %) sur le jaune
  assets/chargement/
    logo_iris.webp   480 x 300, transparent autour de la plaque : le logo de l'écran de chargement (index.html, #boot).
                     Il sert aussi de MASQUE au reflet qui passe dessus (.boot-reflet) : la plaque doit donc être
                     opaque et nette, le reste vraiment transparent.

Chaque image est dessinée 4 fois plus grande puis réduite (Lanczos) : des bords lisses sans flou.
"""
import os
from PIL import Image, ImageDraw, ImageFont

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONES = os.path.join(RACINE, 'assets', 'icons')
CHARGEMENT = os.path.join(RACINE, 'assets', 'chargement')

JAUNE = (240, 164, 23)    # #f0a417, le jaune des murs de l'école
NOIR = (14, 14, 16)
MOT = 'iris'
SUR = 4                   # suréchantillonnage

POLICES = [r'C:\Windows\Fonts\GOTHICB.TTF', r'C:\Windows\Fonts\GOTHIC.TTF', r'C:\Windows\Fonts\segoeuib.ttf',
           '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']


def police(taille):
    for p in POLICES:
        if os.path.exists(p):
            return ImageFont.truetype(p, taille)
    print('  (aucune police géométrique trouvée : police par défaut de Pillow)')
    return ImageFont.load_default()


def mot_centre(draw, w, h, largeur_max, hauteur_max, cx=None, cy=None):
    """Écrit « iris » centré, aussi grand que possible dans largeur_max x hauteur_max (pixels de l'image)."""
    cx = w / 2 if cx is None else cx
    cy = h / 2 if cy is None else cy
    t = 400
    f = police(t)
    x0, y0, x1, y1 = draw.textbbox((0, 0), MOT, font=f)
    k = min(largeur_max / (x1 - x0), hauteur_max / (y1 - y0))
    f = police(max(4, int(t * k)))
    x0, y0, x1, y1 = draw.textbbox((0, 0), MOT, font=f)
    # centré sur la boîte de l'encre (les points des « i » compris) : le mot tombe au milieu de la plaque à l'œil
    draw.text((cx - (x0 + x1) / 2, cy - (y0 + y1) / 2), MOT, font=f, fill=NOIR)


def plaque(taille, rayon=0.0, marge=0.0, mot=0.72, fond=None):
    """Carré `taille` px : plaque jaune (coins arrondis de `rayon` x taille, retrait `marge`), le mot sur `mot` de sa largeur."""
    S = taille * SUR
    im = Image.new('RGBA', (S, S), fond or (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m = marge * S
    d.rounded_rectangle([m, m, S - 1 - m, S - 1 - m], radius=rayon * S, fill=JAUNE + (255,))
    l = (S - 2 * m) * mot
    mot_centre(d, S, S, l, l * 0.62)
    return im.resize((taille, taille), Image.LANCZOS)


def sauver(im, chemin, **opts):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    im.save(chemin, **opts)
    print(f'  {os.path.relpath(chemin, RACINE)}  ({os.path.getsize(chemin) // 1024 or 1} Ko)')


def main():
    print('IRIS : icônes et logo')
    # petites icônes (onglet du navigateur) : la plaque arrondie, le mot au plus large
    petites = {n: plaque(n, rayon=0.22, mot=0.86) for n in (16, 32, 48)}
    sauver(petites[16], os.path.join(ICONES, 'icon-16.png'), optimize=True)
    sauver(petites[32], os.path.join(ICONES, 'icon-32.png'), optimize=True)
    sauver(petites[48], os.path.join(ICONES, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

    # écran d'accueil (iPhone, iPad, PWA) : carré jaune plein et opaque
    for n in (152, 167, 180, 192, 512):
        sauver(plaque(n, mot=0.7, fond=JAUNE + (255,)).convert('RGB'), os.path.join(ICONES, f'icon-{n}.png'), optimize=True)
    # maskable : le système découpe en rond ou en goutte ; le mot reste dans le cercle sûr de 80 %
    for n in (192, 512):
        sauver(plaque(n, mot=0.56, fond=JAUNE + (255,)).convert('RGB'), os.path.join(ICONES, f'icon-maskable-{n}.png'), optimize=True)

    # le logo de l'écran de chargement : 480 x 300, la plaque arrondie, transparent autour
    W, H = 480, 300
    S = SUR
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m = 10 * S
    d.rounded_rectangle([m, m, W * S - 1 - m, H * S - 1 - m], radius=46 * S, fill=JAUNE + (255,))
    mot_centre(d, W * S, H * S, (W - 2 * 10) * S * 0.74, (H - 2 * 10) * S * 0.62)
    sauver(im.resize((W, H), Image.LANCZOS), os.path.join(CHARGEMENT, 'logo_iris.webp'), lossless=True, quality=100, method=6)


if __name__ == '__main__':
    main()
