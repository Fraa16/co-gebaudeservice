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

## Dateien

| Datei | Wofür |
|---|---|
| `visitenkarte-druck.pdf` | **Das ist die Druckdatei.** 2 Seiten, 91 × 61 mm |
| `vorschau-vorne.png` / `vorschau-hinten.png` | 300 dpi, auf Endformat beschnitten — zum Ansehen |
| `kontrolle.png` | Beide Seiten mit eingezeichneter Schnittkante und Sicherheitsabstand |

## Was die Druckerei wissen muss

- **Endformat 85 × 55 mm** (deutsches Standardformat).
- **3 mm Beschnitt umlaufend**, deshalb 91 × 61 mm Seitengröße. Keine Schnittmarken —
  so wollen es Flyeralarm, WIRmachenDRUCK und die meisten anderen Online-Druckereien.
- **Sicherheitsabstand 4 mm** ab Schnittkante, wird eingehalten.
- 2 Seiten: Seite 1 vorne, Seite 2 hinten.
- Empfehlung: 350 g/m², matt. Auf Naturpapier wird das Navy deutlich flauer.

## Farbe — der eine Punkt, der Aufmerksamkeit braucht

**Die Datei ist RGB, nicht CMYK.** Die Druckerei konvertiert gegen das Profil des
Papiers; anders geht es nicht sinnvoll, weil die Umrechnung vom Bedruckstoff abhängt.

Wichtig dabei: `#010E40` ist ein sehr dunkles, gesättigtes Blau. Im Vierfarbdruck
verliert es Tiefe, auf ungestrichenem Papier sichtbar. Wer das vermeiden will, lässt
das Navy als **Sonderfarbe** drucken oder bittet um einen **Proof** vor der Auflage.
Beides kostet extra und lohnt erst ab größeren Mengen.

Das Navy der Rückseite ist bewusst `#010E40` (der Wert aus der Logodatei) und nicht
`--co-ink` `#03045E` der Website. Auf der Karte liegt das Logo direkt auf dieser Fläche
— das ist die eine Situation, in der die beiden Blautöne als Fehler gelesen würden.
Begründung in `brand/README.md`.

## QR-Code

Zeigt auf `https://co-gebaeudeservice.de`. 14 mm Feld, 11,8 mm Code, 29 × 29 Module,
also 0,41 mm pro Modul — knapp über der Grenze, die Druckereien als Minimum angeben.
Fehlerkorrektur M.

Gegengeprüft: der Code wurde aus dem gerenderten Bild wieder dekodiert, auch nach
Abwertung auf 150 dpi mit Weichzeichner. Bei 100 dpi bricht er ab, was weit unter
allem liegt, was ein gedrucktes Exemplar und eine Handykamera liefern.

**Vor dem Druck prüfen:** die Domain muss erreichbar sein. Solange
`co-gebaeudeservice.de` nicht live ist, führt der Code ins Leere — und ein gedruckter
QR-Code lässt sich nicht nachbessern.

## Wenn sich etwas ändert

Nummer, Adresse oder Leistungen ändern sich in `src/data/`, dann das Script neu laufen
lassen. Das Layout selbst steht in `scripts/build-business-card.mjs`; die vertikalen
Maße der Rückseite sind auf die 47 mm Inhaltshöhe gerechnet und dort kommentiert.
