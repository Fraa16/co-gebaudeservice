# Visitenkarte

Erzeugt aus denselben Daten, aus denen die Website rendert:

```
node scripts/build-business-card.mjs    # Layout und Vorschauen
node scripts/build-print-pdf.mjs        # Druckdateien (braucht Ghostscript)
node scripts/build-print-spec.mjs       # Datenblatt für die Druckerei
```

Name, Telefonnummer, Anschrift und die acht Leistungen stehen nirgends in diesem
Ordner als Text — sie kommen aus `src/data/content.json` und `src/data/services.ts`.
Eine Karte mit eigener Kopie der Telefonnummer ist genau der Fehler, gegen den auf der
Website `contactRoutes` eingeführt wurde, nur auf Papier, wo er sich nicht mehr
korrigieren lässt.

## Was an die Druckerei geht

Alles in **`druck/`**, sonst nichts:

| Datei | |
|---|---|
| `CO-Visitenkarte-CMYK.pdf` | 91 × 61 mm, ohne Schnittmarken |
| `CO-Visitenkarte-CMYK-Schnittmarken.pdf` | 101 × 71 mm, mit Schnittmarken |
| `DRUCKDATENBLATT.pdf` | Eine Seite, deutsch und englisch |

Beide PDFs zeigen dasselbe Layout. Welches gebraucht wird, hängt von der Druckerei ab:
wer selbst ausschießt, will die Datei ohne Marken; eine kleinere Druckerei will sie
meist mit. Das Datenblatt erklärt beides, damit niemand nachfragen muss.

Der Ordner enthält bewusst **nur eine Gestaltung**. Die flächige Variante bleibt als
Alternative im übergeordneten Verzeichnis; ein Ordner, der an eine Druckerei geht,
sollte keine Auswahl enthalten, die dort getroffen werden könnte.

## Was die Dateien mitbringen

- **Endformat 85 × 55 mm**, 3 mm Beschnitt umlaufend.
- **TrimBox und BleedBox auf beiden Seiten gesetzt.** Ohne sie muss eine Druckerei
  raten, wo im 91-mm-Bogen die 85-mm-Karte liegt.
- **CMYK**, kein RGB.
- **Schriften in Kurven.** Keine eingebettete Schrift, also nichts, was ersetzt,
  falsch geladen oder unterschiedlich interpretiert werden kann.
- **Keine Transparenz.**
- Maximaler Farbauftrag **295 %**.

## Drei Dinge, die vorher nicht stimmten

Der Weg vom Browser-PDF zur Druckdatei hat drei Fehler zutage gefördert, die alle am
Bildschirm unsichtbar waren:

**Type3-Schriften.** Chromium kann eine Variable Font nicht als normalen Subset
unterbringen und legt die Glyphen stattdessen als Type3-Zeichenprozeduren ab. Die
Zeichnung ist vollständig, aber Type3 ist der Klassiker unter den Vorstufenproblemen.
`-dNoOutputFonts` wandelt jede Glyphe in einen Pfad, damit bleibt keine Schrift übrig.

**Transparenz.** Die Geistermarke auf der Rückseite lag bei 10 % Deckkraft und war die
einzige Stelle der Datei mit Transparenz. Wie ein fremdes RIP das flachrechnet, wollen
wir nicht auf gedruckten Karten erfahren — die Farbe wird jetzt vorab ausgerechnet und
deckend gezeichnet. Am Bildschirm identisch.

**Defekte Querverweistabelle.** Die Seitenboxen werden direkt in die Seitenobjekte
geschrieben, und damit stimmt jeder Byte-Versatz dahinter nicht mehr. Ghostscript
repariert so etwas stillschweigend, weshalb es gefährlich ist: hier liest es sauber und
wird anderswo abgelehnt. Ein zweiter pdfwrite-Lauf baut die Tabelle neu; das Script
prüft anschließend, dass `startxref` wieder auf eine Tabelle zeigt.

Jeder Schritt wird verifiziert: Seitenboxen auf beiden Seiten, keine Schriften, kein
DeviceRGB, zwei Seiten, und ein Pixelvergleich beider Seiten gegen die Quelldatei. Eine
Farbraumwandlung, die still ein Element verschluckt, fällt sonst erst auf Papier auf.

## Was die Druckerei entscheidet

Die CMYK-Umwandlung erfolgte mit einem **allgemeinen Profil**, nicht mit dem einer
bestimmten Maschine — ein Profil der Druckerei liegt hier nicht vor. Die Werte sind
Ausgangswerte; wer die Datei gegen sein eigenes Profil neu separiert, macht es richtig.
Das steht auch auf dem Datenblatt.

Zwei Punkte gehören dort geprüft:

- **295 % Farbauftrag** ist für gestrichenes Papier üblich und für ungestrichenes
  womöglich zu hoch.
- **Das Dunkelblau** `#010E40` wird auf ungestrichenem Papier deutlich flauer. Bei
  größerer Auflage lohnt ein Proof.

Das Navy ist bewusst der Wert aus der Logodatei und nicht `--co-ink` `#03045E` der
Website. Auf der Karte liegt das Logo direkt auf dieser Fläche — die eine Situation, in
der die beiden Blautöne als Fehler gelesen würden. Begründung in `brand/README.md`.

## QR-Code

Zeigt auf `https://co-gebaeudeservice.de`. 29 × 29 Module à 0,41 mm, also über der
0,4-mm-Grenze. Fehlerkorrektur M. Das weiße Feld dahinter ist keine Dekoration, sondern
die **Ruhezone** — vier Module auf jeder Seite, aus der Modulanzahl berechnet statt
geschätzt. Das Script bricht ab, wenn es seinen eigenen Code aus dem fertigen Bild
nicht wiederfindet.

**Vor dem Druck:** die Domain muss erreichbar sein. Ein gedruckter QR-Code lässt sich
nicht nachbessern.

## Vorschauen in diesem Ordner

`karten-*` ist die Empfehlung, `flaechig-*` die Alternative, `*-kontrolle.png` zeigt
Schnittkante und Sicherheitsabstand, `ecken-gestanzt.png` die flächige Variante mit
3 mm gestanzten Ecken, `vergleich.png` alles nebeneinander.
