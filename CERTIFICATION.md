# AppSource en certificering

## Status en afbakening

Dit project bevat lokale pre-certificeringscontroles, geen bewijs van
Microsoft-certificering. Een groene check betekent niet dat alle functionele,
toegankelijkheids-, listing- en Power BI-tests zijn uitgevoerd.

De publieke repository staat op
https://github.com/sierdtilma/Acobase-ResultatenLuchtgeluid. Gebruik `main` voor
ontwikkeling en `certification` voor de broncode van de ingediende versie.
Wijzig `certification` alleen bij een volgende inzending. Controleer voor indiening
dat alle publicatielinks toegankelijk zijn voor reviewers.
Deze repository mag maar een visual bevatten.

## Reproduceerbare release

1. `npm ci` installeert de vastgelegde dependencies.
2. `npm run package` verhoogt het buildnummer en synchroniseert alle versies.
   Dit bouwt alleen lokaal: het commit of pusht niet.
3. `npm run certify` voert metadata-, broncode-, lint-, type-, regressie- en
   dependencycontroles uit en bouwt dezelfde versie met `--certification-audit`.
4. Test de definitieve `.pbiviz` uit `dist/` met een representatieve test-PBIX.
5. Leg pakketnaam, versie, SHA-256, testresultaten en broncodecommit vast.
6. Publiceer na akkoord de overeenkomende broncode op de branch `certification`
   (kleine letters), exclusief `node_modules`, `.tmp` en `dist`.
7. Upload exact het geteste pakket naar Partner Center. Bevries de
   `certification`-branch tot een volgende inzending. Wijzig de GUID niet.

`npm run package` mag niet opnieuw worden gebruikt om dezelfde ingediende versie
te reconstrueren: dat verhoogt de versie. Gebruik daarvoor
`npm run pbiviz:raw -- package --certification-audit` vanaf de ingediende broncode.
`npm run publish-github` is een afzonderlijk, expliciet publicatiecommando dat
commit en push kan uitvoeren; controleer eerst remote, branch en wijzigingen.

De typecontrole gebruikt `--skipLibCheck` voor overlappende Power BI-declaraties
in dependencies. Eigen TypeScript-code wordt gecontroleerd; de webpack-build
blijft een aanvullende controle. De volledige aanbevolen Power BI ESLint-regels
gelden voor `src/`. Alleen Node-bestandspaden en dynamische `require`-paden zijn
uitgezonderd in lokale hulpscripts, die niet in de visualbundle komen.

## Dependencyfixes

Microsoft vereist dat `npm audit` geen moderate, high of critical bevindingen
oplevert. De lokale gate gebruikt daarom `--audit-level=moderate`, niet alleen high.

Twee tijdelijke ontwikkeltool-overrides volgen de projectinfo-visual:

- `braces`: openbare fork, vastgepind op commit
  `ce0ea90413e22d184f73b840f34770fd47b163ef`. Deze bevat de nesting-depth-fix
  uit upstream PR 72 tegen GHSA-vfj7-8cjw-p6xm. Een versienummer alleen is geen
  bewijs van een fix; controleer ook de patch en gedragstests. Geef Microsoft
  toegang tot deze broncode en verwijder de override zodra upstream is gepatcht.
- `sockjs -> uuid`: versie `11.1.1` tegen GHSA-w5hq-g745-h8pq.

Gebruik geen `npm audit fix --force`: npm stelt hiervoor een ongeschikte downgrade
van de Power BI-buildtools voor. Bouw en test opnieuw na dependencywijzigingen.

## Verplichte praktijktests - nog uit te voeren

Leg per test omgeving, versie, datum en resultaat vast. Gebruik ook de
Microsoft-sampledataset uit de certificeringsdocumentatie.

- [ ] Test-PBIX met representatieve luchtgeluidmetingen, toelichting, resultaten,
  extra details, waarschuwingen en meerdere grafiekreeksen.
- [ ] Omzetten van kolomdiagram en gauge naar deze visual en weer terug.
- [ ] Lege data, een rij, meerdere metingen, null, verkeerde typen, negatieve en
  zeer grote waarden, ontbrekende rollen en velden in willekeurige volgorde wissen.
- [ ] Min/max veldbindingen en alle combinaties van optionele velden.
- [ ] Formatpaneel openen met iedere veldconfiguratie; tekst, numerieke grenzen,
  kleuren, assen, frequentiebereik en herstel van standaardwaarden testen.
- [ ] Selectie en Ctrl-multiselect, crossfiltering vanuit andere visuals,
  slicers, visual-/pagina-/rapportfilters, RLS en tooltipinhoud.
- [ ] Rechtermuisknop op lege ruimte, grafieklijn, meetpunt en tabelrij geeft
  het juiste Power BI-contextmenu en de juiste identiteit.
- [ ] Geen JavaScript-fouten bij alle bovenstaande situaties.
- [ ] Kleine en grote viewports, alle paginazoommodi, scrollbars, vensterhoogtes,
  lange labels, uitklappen, mobiele layout en meerdere visualinstanties.
- [ ] Rapport opslaan, opnieuw openen, wisselen van pagina, lezen/bewerken,
  publiceren naar Service en vastmaken aan dashboard.
- [ ] Prestaties met veel metingen/frequenties en tot 30.000 aangeleverde rijen;
  beoordeel ook dat datareductie geen onbedoelde onvolledige resultaten geeft.
- [ ] Actuele Power BI Desktop en Service, Edge/Chrome/Firefox en embedded app.
- [ ] Toetsenbordbediening, focus, screenreader, kleurcontrast en high-contrast
  beoordelen. Volledige ondersteuning wordt niet door deze release geclaimd;
  registreer en verhelp tekortkomingen voor indiening.
- [ ] Desktop-PDF testen; grafiek/assen/tabel mogen niet leeg of verschoven zijn.

## Embedded PDF-export

Microsoft ondersteunt niet-gecertificeerde custom visuals niet in de
`exportToFile`-API. Alleen de metadata aanpassen of een `.pbiviz` uploaden maakt
de visual niet gecertificeerd. Installeer na goedkeuring de AppSource-versie met
dezelfde GUID; houd rekening met de uitroltijd van Microsoft.

Na certificering nog uitvoeren:

- [ ] Service-export naar PDF/PowerPoint en de werkelijke embedded
  `exportToFile`-flow met het definitieve rapport testen.
- [ ] Workspace en betrokken semantic models staan op geschikte
  Premium-, Embedded- of Fabric-capaciteit. PPU alleen is niet voldoende.
- [ ] Tenantinstelling voor PDF-/PowerPoint-export is ingeschakeld.
- [ ] Exportaanvraag gebruikt de bedoelde pagina, filters, bookmark en eventuele
  RLS-identiteit; zonder deze instellingen is de standaardrapportstaat leidend.
- [ ] Controleer dat de gewenste instellingen na opnieuw laden terugkomen.
  Tijdelijke lokale UI-staat, zoals sortering, scrollpositie, uitgeklapte details
  en actieve grafiekselecties, gaat niet vanzelf mee naar de exportworker.
- [ ] Controleer clipping: PDF is een momentopname van de visualviewport,
  geen automatische meerpagina-export van verborgen of gescrolde tabelrijen.
- [ ] Controleer beperkingen voor sensitivity labels en service principals.

De visual meldt rendering pas gereed nadat alle ingeplande layoutframes klaar
zijn. De visual vraagt geen `ExportContent`-privilege: Service-/REST-export
wordt door Power BI uitgevoerd en is iets anders dan eigen bestandsdownloads.

## Partner Center - nog nodig

- [ ] Repository publiceren en reviewer-toegang regelen; branch `certification`
  moet exact de ingediende versie bevatten.
- [ ] Supportadres en eigendom/rechten/licentie juridisch bevestigen.
- [ ] [PRIVACY.md](PRIVACY.md) laten goedkeuren door de verantwoordelijke en een
  publiek toegankelijke privacy-URL invullen in de listing.
- [ ] Support-URL en broncode-URL controleren. Voorgestelde privacy-URL:
  `https://github.com/sierdtilma/Acobase-ResultatenLuchtgeluid/blob/main/PRIVACY.md`.
- [ ] Kies in Partner Center het Microsoft-standaardcontract/Power BI-contract
  of een juridisch goedgekeurde eigen EULA. De MIT-broncodelicentie is geen
  automatische vervanging van deze listingkeuze.
- [ ] Omschrijving, 300 x 300 PNG-logo (voorbereid als
  [assets/appsource-logo.png](assets/appsource-logo.png)), testinstructies en een
  offline werkende sample-PBIX voorbereiden.
- [ ] Een tot vijf actuele PNG-screenshots: exact 1366 x 768 pixels en elk
  maximaal 1024 kB. Laat de feitelijke visual met representatieve data zien.
- [ ] In Partner Center bij Product setup `Request Power BI certification`
  selecteren en bij Notes for certification de broncode/reviewinformatie invullen.

## Officiele bronnen

- https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified
- https://learn.microsoft.com/power-bi/developer/visuals/guidelines-powerbi-visuals
- https://learn.microsoft.com/power-bi/developer/visuals/submission-testing
- https://learn.microsoft.com/power-bi/developer/embedded/export-to