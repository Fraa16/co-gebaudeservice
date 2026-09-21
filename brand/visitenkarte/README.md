# Visitenkarte

Erzeugt aus denselben Daten, aus denen die Website rendert:

```
node scripts/build-business-card.mjs
```

Name, Telefonnummer, Anschrift und die acht Leistungen stehen nirgends in diesem
Ordner als Text — sie kommen aus `src/data/content.json` und `src/data/services.ts`.
Eine Karte mit eigener Kopie der Telefonnummer ist genau der Fehler, gegen den auf der
Website `contactRoutes` eingeführt wurde, nur auf Papier, wo er sich nicht mehr
korrigieren lässt.

## Zwei Layouts zur Auswahl

Siehe `vergleich.png`.

**A — Karte auf Grund** (`visitenkarte-karten-druck.pdf`) — **die Empfehlung.**
Eine gerundete Karte schwebt auf dem Website-Grund, der Grund bleibt als schmaler
Rahmen sichtbar. Das ist die Struktur der Website selbst: sie ist nicht eine runde
Fläche, sondern Karten auf `--co-page`. Kostet bei der Druckerei nichts extra.

Dazu ein praktischer Vorteil, der nichts mit Gestaltung zu tun hat: die dunkle Seite
läuft nicht mehr bis an den Rand. Bei randabfallendem Dunkel zeigt schon ein halber
Millimeter Schnittversatz einen weißen Streifen an der Kante, und abgegriffene Ecken
werden später hell. Beides kann hier nicht passieren.

**B — flächig bis zum Rand** (`visitenkarte-flaechig-druck.pdf`).
Farbe bis an die Schnittkante. Zur runden Formensprache der Website wird das erst mit
**gestanzten Ecken** — siehe `ecken-gestanzt.png`, dort mit 3 mm Radius dargestellt.
Die meisten deutschen Online-Druckereien bieten das an, gegen Aufpreis und mit
längerer Produktionszeit.

A und Stanzung zusammen wäre doppelt gemoppelt: dann rahmt eine runde Karte eine runde
Karte. Eins von beidem.

## Dateien

| Datei | Wofür |
|---|---|
| `visitenkarte-karten-druck.pdf` | **Druckdatei Variante A.** 2 Seiten, 91 × 61 mm |
| `visitenkarte-flaechig-druck.pdf` | Druckdatei Variante B |
| `karten-vorne.png` / `karten-hinten.png` | 300 dpi, auf Endformat beschnitten |
| `flaechig-vorne.png` / `flaechig-hinten.png` | dasselbe für B |
| `karten-kontrolle.png` / `flaechig-kontrolle.png` | mit Schnittkante und Sicherheitsabstand |
| `ecken-gestanzt.png` | B mit 3 mm gestanzten Ecken |
| `vergleich.png` | alles nebeneinander |

## Was die Druckerei wissen muss

- **Endformat 85 × 55 mm** (deutsches Standardformat).
- **3 mm Beschnitt umlaufend**, deshalb 91 × 61 mm Seitengröße. Keine Schnittmarken —
  so wollen es Flyeralarm, WIRmachenDRUCK und die meisten anderen Online-Druckereien.
- **Sicherheitsabstand 4 mm** ab Schnittkante, wird eingehalten.
- 2 Seiten: Seite 1 vorne, Seite 2 hinten.
- Empfehlung: 350 g/m², matt. Auf Naturpapier wird das Navy deutlich flauer.
- Für B zusätzlich: gestanzte Ecken, Radius 3 mm — falls gewünscht.

## Farbe — der eine Punkt, der Aufmerksamkeit braucht

**Die Datei ist RGB, nicht CMYK.** Die Druckerei konvertiert gegen das Profil des
Papiers; anders geht es nicht sinnvoll, weil die Umrechnung vom Bedruckstoff abhängt.

Wichtig dabei: `#010E40` ist ein sehr dunkles, gesättigtes Blau. Im Vierfarbdruck
verliert es Tiefe, auf ungestrichenem Papier sichtbar. Wer das vermeiden will, lässt
das Navy als **Sonderfarbe** drucken oder bittet um einen **Proof** vor der Auflage.
Beides kostet extra und lohnt erst ab größeren Mengen.

Das Navy ist bewusst `#010E40` (der Wert aus der Logodatei) und nicht `--co-ink`
`#03045E` der Website. Auf der Karte liegt das Logo direkt auf dieser Fläche — das ist
die eine Situation, in der die beiden Blautöne als Fehler gelesen würden. Begründung in
`brand/README.md`.

## QR-Code

Zeigt auf `https://co-gebaeudeservice.de`. 29 × 29 Module à 0,41 mm, also über der
0,4-mm-Grenze, die Druckereien als Minimum angeben. Fehlerkorrektur M.

Das weiße Feld hinter dem Code ist keine Dekoration, sondern die **Ruhezone**, und die
Spezifikation verlangt dafür vier Module auf jeder Seite. Von Hand gesetzt waren es
2,7 — sauber dekodierbar aus der Renderdatei und nicht mehr dekodierbar, sobald das
Bild abgewertet wurde. Das wäre auf gedruckten Karten aufgefallen, nicht vorher. Die
Feldgröße wird deshalb aus der Modulanzahl des erzeugten Symbols berechnet; wächst die
URL über die Kapazität dieser Version hinaus, wächst das Feld mit.

Das Script **bricht ab**, wenn es seinen eigenen QR aus dem fertigen Bild nicht wieder
dekodieren kann — einmal sauber und einmal bei 3,2 Pixeln pro Modul mit Weichzeichner,
also einer schlechten Aufnahme eines kleinen Codes.

**Vor dem Druck prüfen:** die Domain muss erreichbar sein. Solange
`co-gebaeudeservice.de` nicht live ist, führt der Code ins Leere — und ein gedruckter
QR-Code lässt sich nicht nachbessern.

## Wenn sich etwas ändert

Nummer, Adresse oder Leistungen ändern sich in `src/data/`, dann das Script neu laufen
lassen. Das Layout steht in `scripts/build-business-card.mjs`; die vertikalen Maße der
Rückseite sind auf die 42 mm Inhaltshöhe der engeren Variante gerechnet und dort
kommentiert.
