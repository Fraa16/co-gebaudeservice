# Markenzeichen

Die vier vom Kunden gelieferten Vektordateien. **Sie sind die Quelle** — alles unter
`public/` wird daraus erzeugt und ist nicht von Hand zu bearbeiten:

```
node scripts/build-brand-assets.mjs
```

## Die vier Dateien

| Datei | Ursprünglich | Zweck |
|---|---|---|
| `lockup-on-light.svg` | `logo-dunkel.svg` | Volle Signatur, Navy — für helle Untergründe |
| `lockup-on-dark.svg`  | `logo-hell.svg`   | Volle Signatur, Weiß — für dunkle Untergründe |
| `mark-on-light.svg`   | `logo2-dunkel.svg`| Kurzlogo (CO + Welle), Navy — für helle Untergründe |
| `mark-on-dark.svg`    | `logo2-hell.svg`  | Kurzlogo, Weiß — für dunkle Untergründe |

„hell“/„dunkel“ in den Originalnamen bezeichnet die **Farbe der Zeichnung**, nicht den
Untergrund. Die Dateien heißen hier nach dem Untergrund, auf den sie gehören, weil das
die Frage ist, die man beim Einsetzen tatsächlich stellt.

## Wo was verwendet wird

- **Kurzlogo** — Header unterhalb 660px Spaltenbreite, Favicon und der komplette
  App-Icon-Satz. Die Signatur ist 2,78:1 und ihre Descriptor-Zeile nur 9 % ihrer Höhe:
  unter etwa 50px Höhe ist „HAUSMEISTER & REINIGUNG“ keine Schrift mehr, sondern Raster.
- **Volle Signatur** — Header ab 660px, Footer (invertiert), OG-Bild, Druck.

## Farben

Die Dateien führen `#010E40` und `#27AAE1`. Die Website-Token sind `#03045E`
(`--co-ink`) und `#00B4D8` (`--co-cyan`). Das ist bewusst **nicht** angeglichen:

- Nebeneinander als große Flächen sind die Paare unterscheidbar — das Token-Navy ist
  violetter, das Token-Cyan grüner.
- In jeder Situation, die auf der Website tatsächlich vorkommt, ist der Unterschied
  unsichtbar: das Logo besteht aus dünnen Strichen, nicht aus Flächen.
- Der Helligkeitskontrast der Paare zueinander liegt bei 1,04:1 (Navy) und 1,08:1 (Cyan).

Für den **Druck** ist das anders zu bewerten: liegt auf einer Visitenkarte eine große
Navy-Fläche direkt neben dem Logo, fällt die Differenz auf. Dann gilt — das Logo
gewinnt, und die Fläche bekommt `#010E40`.

## Wenn das Logo neu gezeichnet wird

Die Dateien hier ersetzen und das Script neu laufen lassen. Es misst die tatsächliche
Ausdehnung der Zeichnung selbst; nur `ICON_CROP` in
`scripts/build-brand-assets.mjs` ist eine gestalterische Festlegung (wie viel von der
Welle das quadratische Icon abschneidet) und gehört dann noch einmal angesehen.
