# Resultatenluchtgeluid

Power BI custom visual voor Acobase met luchtgeluidresultaten per meting en frequentie.

## Velden (Power BI)

De visual ondersteunt:
- meerdere identificatievelden onder Meting;
- DnT per frequentie;
- vaste resultaatkolommen per meting;
- uitklapbare detailmetingen;
- validatiewaarschuwingen en een debugtabel.

## Wat deze visual rendert

- Eén rij per meting.
- DnT-waarden als frequentiekolommen.
- Aanvullende resultaatkolommen en uitklapbare details.

## Projectbestanden

- capabilities.json
- pbiviz.json
- package.json
- tsconfig.json
- eslint.config.mjs
- scripts/sync-version.js
- scripts/bump-version.js
- scripts/pbiviz-wrapper.js
- src/visual.ts
- src/settings.ts
- src/typings.d.ts
- style/visual.less

## Build/start

1. npm install
2. npm run start

Voor package:
1. npm run package

## Publicatie en certificering

```powershell
npm ci
npm run package
npm run certify
```

`package` verhoogt het buildnummer en bouwt alleen lokaal. GitHub-publicatie
gebeurt niet automatisch. `certify` verandert de versie niet en voert de lokale
pre-certificeringscontroles en de Power BI-certificeringsaudit uit.

Losse controles: `npm run lint`, `npm run typecheck`, `npm test`, `npm audit`.

Zie [CERTIFICATION.md](CERTIFICATION.md) voor de volledige releaseprocedure,
bekende beperkingen en nog uit te voeren Power BI-/embeddedtests. Een geslaagde
lokale check is geen Microsoft-goedkeuring. Embedded PDF-export via
`exportToFile` ondersteunt deze custom visual pas na Microsoft-certificering;
ook de capaciteit, tenantinstellingen en exportaanvraag moeten daarvoor kloppen.

De visual gebruikt de Power BI-locale voor getalnotatie en bevat interface- en
formatteringsvertalingen voor Nederlands (`nl-NL`) en Engels (`en-US`). High
contrast gebruikt de hostkleuren van Power BI; toetsenbordbediening omvat
sortering, metingselectie, details en paneelverdeling. Test deze opties nog in
Power BI Desktop en Service volgens [CERTIFICATION.md](CERTIFICATION.md).

Support: [SUPPORT.md](SUPPORT.md). Privacy: [PRIVACY.md](PRIVACY.md).
Licentie: [LICENSE](LICENSE).
