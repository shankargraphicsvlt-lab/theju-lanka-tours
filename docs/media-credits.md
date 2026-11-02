# Media credits and licensing

## GSKT Lanka Tours logo pack

`public/brand/`: logo pack supplied by the business (added 2026-11-01): full vertical logo (`gskt-logo-*`) and elephant icon (`gskt-icon-*`), SVG and PNG. These files are not edited. `scripts/generate-brand-assets.mjs` derives from them: `gskt-logo-white-cropped.svg` (footer; same artwork with the empty margins cropped), the favicon and app icons (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`, `public/icons/`) and the 1200×630 share image (`src/app/opengraph-image.png`, `twitter-image.png`). Rerun the script after replacing any logo file.

## Island map illustration

`public/images/island-map.webp`: illustrated map poster of Sri Lanka supplied by the business (added 2026-10-30), shown in the homepage "Where will your journey take you?" section. Converted from the supplied PNG (1083×1452, WebP, not cropped). Captioned "Illustrative map, not to scale" (the "Illustration" badge was removed on 2026-10-31). Source and licence: _to be provided_.

## Destination hero illustrations (AI-generated)

Stored in `public/images/destinations/{key}/hero.webp`, converted with `scripts/import-destination-photo.mjs` (resized to at most 1920px wide, WebP, **not cropped**). Added 2026-10-28.

These are **AI-generated illustrations supplied by the business**, not photographs. Some scenes are not accurate depictions (for example, the Yala image shows a leopard and an elephant herd together in a savanna-like landscape, and the Kandy temple's architecture differs from the real Temple of the Tooth). The "Illustration" badges and "Illustration of …" alt text were removed at the owner's request on 2026-10-31; the images are now shown without a label, and alt text gives only the place name.

The original Sigiriya and Kandy images carried the image generator's logo in the top-right corner and were not cropped; the owner chose to replace them (decided 2026-10-28). **Sigiriya was replaced on 2026-10-30** with a new image without a logo. **Kandy still awaits its replacement**; to swap it in, run `node scripts/import-destination-photo.mjs kandy <new-file>`, which overwrites `hero.webp`.

| Key | Used for | Source / tool | Licence or terms | Confirmed by |
| --- | --- | --- | --- | --- |
| sigiriya | Sigiriya & Dambulla page; "Sigiriya area" nights | _to be provided_ | _to be provided_ | _to be provided_ |
| kandy | Kandy | _to be provided_ | _to be provided_ | _to be provided_ |
| galle | Galle | _to be provided_ | _to be provided_ | _to be provided_ |
| ella | Ella | _to be provided_ | _to be provided_ | _to be provided_ |
| yala | Yala | _to be provided_ | _to be provided_ | _to be provided_ |
| nuwara-eliya | Nuwara Eliya | _to be provided_ | _to be provided_ | _to be provided_ |
| polonnaruwa | Polonnaruwa | _to be provided_ | _to be provided_ | _to be provided_ |
| mirissa | Mirissa page; Mirissa nights in itineraries | _to be provided_ | _to be provided_ | _to be provided_ |
| negombo | Negombo | _to be provided_ | _to be provided_ | _to be provided_ |
| anuradhapura | Anuradhapura | _to be provided_ | _to be provided_ | _to be provided_ |

Anuradhapura's hero was added on 2026-10-31 (supplied as a 1672×941 PNG, converted to WebP, not resized or cropped). South Coast uses the Mirissa image. The earlier 3D diorama artwork is no longer used and is kept in `_unused_3d/`. Optional `gallery-1.webp` to `gallery-3.webp` files in the same folder add a thumbnail strip to the hero, labelled with the page's first three highlights in order.

## Photographs (Unsplash)

All photographs are from [Unsplash](https://unsplash.com) and were individually checked on their photo pages (on 2026-10-27) to confirm that they are offered under the free **Unsplash License**, not the paid Unsplash+ licence.

**Unsplash License summary** (see https://unsplash.com/license for the full terms): photos can be downloaded and used for free, for commercial and non-commercial purposes, without permission. Attribution is not required but is appreciated. The licence does **not** allow selling unaltered copies, or compiling photos to build a similar or competing image service.

Photos are downloaded once, stripped of metadata, resized and re-encoded as progressive JPEGs by `scripts/fetch-images.mjs`, then stored in `src/assets/images/`. Next.js generates responsive AVIF/WebP versions and blur placeholders at build and request time. No images are hot-linked from external servers.

The single source of truth is [`src/content/image-credits.json`](../src/content/image-credits.json). Credits are also shown on the site at `/gallery`.

| File | Subject | Photographer | Unsplash page |
| --- | --- | --- | --- |
| sigiriya-aerial.jpg | Sigiriya rock fortress, aerial | Dylan Shaw | https://unsplash.com/photos/smUAKwMT8XA |
| sigiriya-rock.jpg | Sigiriya Rock | Matt Dany | https://unsplash.com/photos/q357pEmGJro |
| dambulla-cave-temple.jpg | Dambulla cave temple | Vedanth Ravi | https://unsplash.com/photos/QxaWoVgvi4I |
| kandy-temple-of-the-tooth.jpg | Temple of the Sacred Tooth Relic, Kandy | Chathura Anuradha Subasinghe | https://unsplash.com/photos/Xj28T1jQSlc |
| kandy-esala-perahera.jpg | Fire dancers, Esala Perahera, Kandy | Yves Alarie | https://unsplash.com/photos/yaGheETUSK4 |
| ella-nine-arches-train.jpg | Nine Arches Bridge, Ella | Hendrik Cornelissen | https://unsplash.com/photos/jpTT_SAU034 |
| ella-nine-arches-aerial.jpg | Nine Arches Bridge, aerial | Sarmat Batagov | https://unsplash.com/photos/uCXOO4NS22E |
| tea-plucking-talawakelle.jpg | Tea plucking, Talawakelle | Asantha Abeysooriya | https://unsplash.com/photos/beNiTTa8Pp8 |
| galle-lighthouse.jpg | Galle Fort lighthouse | Yawor Canyona | https://unsplash.com/photos/IZu97VzbrD4 |
| galle-clock-tower.jpg | Galle Fort clock tower | Polina Kneis | https://unsplash.com/photos/KcqxBAqYk2M |
| yala-leopard.jpg | Leopard, Yala National Park | Geoff Brooks | https://unsplash.com/photos/3TwThGdEUZA |
| minneriya-elephants.jpg | Elephants, Minneriya | Udara Karunarathna | https://unsplash.com/photos/d8Lw4p8MVOg |
| safari-elephant.jpg | Elephant on safari, Sri Lanka | Tom Paisley | https://unsplash.com/photos/v2zEiziFb44 |
| mirissa-beach.jpg | Mirissa beach | Zoshua Colah | https://unsplash.com/photos/fLMYjafNugw |
| mirissa-shore.jpg | Rocky shore, Mirissa | Zoshua Colah | https://unsplash.com/photos/JqilJONARTQ |

A candidate tea-estate photo was rejected because its location was Cameron Highlands, Malaysia, not Sri Lanka.

## Notes and recommendations

- **People in photos:** the Unsplash License covers copyright in the photograph only. It does not include model releases. Avoid using photos with identifiable people in ways that suggest they endorse the business (the tea-plucker and Perahera images are used editorially).
- **Replace with your own photography** where possible; original images strengthen the brand and remove any third-party dependency.
- **Adding a photo:** add an entry to `image-credits.json`, run `npm run images:fetch`, then register it in `src/content/images.ts`.
