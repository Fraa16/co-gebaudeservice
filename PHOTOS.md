# Fotografie — Briefing

**Sechs Bildplätze sind auf der Website sichtbar. Einer ist belegt, fünf fehlen.**
Solange ein Platz leer ist, zeigt die Website eine gestaltete Markenfläche
(`BrandPanel`) statt eines kaputten Bildes — die Seite wirkt fertig, nicht unfertig.

## Was gebraucht wird

| Slot | Wo es erscheint | Motiv | Status |
|---|---|---|---|
| `r-hero` | Start, Kopfbereich | Glas- oder Fensterreinigung | **vorhanden**, Lizenz klären (siehe unten) |
| `r-l1` | Start, große Leistungskachel · Über uns, Bildreihe | Treppenhaus | fehlt |
| `r-detail` | Start, Abschnitt Treppenhausreinigung | Treppenhaus nach der Reinigung | fehlt |
| `r-l2` | Über uns, Bildreihe | Fensterfront | fehlt |
| `r-l4` | Über uns, Bildreihe | Außenanlage | fehlt |
| `r-l5` | Über uns, Bildreihe | Winterdienst | fehlt |

`r-l1` arbeitet doppelt: es ist die große Kachel im Leistungsraster der Startseite
*und* das erste Bild der Reihe auf „Über uns". Das wichtigste der fünf.

**Die Bildreihe auf „Über uns" erscheint erst mit allen vier Fotos** — `r-l1`,
`r-l2`, `r-l4` und `r-l5`. Bis dahin steht dort eine einzelne breite Markenfläche, die
gewollt aussieht. Die Fotos lassen sich also einzeln einbauen, ohne dass eine Seite
zwischendurch halb fertig wirkt: `r-l1` und `r-detail` erscheinen sofort auf der
Startseite, die Reihe auf „Über uns" kommt mit dem vierten Bild. (Bis September 2026
zeigte die Reihe jedes belegte Bild einzeln, und das erste wäre allein in einer Zeile
für vier gestanden. `tests/smoke.spec.ts` hält das jetzt fest.)

**Derzeit nirgends angezeigt:** `r-l3` (Hausmeister), `r-l6` (Kellergang), `r-l7`
(Gehweg), `r-l8` (Müllstandsplatz). Die Plätze sind angelegt, aber keine Seite
rendert sie — die Startseite zeigt nur die erste Leistung mit Foto, `/leistungen`
kommt ohne Fotos aus, und die Treppenhaus-Unterseite, an der früher Bilder hingen,
gibt es nicht mehr. Nicht beschaffen, bis eine Seite sie braucht.

## Format: quer, nicht hoch

Dieses Briefing verlangte früher Hochformat 3:4 für fast alle Plätze. Das stimmt für
die heutigen Seiten nicht — gemessen im Browser, Breite × Höhe des Bildrahmens:

| Bildschirm | `r-hero` | `r-l1` Kachel | `r-detail` | Bildreihe „Über uns" |
|---|---|---|---|---|
| Handy, 390 px | 370 × 697 · **0,53 : 1** | 370 × 340 · 1,09 : 1 | 326 × 240 · 1,36 : 1 | 370 × 170 · 2,18 : 1 |
| Tablet, 768 px | 747 × 594 · 1,26 : 1 | 747 × 340 · 2,20 : 1 | 685 × 240 · 2,85 : 1 | 368 × 170 · 2,16 : 1 |
| Laptop, 1024 px | 995 × 640 · 1,55 : 1 | 654 × 348 · 1,88 : 1 | 913 × 266 · **3,43 : 1** | 491 × 205 · 2,40 : 1 |
| Desktop, 1440 px | 1400 × 770 · 1,82 : 1 | 682 × 461 · 1,48 : 1 | 606 × 360 · 1,68 : 1 | 338 × 260 · 1,30 : 1 |

Jeder Rahmen ist querformatig, und keiner hat ein festes Seitenverhältnis: die Bilder
werden mittig zugeschnitten, je nach Bildschirm zwischen 1,1 : 1 und 3,4 : 1. Ein
Hochformat 3:4 in einem 2,4 : 1-Rahmen behält nur ein knappes Drittel seiner Höhe.

Daraus folgt für jedes Foto:

- **Querformat 3:2.** So liefern fast alle Kameras und Stockportale ohnehin.
- **Motiv in die Mitte, Luft drumherum.** Oben und unten fällt am meisten weg — nichts
  Wichtiges ins obere und untere Fünftel legen.
- **`r-hero` ist der Sonderfall.** Auf dem Handy ist der Rahmen hochkant (0,53 : 1),
  am Desktop breit (1,82 : 1). Das Motiv muss als schmaler senkrechter Streifen aus
  der Bildmitte genauso funktionieren wie als ganzes Querformat. Eine Person mittig im
  Bild geht, eine Fensterfront, die über die ganze Breite läuft, nicht.
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

## Offen: das Hero-Foto

Das vorhandene Hero-Foto stammt aus `design/website-rounded.pdf`, liegt nur in
1200 × 900 vor und sieht nach einem Stockbild aus. **Ob die Lizenz die Nutzung im Web
abdeckt, ist ungeklärt — und die Seite ist inzwischen öffentlich.** Falls nicht, wird
es ersetzt; der Platz fällt dann auf die Markenfläche zurück, bis ein Ersatz da ist.

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
