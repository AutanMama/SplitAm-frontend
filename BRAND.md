# SplitAm brand guide

SplitAm runs ajo (also called esusu or adashi): a circle puts money in every round, and one hand collects the whole pot. The identity comes from **adire**, the indigo resist-dyed cloth of the Yoruba. Ajo and adire belong to the same world, the market women's circle, so the product looks like where ajo comes from, not like every other fintech.

## Principles

1. **The cloth is the signature.** Adire motifs appear where it matters: the home banner, the money card, the ajo card, the sign-in panel. Never as random decoration on every surface.
2. **Indigo for trust, kola for money.** Deep indigo carries the brand and the main actions. Kola-nut ochre marks money moments: the pot, your turn, a completed round.
3. **Editorial, not template.** Headlines are set in a high-contrast serif. Sections tell a story ("a round in the life of an ajo", "five rules every fair ajo keeps") instead of the usual feature grid.
4. **Mobile first.** Most people open SplitAm from a WhatsApp link on their phone. Every screen is designed at 390px first.

## Colour

All colours are tokens in `src/styles/index.css`. Components never use raw hex values.

| Token          | Hex       | Use                                                |
| -------------- | --------- | -------------------------------------------------- |
| `bg`           | `#F7F7F4` | App background (undyed cotton)                     |
| `surface`      | `#FFFFFF` | Cards, sheets                                      |
| `sunk`         | `#ECECE6` | Inputs, avatars, skeletons                         |
| `line`         | `#E1E1DA` | Borders, dividers                                  |
| `ink`          | `#141826` | Main text                                          |
| `muted`        | `#575C6B` | Supporting text                                    |
| `indigo`       | `#1B2A5E` | Primary buttons, money card, ajo card              |
| `indigo-deep`  | `#0F1A3D` | Hero and sign-in panel                             |
| `indigo-muted` | `#B4BEDD` | Supporting text on indigo, cloth motifs            |
| `kola`         | `#E1A33B` | The pot, your turn, highlights (fill only)         |
| `kola-text`    | `#8A5A0B` | Kola used as text on light backgrounds             |
| `paid`         | `#1F7A4D` | Paid, completed (with `paid-soft`)                 |
| `due`          | `#7A4F08` | Waiting, pending (with `due-soft`)                 |
| `danger`       | `#B3261E` | Errors, destructive actions (with `danger-soft`)   |

### Contrast (WCAG 2.1)

| Pair                       | Ratio | Level |
| -------------------------- | ----- | ----- |
| ink on bg                  | 16.5  | AAA   |
| muted on bg                | 6.21  | AA    |
| muted on sunk              | 5.62  | AA    |
| white on indigo            | 13.6  | AAA   |
| kola on indigo             | 6.17  | AA    |
| kola on indigo-deep        | 7.69  | AAA   |
| indigo-muted on indigo     | 7.37  | AAA   |
| kola-text on bg            | 5.51  | AA    |
| paid on paid-soft          | 4.59  | AA    |
| danger on danger-soft      | 5.55  | AA    |

## Type

- **Gloock** for headlines, page titles and big numerals. It's a high-contrast serif with the confidence of a printed banknote.
- **Schibsted Grotesk** for everything else. It's a newspaper grotesk: clear at small sizes, with more character than the usual UI fonts.
- **Geist Mono** only for invite codes and references people read out loud.
- Gloock has no naira sign. Amounts are always set in the grotesk, and serif text that contains ₦ uses `SerifText`, which swaps just the symbol.
- Minimum text size is 12px everywhere.

## Adire motifs

Drawn as SVG pattern tiles in `src/components/brand/AdirePattern.jsx`:

| Motif     | Based on                         | Used for                              |
| --------- | -------------------------------- | ------------------------------------- |
| `oniko`   | Tie-dye concentric circles       | Money card, ajo card, closing banner  |
| `lattice` | Eleko starch-resist diamond grid | Hero, sign-in panel, story section    |
| `ladder`  | Alabere stitched lines           | The cloth strip between sections      |

The **Adire wheel** (`AdireWheel.jsx`) is the brand's hero image: each member of the circle is a segment of cloth around the pot, and the kola segment moves to whoever collects next.

## Logo

Eight dots around a kola centre: the members of a circle around the pot. One dot is kola, for whoever's turn it is. The wordmark is set in Gloock.

## Motion

- Landing entrance: the headline, text and buttons rise in one after another, and the kola underline draws itself under "wahala".
- The wheel passes the turn every 2.2 seconds.
- Sheets slide up and toasts drop in. Everything respects `prefers-reduced-motion`.

## Voice

Short, plain and Nigerian-friendly: "Start your circle", "Collects this round", "I've paid", "Send pot", "Let in". Never "disburse" or "contribution cycle" in the UI.
