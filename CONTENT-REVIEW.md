# Copy-Freigabe

Jede Zeile hier ist **neu geschrieben** und noch nicht vom Kunden freigegeben. Alles
andere auf der Website stammt wörtlich aus `src/data/content.json`.

Tonalität laut CI-Blatt: *„Kurz, konkret, ohne Werbesprache. Sie-Anrede. Leistungen
benennen statt bewerben. Angaben zu Turnus, Erreichbarkeit und Einsatzgebiet immer
mitliefern. Keine Superlative, keine Ausrufezeichen."*

Freigegebene Texte bitte direkt in der genannten Datei ändern — oder hier kommentieren,
dann übertragen wir sie.

---

## 1. Drei neue Leistungen

`src/data/services.ts` · sichtbar auf `/leistungen`

| Chip | Titel | Kurztext |
|---|---|---|
| Nach Bedarf | Kellerreinigung | Kellergänge, Abstellbereiche und Trockenräume kehren und feucht wischen. |
| Nach Turnus | Außenreinigung | Gehwege, Hofflächen und Stellplätze kehren, Laub und Unkraut entfernen. |
| Zum Abfuhrtermin | Mülltonnendienst | Tonnen herausstellen und zurückführen, Müllstandsplatz sauber halten. |

Leistungsumfang je Leistung:

- **Kellerreinigung** — Kellergänge und Vorräume kehren · Böden feucht wischen ·
  Waschküche und Trockenraum · Lichtschalter, Geländer und Türen
  *Turnus: Nach Bedarf oder im festen Intervall*
- **Außenreinigung** — Gehwege und Zuwegungen kehren · Hofflächen und Stellplätze ·
  Laub und Unkraut entfernen · Außentreppen und Eingangsbereiche
  *Turnus: Wöchentlich oder 14-tägig*
- **Mülltonnendienst** — Tonnen zum Abfuhrtermin herausstellen · Tonnen zurückführen ·
  Müllstandsplatz kehren · Tonnen bei Bedarf reinigen
  *Turnus: Zum Abfuhrkalender der Gemeinde*

## 2. Leistungsumfang der fünf bestehenden Leistungen

`src/data/services.ts` — die Kurztexte stammen wörtlich aus `content.json`, die
Aufzählungen sind neu. Ausnahme: **Treppenhausreinigung** übernimmt die Liste aus
`content.json` (`detail.infoCard.items`) unverändert.

- **Fensterreinigung** — Glasflächen innen und außen · Rahmen, Falze und Fensterbänke ·
  Rollladenkästen und Jalousien · Treppenhausfenster und Lichtschächte
  *Turnus: Zweimal im Jahr oder nach Vereinbarung*
- **Hausmeisterdienst** — Regelmäßige Kontrollgänge im Objekt · Kleinreparaturen und
  Lampenwechsel · Müllmanagement und Tonnenwechsel · Ablesungen und Handwerkerbegleitung
  *Turnus: Fester Objektbetreuer, Turnus nach Objektgröße*
- **Gartenpflege** — Rasen mähen, vertikutieren und düngen · Hecken und Sträucher
  schneiden · Beete pflegen und Unkraut entfernen · Laubbeseitigung und
  Grünschnittentsorgung
  *Turnus: März bis November, im vereinbarten Intervall*
- **Winterdienst** — Räumen und Streuen nach Gemeindesatzung · Gehwege, Zufahrten und
  Eingänge · Bereitschaft an Werk- und Feiertagen · Dokumentation jedes Einsatzes
  *Turnus: Saison November bis März, mit Bereitschaft*

## 3. Seite „Über uns"

`src/data/ueber-uns.ts` — die Seite hat im Entwurf keine Vorlage, alles außer Absatz 1
ist neu.

- **Überschrift:** Eigenes Personal, feste Objektbetreuer.
- **Einleitung:** CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold und im
  Kreis Calw.
- **Absatz 1** — *wörtlich* aus `content.json` (`detail.paragraphs[2]`), keine Freigabe nötig.
- **Absatz 2:** Inhaber ist Oguz Cakir. Anfragen, Angebote und die Abstimmung mit der
  Verwaltung laufen über eine Ansprechperson, nicht über ein Callcenter. Für jedes
  Objekt halten wir schriftlich fest, was in welchem Intervall geleistet wird, und
  hängen den Plan im Haus aus.
- **Absatz 3:** Wir arbeiten im Umkreis von Nagold — unter anderem in Altensteig,
  Wildberg, Haiterbach, Rohrdorf und Ebhausen. Kurze Wege bedeuten, dass wir auch bei
  Winterdienst und kurzfristigen Einsätzen zuverlässig vor Ort sind.
  **→ Bitte prüfen: stimmen die genannten Orte?**

**Kennzahlen-Leiste** — aus `design/prototypes/website-prototyp.dc.html` übernommen,
nur die erste Zahl geändert (dort 5 Leistungsbereiche, hier 8):
`8 / Leistungsbereiche` · `Fester Turnus / Nach Reinigungsplan` · `Kreis Calw /
Einsatzgebiet` · `Winterdienst / Mit Bereitschaft`

## 4. Seite „Leistungen" — Kopfbereich

`src/pages/leistungen/index.astro` — **aus dem früheren Entwurf übernommen**, nicht neu
erfunden:

> **Alles rund ums Objekt, aus einer Hand.**
> Einzeln beauftragbar oder als Paket im Dauerauftrag. Turnus, Umfang und Erreichbarkeit
> legen wir vorab schriftlich fest.

## 5. Einwilligung im Kontaktformular

`src/components/sections/ContactForm.astro`

Eine Einwilligung muss nach Art. 4 Nr. 11 DSGVO eine **aktive Handlung** sein; ein
Hinweissatz leistet das nicht. Deshalb gibt es jetzt eine Checkbox:

> Ich stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu. Hinweise
> dazu in der Datenschutzerklärung.

**Der Satz aus `content.json`** („Mit dem Absenden stimmen Sie der Verarbeitung Ihrer
Angaben zu.") stand im Entwurf neben dem Absenden-Button. Er sagt jetzt dasselbe wie
das Checkbox-Label unmittelbar darüber und wurde deshalb entfernt; an seiner Stelle
steht „Pflichtfelder sind mit * gekennzeichnet." **Bitte bestätigen** — oder den Satz
zurückholen, wenn er gewünscht ist.

Der frühere Entwurf enthält übrigens eine zweckgebundene und damit juristisch bessere
Variante desselben Hinweises, falls er doch bleiben soll:

> Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Bearbeitung der
> Anfrage zu.

## 6. Seitentitel und Suchmaschinen-Beschreibungen

`src/data/seo.ts` — komplett neu, `content.json` enthält keine Titel.

| Seite | Titel | Beschreibung |
|---|---|---|
| Start | Gebäudereinigung in Nagold und Umgebung | Treppenhausreinigung, Fensterreinigung, Hausmeisterdienst, Gartenpflege und Winterdienst für Objekte in Nagold und Umgebung. Fester Turnus, fester Ansprechpartner. |
| Leistungen | Leistungen für Objekte in Nagold | Acht Leistungen für Hausverwaltungen und Eigentümergemeinschaften im Kreis Calw: von der Treppenhausreinigung über den Hausmeisterdienst bis zum Winterdienst. |
| Treppenhausreinigung | Treppenhausreinigung in Nagold | Unterhaltsreinigung von Treppen, Fluren und Eingangsbereichen nach festem Reinigungsplan. Wöchentlich oder 14-tägig, mit eigenem Personal und festem Objektbetreuer. |
| Über uns | Über uns | CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw — mit eigenem Personal, festen Objektbetreuern und schriftlich vereinbartem Turnus. |
| Kontakt | Kontakt und Angebot anfordern | Objektbesichtigung vereinbaren und ein Angebot zum Festpreis erhalten. Wir melden uns innerhalb von zwei Werktagen mit einem Terminvorschlag. |

An jeden Titel wird „| CO Gebäudeservice" angehängt. Titel und Beschreibungen wurden
gekürzt, damit sie in den Suchergebnissen nicht abgeschnitten werden (Titel maximal
60 Zeichen inklusive Zusatz, Beschreibung maximal 158 Zeichen).

**Zu klären:** Soll „Gebäudereinigung" neben „Gebäudeservice" in den Titeln stehen? Es
ist der häufiger gesuchte Begriff, und das CI-Blatt verwendet ihn bereits im Fließtext.

## 7. Navigation und 404

- Menüpunkt **„Über uns"** — neu (`src/data/nav.ts`). Alle übrigen Menüpunkte stammen
  wörtlich aus `content.json`.
- **404-Seite** (`src/pages/404.astro`): „Diese Seite gibt es nicht." / „Der Link ist
  womöglich veraltet. Über die Navigation oben finden Sie zu den Leistungen und zum
  Kontaktformular."

## 8. Impressum und Datenschutzerklärung

`src/pages/impressum.md` · `src/pages/datenschutz.md`

Beide sind **Entwürfe nach dem üblichen Aufbau, keine Rechtsberatung.** Alle noch
fehlenden Angaben sind mit `TODO(client)` markiert. Vor der Freischaltung sollte ein
Anwalt oder der Steuerberater beide Seiten prüfen.

---

## 9. WhatsApp-Schaltfläche und Versand des Formulars

`src/pages/datenschutz.md` · `src/components/ui/WhatsAppButton.astro`

Neu hinzugekommen, beides **Entwurf und rechtlich zu prüfen:**

- **Abschnitt „Kontaktaufnahme über WhatsApp"** in der Datenschutzerklärung. Die
  Schaltfläche ist ein reiner Link — beim Laden der Seite wird keine Verbindung zu
  WhatsApp aufgebaut und nichts übertragen. Erst ein Klick öffnet WhatsApp.
- **Voreingestellter erster Text** der WhatsApp-Nachricht:
  „Guten Tag, ich habe eine Frage zu Ihren Leistungen."
- **Absatz „Versand der Anfrage"** im Abschnitt Kontaktformular: nennt Resend als
  Auftragsverarbeiter. Vor Freischaltung des Formulars sind ein
  Auftragsverarbeitungsvertrag nach Art. 28 DSGVO und die Grundlage für die
  Drittlandsübermittlung zu klären.

Die Telefonnummer **0172 3001489** ist bestätigt und steht jetzt in Impressum,
Datenschutzerklärung, Kontaktseite und in den strukturierten Daten. Die E-Mail-Adresse
ist weiterhin ein Platzhalter und wird deshalb nirgends verlinkt.

---

## 10. Suchmaschinen-Texte: Titel, Überschriften und Ortsangaben

`src/data/seo.ts` · `src/data/pages.ts` · `src/data/content.json` · `src/data/ueber-uns.ts`

**Alles in diesem Abschnitt ist Entwurf.** Geändert wurde aus zwei Gründen: keine
einzige Hauptüberschrift der Website nannte einen Ort, und drei Überschriften kamen auf
mehreren Seiten doppelt vor.

### Hauptüberschriften (h1)

| Seite | vorher | jetzt |
|---|---|---|
| Start | Gepflegte Objekte, zuverlässig und zum festen Turnus. | Gepflegte Objekte **in Nagold**, zuverlässig und zum festen Turnus. |
| Leistungen | Alles rund ums Objekt, aus einer Hand. *(dieselbe Zeile wie auf der Startseite)* | Acht Leistungen für Objekte **in Nagold und im Kreis Calw**. |
| Über uns | Eigenes Personal, feste Objektbetreuer. | Eigenes Personal, feste Objektbetreuer **in Nagold**. |
| Kontakt | Objekt ansehen, Angebot erhalten. *(Zeile kam auf drei Seiten vor)* | Angebot erhalten — für Objekte **in Nagold**. |

Die Überschrift der Treppenhaus-Seite bleibt unverändert: sie beginnt bereits mit dem
gesuchten Begriff, und der Ort steht im Seitentitel.

### Weitere geänderte Zeilen

- Abschluss-Band **Leistungen**: „Mehrere Objekte oder ein Sonderfall?" →
  „Mehrere Objekte im Kreis Calw?" (die alte Zeile steht weiterhin auf der Startseite)
- Abschluss-Band **Über uns**: war eine vierte Wiederholung von „Objekt ansehen,
  Angebot erhalten." → „Wir sehen uns Ihr Objekt an."

### Seitentitel und Beschreibungen

Alle acht Seitentitel und Beschreibungen in `src/data/seo.ts` wurden neu geschrieben.
Jeder Titel nennt jetzt Nagold oder den Kreis Calw, sofern es zur Seite passt. Der Titel
„Über uns" bestand vorher aus zwei Wörtern und nutzte 28 von 75 möglichen Zeichen.

Die Beschreibung der Seite **Über uns** nennt jetzt alle sechs Orte — Nagold,
Altensteig, Wildberg, Haiterbach, Rohrdorf und Ebhausen. `TODO(client)`: Diese Ortsliste
ist weiterhin ein Entwurf und sollte bestätigt werden.

### Technisch, nicht inhaltlich

Die bisher fest im Seitenaufbau stehenden Texte liegen jetzt in `src/data/pages.ts`.
Das ändert nichts am Inhalt, macht die Zeilen aber an einer Stelle änderbar — bisher
waren sie über mehrere Dateien verteilt. `npm run lint:seo` prüft bei jedem Build, dass
Titel und Beschreibungen in der von Google dargestellten Länge bleiben.
