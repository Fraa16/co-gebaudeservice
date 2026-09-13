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
| Start | Gebäudereinigung und Hausmeisterdienst in Nagold | Treppenhausreinigung, Fensterreinigung, Hausmeisterdienst, Gartenpflege und Winterdienst für Objekte in Nagold und Umgebung. Fester Turnus, fester Ansprechpartner. |
| Leistungen | Leistungen — Reinigung und Objektbetreuung | Acht Leistungen für Hausverwaltungen und Eigentümergemeinschaften im Kreis Calw: von der Treppenhausreinigung über den Hausmeisterdienst bis zum Winterdienst. |
| Treppenhausreinigung | Treppenhausreinigung in Nagold | Unterhaltsreinigung von Treppen, Fluren und Eingangsbereichen nach festem Reinigungsplan. Wöchentlich oder 14-tägig, mit eigenem Personal und festem Objektbetreuer. |
| Über uns | Über uns | CO Gebäudeservice betreut Wohn- und Gewerbeobjekte in Nagold und im Kreis Calw — mit eigenem Personal, festen Objektbetreuern und schriftlich vereinbartem Turnus. |
| Kontakt | Kontakt und Angebot anfordern | Objektbesichtigung vereinbaren und ein Angebot zum Festpreis erhalten. Wir melden uns innerhalb von zwei Werktagen mit einem Terminvorschlag. |

An jeden Titel wird „| CO Gebäudeservice" angehängt.

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
