# Fotografie — Briefing

Sieben Bildplätze. **Eines ist vorhanden**, sechs fehlen. Solange ein Platz leer ist,
zeigt die Website eine gestaltete Markenfläche (`BrandPanel`) statt eines kaputten
Bildes — die Seite wirkt fertig, nicht unfertig.

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

Optional, für die Kachelreihe auf „Über uns": `r-l6` Kellergang · `r-l7` gekehrter
Gehweg · `r-l8` Müllstandsplatz.

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
