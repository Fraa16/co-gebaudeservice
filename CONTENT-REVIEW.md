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

## 6. Seitentitel und Suchmaschinen-Beschreibungen *(überholt, siehe Abschnitt 11)*

> Diese Tabelle gibt einen früheren Stand wieder. **Maßgeblich ist Abschnitt 11.**

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

---

## 11. Häufige Fragen (neuer Abschnitt auf „Leistungen")

`src/data/faq.ts`

**Alles Entwurf.** Sieben Fragen mit Antworten, als aufklappbare Liste auf der Seite
„Leistungen". Derselbe Text wird zusätzlich als strukturierte Daten (`FAQPage`)
ausgegeben, damit Google die Antworten direkt in den Suchergebnissen anzeigen kann.

**Wichtig zur Prüfung:** Jede Antwort wiederholt nur, was auf der Website ohnehin schon
steht — Einsatzgebiet, Turnus, Festpreis nach Besichtigung, Rückmeldung in zwei
Werktagen, Winterdienst nach Gemeindesatzung, eigenes Personal. Es wurde **nichts
Neues behauptet**: keine Vertragslaufzeit, kein Preis, keine Garantie, keine
Versicherung. Sollte eine dieser Aussagen so nicht stimmen, bitte melden — sie steht
dann auch an anderer Stelle falsch auf der Website.

1. In welchen Orten arbeiten Sie?
2. In welchem Turnus wird gereinigt?
3. Was kostet die Reinigung?
4. Wie schnell bekomme ich ein Angebot?
5. Übernehmen Sie auch den Winterdienst?
6. Arbeiten Sie mit eigenem Personal?
7. Für welche Objekte arbeiten Sie?

Dazu die Abschlusszeile „Ihre Frage ist nicht dabei? **Fragen Sie uns direkt**" mit
Verweis auf die Kontaktseite.

Die erste Antwort nennt die Orte automatisch aus der hinterlegten Liste — wird die
Ortsliste geändert, ändert sich die Antwort mit.

---

## 12. Einsatzgebiet erweitert — zehn Orte

`src/data/company.ts` · wirkt auf „Über uns", FAQ und strukturierte Daten

Anlass: Anlage des Google-Unternehmensprofils. Dort sind 20 Einzugsgebiete eingetragen
(Maximum). Auf der Website wären 20 Ortsnamen unlesbar, deshalb die zehn wichtigsten:

**Nagold · Ebhausen · Rohrdorf · Haiterbach · Egenhausen · Wildberg · Altensteig ·
Mötzingen · Jettingen · Herrenberg**

Die ersten sieben liegen im Landkreis Calw, die letzten drei im Gäu (Landkreis
Böblingen) — von Nagold aus näher als der halbe eigene Landkreis.

`TODO(client)`: Bitte bestätigen, dass Oguz in allen zehn Orten tatsächlich arbeitet.
Die Liste steuert gleichzeitig die Chips auf „Über uns", die erste FAQ-Antwort und das
Feld `areaServed` in den strukturierten Daten — ein Ort, den er nicht bedient, wäre
damit an drei Stellen zugleich falsch.

Mitgezogen wurden drei Texte, die Orte ausdrücklich nennen:

- **FAQ-Antwort 1** — endet jetzt auf „sowie im übrigen Kreis Calw und im angrenzenden
  Gäu" statt nur „Kreis Calw", weil die Liste jetzt zwei Landkreise berührt.
- **Über uns, Absatz 3** — nennt zusätzlich „im Gäu rund um Mötzingen, Jettingen und
  Herrenberg".
- **Seitenbeschreibung „Über uns"** — „… und im Gäu bis Herrenberg".

Nicht aufgenommen: der Landkreis Böblingen als Ganzes. Dort werden drei Gemeinden
bedient, nicht die restlichen rund fünfzig.

---

## 11. Redaktionelle Überarbeitung, 21. September 2026

**Das ist der maßgebliche Stand.** Abschnitt 6 und die h1-Tabelle in Abschnitt 10 geben
frühere Fassungen wieder.

Zwei Regeln sind ab jetzt Build-Gate (`npm run lint:copy`) statt Vorsatz: kein
Gedankenstrich mit Leerzeichen drumherum, keine Floskeln, keine Superlative, keine
unbelegten Behauptungen über Betriebsjahre oder Kundenzahlen. Bis-Striche wie `Mo–Fr`
und `14-tägig` sind davon nicht betroffen.

### Startseite

- **Überschrift:** Gepflegte Objekte in Nagold, nach festem Reinigungsplan.
  *(vorher „…, zuverlässig und zum festen Turnus." Das Adjektiv sagt nichts, das ein
  Wettbewerber nicht auch behauptet; der Reinigungsplan ist überprüfbar.)*
- **Unterzeile:** Treppenhausreinigung, Hausmeisterdienst, Gartenpflege und Winterdienst
  für Hausverwaltungen, Eigentümergemeinschaften und Gewerbeobjekte in Nagold und im
  Kreis Calw.

### Kurztexte der fünf Leistungen

| Leistung | Text |
|---|---|
| Treppenhausreinigung | Treppen, Podeste, Flure und Eingangsbereiche im vereinbarten Turnus. |
| Fensterreinigung | Glasflächen, Rahmen und Fensterbänke, innen wie außen. |
| Hausmeisterdienst | Kontrollgänge, Kleinreparaturen und Müllmanagement im Objekt. |
| Gartenpflege | Rasen, Hecken und Beete, dazu die Entsorgung des Grünschnitts. |
| Winterdienst | Räumen und Streuen nach Gemeindesatzung, jeder Einsatz dokumentiert. |

### Häufige Fragen

Acht Fragen auf `/leistungen`, gleichzeitig als FAQ-Markup für Google und die
KI-Suchmaschinen. Jede Antwort beginnt mit der Antwort und liefert die Begründung
danach, weil Antwortmaschinen den ersten Satz zitieren.

1. In welchen Orten arbeiten Sie?
2. In welchem Turnus wird gereinigt?
3. Was kostet die Treppenhausreinigung?
4. Wie schnell bekomme ich ein Angebot?
5. Kann ich einzelne Leistungen beauftragen?
6. Übernehmen Sie auch den Winterdienst?
7. Wer kommt in mein Objekt?
8. Für welche Objekte arbeiten Sie?

**Bitte prüfen:** Frage 3 nennt als Kalkulationsgrundlage Flächen, Zahl der
Wohneinheiten und Turnus. Frage 6 sagt, dass die Dokumentation jedes Winterdienst-
Einsatzes der Verwaltung als Nachweis dient. Beides ist branchenüblich, aber es sind
Aussagen über Ihre Arbeitsweise.

### Seitentitel und Beschreibungen

An jeden Titel wird „ | CO Gebäudeservice" angehängt.

| Seite | Titel | Beschreibung |
|---|---|---|
| Start | Gebäudereinigung und Hausmeisterservice in Nagold | Treppenhausreinigung, Fensterreinigung, Hausmeisterdienst, Gartenpflege und Winterdienst für Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw. Fester Turnus, ein Ansprechpartner. |
| Leistungen | Reinigung und Hausmeisterservice in Nagold | Acht Leistungen für Hausverwaltungen und Eigentümergemeinschaften in Nagold und im Kreis Calw: von der Treppenhausreinigung über den Hausmeisterdienst bis zum Winterdienst. |
| Über uns | Über uns: Gebäudeservice aus Nagold | CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold, Altensteig, Wildberg, Haiterbach und im Gäu bis Herrenberg. Inhabergeführt, mit fester Objektbetreuung und einem Ansprechpartner. |
| Kontakt | Angebot anfordern: Gebäudeservice Nagold | Objektbesichtigung in Nagold oder im Kreis Calw vereinbaren und ein Angebot zum Festpreis erhalten. Wir melden uns innerhalb von zwei Werktagen mit einem Terminvorschlag. |
| Impressum | Impressum | Anbieterkennzeichnung nach § 5 DDG für CO Gebäudeservice, Oguz Cakir, Schietinger Str. 28 in 72202 Nagold. Kontaktdaten und rechtliche Hinweise. |
| Datenschutz | Datenschutzerklärung | Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO auf der Website von CO Gebäudeservice in Nagold. |
| 404 | Seite nicht gefunden | Die aufgerufene Seite existiert nicht. Zurück zur Startseite von CO Gebäudeservice, Gebäudereinigung und Hausmeisterservice in Nagold. |

Diese Tabelle und die Fragenliste werden von `npm run lint:copy` gegen den Code
geprüft. Abschnitt 6 war stillschweigend veraltet, und ein Freigabedokument, das einen
anderen Text zeigt als die Website, ist schlimmer als keins.

### Weitere geänderte Zeilen

- **Kontakt, Hauptüberschrift:** Angebot für Ihr Objekt in Nagold.
- **Leistungen, Einleitung:** „… legen wir vorab schriftlich fest" →
  „… halten wir vorab im Leistungsverzeichnis fest."
- **Über uns, Einleitung:** ergänzt um „Reinigung, Hausmeisterdienst und Außenanlagen
  aus einer Hand."
- **Über uns, Absatz 3:** „… zuverlässig vor Ort sind" → „Kurze Wege heißen: beim
  Winterdienst und bei kurzfristigen Einsätzen sind wir schnell vor Ort."
- **Ablauf, Schritt 3:** nennt jetzt das Leistungsverzeichnis.
- **Bestätigung nach dem Absenden:** „Danke, wir melden uns innerhalb von zwei
  Werktagen." *(vorher mit Gedankenstrich)*

---

## 12. Struktur und Inhaltstiefe, 21. September 2026

### Die Treppenhaus-Unterseite ist entfallen

Die Website hat vier Seiten: Start, Leistungen, Über uns, Kontakt.
`/leistungen/treppenhausreinigung` gibt es nicht mehr. Der Text der Seite ist nicht
verloren, er stand ohnehin schon auf der Startseite und wird dort jetzt vollständig
gezeigt statt gekürzt.

### Warum überhaupt etwas geändert wurde

Gemessen wurde, wie viele Wörter eine Suchmaschine auf jeder Seite tatsächlich findet:

| Seite | vorher | Befund |
|---|---|---|
| Startseite | 427 | kein einziger erklärender Absatz |
| Leistungen | 701 | acht Leistungen teilen sich rund 210 Wörter |
| Über uns | 222 | die dünnste Seite, und es ist die Vertrauensseite |

Acht Leistungen mit 26 Wörtern pro Leistung sind für eine Suche wie
„Gartenpflege Nagold" kein Inhalt, sondern ein Registereintrag.

### Neu: ein Absatz je Leistung

`src/data/services.ts` — acht Absätze à 50 bis 70 Wörter, auf `/leistungen` unter dem
jeweiligen Kurztext. Sie erklären das Handwerk: was zum Turnus gehört, warum, und in
welchem Intervall es üblich ist. **Bitte gegenlesen, ob das Ihrer Arbeitsweise
entspricht** — etwa, dass bei der Fensterreinigung Rahmen und Falze immer mitgehen,
oder dass die Kellerreinigung in vielen Objekten zweimal jährlich reicht.

### Über uns: neuer Ansatz

Der Betrieb ist neu, ohne Kundenhistorie, mit einer Person. Der bisherige Text
behauptete **eigenes Personal**, **feste Objektbetreuer** im Plural und eine
**Vertretungsregelung bei Urlaub und Krankheit**. Nichts davon trifft zu. Es stand so
im ursprünglichen Entwurf und wurde von dort übernommen, nicht erfunden, aber es musste
raus.

Der erste Versuch ersetzte das durch „Einzelunternehmen" und „Oguz Cakir übernimmt die
Objekte selbst". Das ist zwar richtig, liest sich aber wie eine Offenlegung. Die
Betriebsgröße ist nicht das, was eine Hausverwaltung einkauft, und sie zu nennen wirft
die Frage auf, statt eine zu beantworten. Die Rechtsform steht jetzt nur noch dort, wo
sie hingehört: im Impressum.

Der Text spricht deshalb über das, was der Kunde bekommt: **ein Ansprechpartner von der
Besichtigung bis zur laufenden Betreuung, dieselbe Person im Haus.** Beides stimmt bei
jeder Betriebsgröße, beides ist beim ersten Termin überprüfbar, und nichts davon
behauptet eine Vergangenheit, die es nicht gibt.

- **Überschrift:** Ein fester Ansprechpartner für Objekte in Nagold.
- **Einleitung:** Inhabergeführter Gebäudeservice aus Nagold. Reinigung,
  Hausmeisterdienst und Außenanlagen für Wohn- und Gewerbeobjekte in Nagold und im
  Kreis Calw.
- **Leitsatz:** Im Haus arbeitet immer dieselbe Person.
- **Vier Absätze:** feste Betreuung und ein Ansprechpartner · fester Wochentag, nur so
  viele Objekte wie zuverlässig bedienbar · Besichtigung, Leistungsverzeichnis,
  ausgehängter Plan, Dokumentation · Einsatzgebiet und kurze Wege.

### Die eine Angabe, die noch fehlt

**Was passiert bei Urlaub oder Krankheit?** Das ist die erste Frage, die eine
Hausverwaltung einem Einzelunternehmer stellt, und solange es keine Antwort gibt, kann
keine auf der Website stehen. Eine Absprache mit einem Kollegen, ein Aushang im Objekt,
eine Ankündigungsfrist — was immer zutrifft, gehört als neunte häufige Frage auf
`/leistungen`.

### Ebenfalls geändert

- **Frage 7** hieß „Arbeiten Sie mit eigenem Personal?" und heißt jetzt
  **„Wer kommt in mein Objekt?"** Die Antwort nennt die feste Zuordnung und begründet
  sie damit, dass jemand, der ein Haus kennt, früher sieht, was zusätzlich ansteht.
- Die Beschreibung der Über-uns-Seite für Suchmaschinen sagt statt „Eigenes Personal,
  feste Objektbetreuer" jetzt „Inhabergeführt, mit fester Objektbetreuung und einem
  Ansprechpartner."
- Der dritte Absatz der Treppenhaus-Passage auf der Startseite sagt dasselbe: feste
  Betreuung, ein Ansprechpartner, wer anruft erreicht jemanden, der das Objekt kennt.

**Das Wort „Einzelunternehmen" kommt im Kundentext nicht mehr vor.** Es steht im
Impressum, weil es dort hingehört, und sonst nirgends.

## 13. Hinweis im Kontaktformular, 21. September 2026

Ein neuer Satz, `contact.form.offlineNotice` in `src/data/content.json`:

> Das Kontaktformular wird derzeit eingerichtet. Bitte nutzen Sie vorerst Telefon oder
> WhatsApp, damit Ihre Anfrage uns sicher erreicht.

**Warum er da ist.** Solange der Versand über Resend nicht eingerichtet ist, konnte das
Formular eine Anfrage annehmen, „Danke, wir melden uns innerhalb von zwei Werktagen"
anzeigen und die Anfrage verwerfen. Auf einer Seite, die niemand finden konnte, war das
folgenlos. Mit der Freigabe der Domain wurde daraus der teuerste mögliche Fehler: ein
Interessent geht zufrieden weg und ruft niemanden mehr an.

Der Satz steht jetzt über den Feldern, bevor jemand sechs Angaben macht, und ein
gültiges Absenden wird mit demselben Satz abgelehnt statt bestätigt. Beides verschwindet
automatisch, sobald `PUBLIC_FORM_ENDPOINT` gesetzt ist; es ist also ein Text mit
Ablaufdatum und braucht nur so lange eine Freigabe, wie der Versand offen ist.

**Zur Abstimmung:** ob „wird derzeit eingerichtet" so stehen bleiben soll oder ob der
Kunde eine neutralere Formulierung bevorzugt. Die Alternative wäre, das Formular bis zur
Freischaltung ganz auszublenden und nur Telefon, WhatsApp und Anschrift zu zeigen.
