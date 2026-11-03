# PiRC-207 Seven Colored Layers — Source Mapping

The seven chakra/color labels below are taken from the PiRC-207 v2 proposal and `assets/js/token_layers.js` in Unity Sphere. They are proposal semantics, not official Pi Network token classes or guaranteed exchange values.

| Order | Color | Chakra | Label / role | Source constant |
|---:|---|---|---|---:|
| 1 | Red | Root | Governance | GOV |
| 2 | Orange | Sacral | Mid-tier utility | 3141 |
| 3 | Yellow | Solar Plexus | High-tier utility | 31140 |
| 4 | Green | Heart | PiCash / daily utility | 3.14 |
| 5 | Blue | Throat | Banking / institutional layer | 314 |
| 6 | Indigo | Third Eye | Premium reserve | 314159 |
| 7 | Purple | Crown | Mined Pi and fractions | 1 |

## Conversion constants stated in the proposal

- Heart and Throat: 10,000 units = 1 Pi.
- Heart and Throat: 1,000 units = 1 PiGCV.
- Heart and Throat: 1 unit = 1,000 micro.
- Crown: 10,000,000 micro = 1 Pi.
- Red, Orange, Yellow and Indigo: no complete conversion rule is specified in the cited proposal.

## Unresolved registry mismatch

The current repository CSV lists Purple, Gold, Yellow, Orange, Blue, Green and Red contract identifiers. It does not contain an Indigo contract identifier, while Gold has no matching chakra-layer definition. A versioned proposal must resolve this mismatch; no address should be silently reassigned.

## Value and exchange disclaimer

A token symbol, color, constant or internal reference is not a market quote, guaranteed parity, redeemable USD, collateral proof or enforceable purchasing power. External market price, internal reference, merchant quote, collateral value and cash redemption value must be separate typed fields with independent sources and rules.
