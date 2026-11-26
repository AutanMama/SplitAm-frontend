# SplitAm brand guide

SplitAm runs ajo (also called esusu or adashi): a group puts money in every round, and one hand collects the whole pot. People only use it if they trust it, so the design has one job: make money and turns obvious. Who paid, who hasn't, whose turn it is, and what you owe.

## Principles

1. **Money first.** Amounts are the biggest thing on any screen and always use tabular figures.
2. **Status is colour plus words.** Paid is green, due is amber, a problem is red, and each always comes with a label, never colour alone.
3. **Calm by default.** Forest green and white for everyday screens. Lime appears only for money moments: the pot, your turn, a completed round.
4. **Mobile first.** Most people open SplitAm from a WhatsApp link on their phone. Every screen is designed at 390px first.

## Colour

All colours are tokens in `src/styles/index.css`. Components never use raw hex values.

| Token           | Hex       | Use                                              |
| --------------- | --------- | ------------------------------------------------ |
| `bg`            | `#F4F5F2` | App background                                   |
| `surface`       | `#FFFFFF` | Cards, sheets                                    |
| `sunk`          | `#EEF0EC` | Inputs, avatars, skeletons                       |
| `line`          | `#E2E5DF` | Borders, dividers                                |
| `ink`           | `#0F1A16` | Main text                                        |
| `muted`         | `#5A6560` | Supporting text                                  |
| `forest`        | `#0F3D2E` | Primary buttons, the money card, active nav      |
| `forest-muted`  | `#A9C2B6` | Supporting text on forest                        |
| `lime`          | `#C8F169` | Money highlights on forest; never text on light  |
| `paid`          | `#1F7A4D` | Paid, completed (with `paid-soft` background)    |
| `due`           | `#8A5200` | Due, pending, waiting (with `due-soft`)          |
| `danger`        | `#B3261E` | Errors, destructive actions (with `danger-soft`) |

### Contrast (WCAG 2.1)

| Pair                     | Ratio | Level |
| ------------------------ | ----- | ----- |
| ink on bg                | 16.3  | AAA   |
| muted on bg              | 5.54  | AA    |
| muted on sunk            | 5.28  | AA    |
| white on forest          | 12.2  | AAA   |
| lime on forest           | 9.40  | AAA   |
| forest-muted on forest   | 6.41  | AA    |
| paid on paid-soft        | 4.59  | AA    |
| due on due-soft          | 5.72  | AA    |
| danger on danger-soft    | 5.55  | AA    |

## Type

- **Onest** for everything. It's friendly, but still serious enough for money.
- **Geist Mono** only for invite codes and references people type or read out loud.
- Amounts use the `money` class: tabular figures and tight tracking.

## Shape

- Cards 20px radius, buttons and inputs 12px, avatars round.
- One card shadow. Sheets and toasts use the float shadow.
- On phones, dialogs are bottom sheets so they're easy to reach with a thumb.

## Voice

Short, plain and Nigerian-friendly: "Collects this round", "I've paid", "Send pot", "Let in". No jargon like "disburse" or "contribution cycle" in the UI.
