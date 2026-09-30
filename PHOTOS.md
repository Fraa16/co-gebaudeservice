# Fotografie — Briefing

**Zehn Bildplätze, alle auf der Website sichtbar. Neun sind belegt, einer kommt noch.**
Solange ein Platz leer ist, zeigt die Website eine gestaltete Markenfläche
(`BrandPanel`) statt eines kaputten Bildes — die Seite wirkt fertig, nicht unfertig.

Im September 2026 kam ein Satz von acht Fotos, eines je Leistung, alle 1672 × 941
(16:9 quer). Sie liegen in `src/assets/photos/` unter dem Namen der Leistung.

## Stand

| Slot | Leistung | Wo es erscheint | Datei |
|---|---|---|---|
| `r-hero` | — | Start, Kopfbereich | `hausmeisterdienst.png` (dasselbe wie `r-l3`), siehe unten |
| `r-l1` | Treppenhausreinigung | Start, Kachel · Leistungen · Über uns, Bildreihe | `treppenhausreinigung.png` |
| `r-l2` | Fensterreinigung | Start, Kachel · Leistungen · Über uns, Bildreihe | `fensterreinigung.png` |
| `r-l3` | Hausmeisterdienst | Start, Kachel · Leistungen | `hausmeisterdienst.png` |
| `r-l4` | Gartenpflege | Start, Kachel · Leistungen · Über uns, Bildreihe | `gartenpflege.png` |
| `r-l5` | Winterdienst | Start, Kachel · Leistungen · Über uns, Bildreihe | `winterdienst.png` |
| `r-l6` | Kellerreinigung | Leistungen | `kellerreinigung.png` |
| `r-l7` | Außenreinigung | Leistungen | `aussenreinigung.png` |
| `r-l8` | Mülltonnendienst | Leistungen | `muelltonnendienst.png` |
| `r-detail` | — | Start, Abschnitt Treppenhausreinigung | **kommt noch**, siehe unten |

Die Startseite zeigt die fünf ersten Leistungen als Kacheln, jede mit ihrem Foto;
`/leistungen` zeigt alle acht, jede Zeile mit ihrem Foto über dem Leistungsumfang.

**`r-detail` braucht ein zweites, anderes Treppenhausfoto** — der Kunde liefert es
nach. Der Abschnitt steht auf der Startseite direkt unter dem Leistungsraster, dessen
große Kachel schon `treppenhausreinigung.png` zeigt. Dasselbe Foto in zwei
benachbarten Abschnitten liest sich als Versehen. Gesucht: ein Podest oder Flur der
Länge nach, frisch gewischt, ohne Person oder mit Person nur am Rand — quer, und es
wird am Laptop bis 3,4 : 1 flach.

**Die Bildreihe auf „Über uns" erscheint erst mit allen vier Fotos** — `r-l1`,
`r-l2`, `r-l4` und `r-l5`. Bis dahin steht dort eine einzelne breite Markenfläche, die
gewollt aussieht. Die Fotos lassen sich also einzeln einbauen, ohne dass eine Seite
zwischendurch halb fertig wirkt: `r-l1` und `r-detail` erscheinen sofort auf der
Startseite, die Reihe auf „Über uns" kommt mit dem vierten Bild. (Bis September 2026
zeigte die Reihe jedes belegte Bild einzeln, und das erste wäre allein in einer Zeile
für vier gestanden. `tests/smoke.spec.ts` hält das jetzt fest.) Seit dem Fotosatz vom
September 2026 sind alle vier da, und die Reihe steht.

**Schrift auf Fotos.** Auf den Kacheln der Startseite steht weiße Schrift auf dem
Foto. Ein dunkler Verlauf von unten (`--co-card-scrim`) hält Titel und Text lesbar,
Nummer und Chip stehen in einer deckend weißen Pille. `tests/photo-contrast.spec.ts`
misst bei jedem Durchlauf den Kontrast gegen die hellsten Pixel hinter jedem
Textblock und verlangt 4,5 : 1. Ein neues, helleres Foto, das das bricht, fällt dort
auf, nicht erst beim Besucher.

## Format: quer, nicht hoch

Dieses Briefing verlangte früher Hochformat 3:4 für fast alle Plätze. Das stimmt für
die heutigen Seiten nicht — gemessen im Browser, Breite × Höhe des Bildrahmens:

| Bildschirm | `r-hero` | große Kachel Start | kleine Kachel Start | `r-detail` | Bildreihe „Über uns" | Zeile `/leistungen` |
|---|---|---|---|---|---|---|
| Handy, 390 px | 370 × 697 · **0,53 : 1** | 370 × 340 · 1,09 : 1 | 370 × 260 · 1,42 : 1 | 326 × 240 · 1,36 : 1 | 370 × 170 · 2,18 : 1 | 326 × 204 · 1,60 : 1 |
| Tablet, 768 px | 747 × 594 · 1,26 : 1 | 747 × 340 · 2,20 : 1 | 368 × 260 · 1,41 : 1 | 685 × 240 · 2,85 : 1 | 368 × 170 · 2,16 : 1 | 685 × 428 · 1,60 : 1 |
| Laptop, 1024 px | 995 × 640 · 1,55 : 1 | 654 × 348 · 1,88 : 1 | 327 × 348 · 0,94 : 1 | 913 × 266 · **3,43 : 1** | 491 × 205 · 2,40 : 1 | 386 × 241 · 1,60 : 1 |
| Desktop, 1440 px | 1400 × 770 · 1,82 : 1 | 682 × 461 · 1,48 : 1 | 341 × 461 · **0,74 : 1** | 606 × 360 · 1,68 : 1 | 338 × 260 · 1,30 : 1 | 565 × 353 · 1,60 : 1 |

Die Rahmen haben kein festes Seitenverhältnis, außer auf `/leistungen` (16 : 10): die
Bilder werden mittig zugeschnitten, je nach Platz und Bildschirm zwischen 0,74 : 1 und
3,4 : 1. Ein Hochformat 3:4 in einem 2,4 : 1-Rahmen behält nur ein knappes Drittel
seiner Höhe; ein 16:9-Foto in der schmalen Kachel am Desktop behält 42 % seiner
Breite, und zwar die Mitte.

Daraus folgt für jedes Foto:

- **Querformat 3:2 oder 16:9.** So liefern fast alle Kameras und Stockportale ohnehin.
- **Motiv in die Mitte, Luft drumherum.** Oben und unten fällt in den breiten Rahmen
  am meisten weg, links und rechts in den schmalen Kacheln — nichts Wichtiges ins
  obere und untere Fünftel oder an die Seitenränder legen.
- **`r-hero` ist der Sonderfall.** Auf dem Handy ist der Rahmen hochkant (0,53 : 1),
  am Desktop breit (1,82 : 1), und links steht die Überschrift. Ideal ist ein Motiv im
  **rechten Drittel** mit ruhiger Fläche links. Siehe „Das Hero-Foto" unten.
- **`r-detail` wird am Laptop sehr flach** (3,43 : 1). Gesucht ist ein Podest oder Flur
  *der Länge nach*, nicht der Blick ein Treppenhaus hinauf.

## Anforderungen

- **Mindestens 1600 px** auf der langen Kante, besser 2400. Unkomprimiertes JPEG oder
  PNG.
- **Echte Objekte aus dem Einsatzgebiet**, wenn möglich. Nagold und Kreis Calw sind der
  Verkaufsgrund; generische Stockbilder arbeiten dagegen.
- Menschen bei der Arbeit wirken besser als leere Räume, aber **keine gestellten
  Daumen-hoch-Motive**. Die Tonalität ist sachlich.
- Keine erkennbaren Gesichter ohne schriftliche Einwilligung der abgebildeten Person.
- Keine Hausnummern, Klingelschilder oder Kfz-Kennzeichen, die ein Objekt oder eine
  Person identifizierbar machen.
- Für jedes Foto die **Lizenz oder die Quelle** notieren. Bei eigenen Fotos: wer hat
  fotografiert.

## Einbau

Foto nach `src/assets/photos/` legen, oben in `src/data/photos.ts` importieren und den
Slot eintragen:

```ts
import treppenhaus from '../assets/photos/treppenhaus.jpg';
// …
'r-l1': { image: treppenhaus, alt: 'Gereinigtes Treppenhaus in einem Wohnhaus', tone: 'blue' },
```

Mehr ist nicht nötig: `Photo.astro` erzeugt automatisch AVIF/WebP in mehreren Größen,
setzt `loading="lazy"` (außer im Hero) und `object-fit: cover`. Der Alt-Text
beschreibt, was auf *diesem* Foto zu sehen ist, nicht die Leistung.

## Das Hero-Foto

Seit September 2026 zeigt der Hero auf Wunsch des Kunden das Hausmeisterdienst-Foto.
Das frühere Stockfoto (Glasreinigung, aus `design/website-rounded.pdf`, Lizenz vom
Kunden bestätigt) liegt weiter unter `src/assets/photos/hero-fensterreinigung.jpg`.

**Der Hero ist für ein Motiv rechts gebaut**, weil links die Überschrift steht. Im
Hausmeister-Foto steht die Person mittig bis links; in voller Größe lief die
Überschrift quer über das Gesicht. Deshalb wird das Foto ab 720 px Breite vom linken
Rand aus vergrößert (1,8 × bis 960 px, 1,55 × bis 1200 px, darüber 1,4 ×), bis die
Person neben der Überschrift steht. Unter 720 px, wo die Schrift die ganze Breite
einnimmt, liegt das Foto nicht mehr hinter dem Text, sondern steht darunter als eigenes,
gerundetes Bild im Format 4 : 3 (Ausschnitt `object-position: 45% 30%`, Person und
Wagen ganz im Bild). Vorher lag es hinter der Schrift unter einem Schleier von 84 %
Deckkraft, den dunkle Schrift auf dem dunkelblauen Shirt brauchte; auf dem Handy war
vom Foto dadurch fast nichts zu sehen.

Beides ist **auf dieses Foto abgestimmt**. Ein neues Hero-Foto muss gegengeprüft
werden; `tests/photo-contrast.spec.ts` misst den Kontrast von Überschrift und
Unterzeile bei acht Breiten von 360 bis 1440 px und schlägt an, wenn eine Zeile unter
4,5 : 1 fällt. Ein Foto mit dem Motiv im rechten Drittel bräuchte die Vergrößerung
nicht und wäre schärfer.

Dasselbe Foto steht als `r-l3` auch in der Hausmeisterdienst-Kachel der Startseite,
drei Abschnitte tiefer.

---

## Suchbegriffe je Bildplatz

Für Stock-Portale (Adobe Stock, iStock, Westend61; kostenlos: Unsplash, Pexels,
Pixabay). **Englische Begriffe finden mehr**, weil die Portale danach indexieren —
deutsche Begriffe stehen daneben für die deutschen Anbieter. Überall den Filter
**„Querformat" / „landscape"** setzen.

Ein Zusatz wie `Germany`, `German` oder `European` lohnt sich fast immer: amerikanische
Treppenhäuser, Briefkästen und Mülltonnen sehen anders aus und wirken sofort fremd.

### `r-l1` · Treppenhaus

- **EN**: `apartment building stairwell clean` · `residential staircase handrail`
  · `stairwell landing tiled floor Germany` · `multi-family house staircase interior`
- **DE**: `Treppenhaus Mehrfamilienhaus sauber` · `Treppenhaus Geländer Wohnanlage`
- **Nicht**: repräsentative Altbau- oder Hoteltreppen, Teppichböden, Wendeltreppen aus
  Architekturmagazinen. Gesucht ist ein gewöhnliches Wohnhaus der 60er bis 2000er:
  Stufen aus Stein oder Fliesen, schlichtes Geländer, Tageslicht aus dem Fenster.

### `r-detail` · Treppenhaus nach der Reinigung

- **EN**: `freshly mopped floor corridor` · `cleaning stairwell landing mop` ·
  `wet clean floor hallway building`
- **DE**: `Treppenhaus frisch gewischt` · `Reinigung Treppenhaus Wischmopp`
- **Nicht**: das gelbe „Vorsicht nass"-Schild als Hauptmotiv — das liest sich als
  Gefahrenstelle, nicht als Ergebnis. Und nicht dasselbe Foto wie `r-l1`: beide
  stehen auf der Startseite.

### `r-l2` · Fensterfront

- **EN**: `window cleaning squeegee` · `cleaning window frame cloth` ·
  `glass cleaning worker building`
- **DE**: `Fensterreinigung Abzieher` · `Glasreinigung Fensterrahmen`
- **Nicht**: Fassadenkletterer am Seil und Hochhaus-Glasfronten im Sonnenuntergang —
  das ist eine andere Leistung und eine andere Größenordnung. Auch nicht zu nah am
  Hero-Motiv, das schon eine Glasreinigung zeigt.

### `r-l4` · Außenanlage

- **EN**: `trimmed hedge apartment building` · `maintained green space residential
  complex` · `hedge trimming gardener` · `lawn mowing housing estate`
- **DE**: `Außenanlage Wohnanlage gepflegt` · `Heckenschnitt Grünanlage`
- **Nicht**: Ziergärten und Blumen in Nahaufnahme. Es geht um die Fläche *am Objekt*,
  nicht um Gartengestaltung.

### `r-l5` · Winterdienst

- **EN**: `clearing snow sidewalk shovel` · `gritting path winter service` ·
  `snow cleared pavement apartment building` · `snow shovel walkway Germany`
- **DE**: `Winterdienst Gehweg räumen` · `Streugut Gehweg Schnee`
- **Nicht**: Räumfahrzeuge, Skiorte, spielende Kinder. Der Bildinhalt ist ein geräumter
  Gehweg, nicht der Winter.

## Besser als jedes Stockbild

Ein halber Vormittag mit einer ordentlichen Kamera an zwei echten Objekten in Nagold
schlägt diese Liste vollständig. Oben steht es schon: *echte Objekte aus dem
Einsatzgebiet* sind der Verkaufsgrund. Bei Stockbildern konkurriert die Seite mit
jedem anderen Anbieter, der dieselben Bilder gekauft hat — und Hausverwaltungen im
Kreis Calw erkennen ihre eigenen Straßen.

Nur `r-l5` (Winterdienst) lässt sich im September nicht selbst fotografieren. Dafür
ist Stock in Ordnung, oder der Platz bleibt bis zum ersten Schnee leer — dann bleibt
allerdings auch die Bildreihe auf „Über uns" bis dahin eine Markenfläche, siehe oben.
Die Startseite ist davon nicht betroffen.

Falls doch Stock: die Bilder am besten **aus einer Serie desselben Fotografen**
nehmen. Fünf Bilder aus fünf Quellen haben fünf verschiedene Farbstimmungen, und genau
das lässt eine Seite zusammengesetzt aussehen.
