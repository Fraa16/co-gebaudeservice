# Fotografie — Briefing

Zehn Bildplätze. **Einer ist vorhanden**, neun fehlen. Solange ein Platz leer ist,
zeigt die Website eine gestaltete Markenfläche (`BrandPanel`) statt eines kaputten
Bildes — die Seite wirkt fertig, nicht unfertig.

Die Bildreihe auf „Über uns" erscheint erst, wenn echte Fotos vorliegen; bis dahin
steht dort eine einzelne breite Fläche. Vier leere Kacheln nebeneinander sehen aus wie
vier kaputte Bilder, eine gestaltete Fläche nicht.

## Einbau

Foto nach `src/assets/photos/` legen, dann in `src/data/photos.ts` den passenden Slot
eintragen:

```ts
'r-l1': { image: treppenhaus, alt: 'Gereinigtes Treppenhaus', tone: 'blue' },
```

Mehr ist nicht nötig: `Photo.astro` erzeugt automatisch AVIF/WebP in mehreren Größen,
setzt `loading="lazy"` (außer im Hero) und `object-fit: cover`.

## Liste

| Slot | Seite | Motiv | Format | Status |
|---|---|---|---|---|
| `r-hero` | Start | Fassade oder Treppenhaus — aktuell: Glasreinigung | quer, ca. 4:3 | **vorhanden** (aus dem PDF, 1200×900) |
| `r-l1` | Start, Leistungen | Treppenhaus | hoch, ca. 3:4 | fehlt |
| `r-l2` | Start, Leistungen | Fensterfront | hoch, ca. 3:4 | fehlt |
| `r-l3` | Start, Leistungen | Hausmeister vor Ort | hoch, ca. 3:4 | fehlt |
| `r-l4` | Start, Leistungen | Außenanlage | hoch, ca. 3:4 | fehlt |
| `r-l5` | Start, Leistungen | Winterdienst | hoch, ca. 3:4 | fehlt |
| `r-detail` | Treppenhausreinigung | Treppenhaus nach der Reinigung | quer, ca. 2:1 | fehlt |

Dazu die Kachelreihe auf „Über uns": `r-l6` Kellergang · `r-l7` gekehrter Gehweg ·
`r-l8` Müllstandsplatz — jeweils hoch, ca. 3:4. Die Reihe erscheint erst, wenn echte
Fotos vorliegen.

## Anforderungen

- **Mindestens 1600 px** auf der langen Kante, unkomprimiertes JPEG oder PNG.
- **Echte Objekte aus dem Einsatzgebiet**, wenn möglich. Nagold und Kreis Calw sind der
  Verkaufsgrund; generische Stockbilder arbeiten dagegen.
- Menschen bei der Arbeit wirken besser als leere Räume, aber **keine gestellten
  Daumen-hoch-Motive**. Die Tonalität ist sachlich.
- Keine erkennbaren Gesichter ohne schriftliche Einwilligung der abgebildeten Person.
- Keine Hausnummern, Klingelschilder oder Kfz-Kennzeichen, die ein Objekt oder eine
  Person identifizierbar machen.
- Hoch- und Querformat wie in der Tabelle: die Kacheln schneiden zentriert zu.

## Offen

Das vorhandene Hero-Foto stammt aus `design/website-rounded.pdf` und sieht nach einem
Stockbild aus. **Vor dem Livegang muss geklärt werden, ob die Lizenz die Nutzung im Web
abdeckt.** Falls nicht, wird es ersetzt; der Bildplatz fällt dann auf die Markenfläche
zurück, bis ein Ersatz da ist.

---

## Suchbegriffe je Bildplatz

Für Stock-Portale (Adobe Stock, iStock, Westend61; kostenlos: Unsplash, Pexels,
Pixabay). **Englische Begriffe finden mehr**, weil die Portale danach indexieren —
deutsche Begriffe stehen daneben für die deutschen Anbieter.

Ein Zusatz wie `Germany`, `German` oder `European` lohnt sich fast immer: amerikanische
Treppenhäuser, Briefkästen und Mülltonnen sehen anders aus und wirken sofort fremd.

### `r-l1` · Treppenhaus — hoch, 3:4

- **EN**: `apartment building stairwell clean` · `residential staircase handrail`
  · `stairwell landing tiled floor Germany` · `multi-family house staircase interior`
- **DE**: `Treppenhaus Mehrfamilienhaus sauber` · `Treppenhaus Geländer Wohnanlage`
- **Nicht**: repräsentative Altbau- oder Hoteltreppen, Teppichböden, Wendeltreppen aus
  Architekturmagazinen. Gesucht ist ein gewöhnliches Wohnhaus der 60er bis 2000er:
  Stufen aus Stein oder Fliesen, schlichtes Geländer, Tageslicht aus dem Fenster.

### `r-l2` · Fensterfront — hoch, 3:4

- **EN**: `window cleaning squeegee` · `cleaning window frame cloth` ·
  `glass cleaning worker building`
- **DE**: `Fensterreinigung Abzieher` · `Glasreinigung Fensterrahmen`
- **Nicht**: Fassadenkletterer am Seil und Hochhaus-Glasfronten im Sonnenuntergang —
  das ist eine andere Leistung und eine andere Größenordnung.

### `r-l3` · Hausmeister vor Ort — hoch, 3:4

- **EN**: `building caretaker checking` · `facility manager clipboard corridor` ·
  `maintenance worker toolbox residential building` · `janitor apartment building`
- **DE**: `Hausmeister Kontrollgang` · `Hausmeister Werkzeug Wohnanlage`
- **Nicht**: Helm und Warnweste auf der Baustelle (falsches Gewerk), und niemand, der
  in die Kamera lächelt oder den Daumen hebt.

### `r-l4` · Außenanlage — hoch, 3:4

- **EN**: `trimmed hedge apartment building` · `maintained green space residential
  complex` · `hedge trimming gardener` · `lawn mowing housing estate`
- **DE**: `Außenanlage Wohnanlage gepflegt` · `Heckenschnitt Grünanlage`
- **Nicht**: Ziergärten und Blumen in Nahaufnahme. Es geht um die Fläche *am Objekt*,
  nicht um Gartengestaltung.

### `r-l5` · Winterdienst — hoch, 3:4

- **EN**: `clearing snow sidewalk shovel` · `gritting path winter service` ·
  `snow cleared pavement apartment building` · `snow shovel walkway Germany`
- **DE**: `Winterdienst Gehweg räumen` · `Streugut Gehweg Schnee`
- **Nicht**: Räumfahrzeuge, Skiorte, spielende Kinder. Der Bildinhalt ist ein geräumter
  Gehweg, nicht der Winter.

### `r-l6` · Kellergang — hoch, 3:4

- **EN**: `basement corridor apartment building` · `cellar hallway storage doors` ·
  `clean basement passage`
- **DE**: `Kellergang Mehrfamilienhaus` · `Kellerflur Abstellräume`
- **Nicht**: dunkle, unheimliche Keller und Technikräume mit Rohrleitungen. Hell,
  aufgeräumt, gefegt.

### `r-l7` · Gekehrter Gehweg — hoch, 3:4

- **EN**: `swept pavement apartment building` · `clean paving stones walkway
  residential` · `broom sweeping sidewalk`
- **DE**: `Gehweg gekehrt Wohnhaus` · `Pflastersteine Gehweg sauber`
- **Nicht**: belebte Innenstadtstraßen mit Passanten.

### `r-l8` · Müllstandsplatz — hoch, 3:4

- **EN**: `waste bin enclosure residential` · `wheelie bins storage area tidy` ·
  `refuse bins apartment complex Germany`
- **DE**: `Müllstandsplatz Tonnen Wohnanlage` · `Mülltonnen Einhausung`
- **Nicht**: überquellende Tonnen, Müll daneben, Deponien. Das Bild soll das Ergebnis
  zeigen, nicht das Problem.

### `r-detail` · Treppenhaus nach der Reinigung — **quer, 2:1**

Der einzige Platz im Querformat, und der größte auf der Seite. Ein Hochformat
funktioniert hier nicht: gesucht ist ein Podest oder Flur *der Länge nach*, nicht der
Blick ein Treppenhaus hinauf.

- **EN**: `freshly mopped floor corridor` · `cleaning stairwell landing mop` ·
  `wet clean floor hallway building`
- **DE**: `Treppenhaus frisch gewischt` · `Reinigung Treppenhaus Wischmopp`
- **Nicht**: das gelbe „Vorsicht nass"-Schild als Hauptmotiv — das liest sich als
  Gefahrenstelle, nicht als Ergebnis.

## Besser als jedes Stockbild

Ein halber Vormittag mit einer ordentlichen Kamera an zwei echten Objekten in Nagold
schlägt diese Liste vollständig. Oben steht es schon: *echte Objekte aus dem
Einsatzgebiet* sind der Verkaufsgrund. Bei Stockbildern konkurriert die Seite mit
jedem anderen Anbieter, der dieselben Bilder gekauft hat — und Hausverwaltungen in
Kreis Calw erkennen ihre eigenen Straßen.

Falls doch Stock: die Bilder am besten **aus einer Serie desselben Fotografen**
nehmen. Neun Bilder aus neun Quellen haben neun verschiedene Farbstimmungen, und genau
das lässt eine Seite zusammengesetzt aussehen.
