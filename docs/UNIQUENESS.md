# How unique is a Shapy composition?

A composition is the result of a seed plus the renderer settings. The counts
below are conservative: custom colors and custom media registries add further
user-defined combinations that are not counted here. For safety, colors are
capped at 64 tokens, registries at 20 groups, and each group at 200 items.

Theming and text are presentation controls outside the composition math.
Background/text/accent/muted/glow/scrim colors, the optional text overlay, and
its position, scale, alignment, and font do not change which shapes are drawn or
where they are placed. Timeline controls (`live`, `time`, `loop`, and `seek()`),
`safe-zones`, and `aspect` also do not change shape counts or placement; they
select or mask the displayed frame. Custom registries can add user-defined emoji,
image, or icon entries to the selectable pool; those entries are not included in
the 79-key counts below.

## 1. Seed space

Shapy uses a 128-bit seed. The seed can be any string; a 32-character hex seed
uses the full space:

```text
2^128 = 340,282,366,920,938,463,463,374,607,431,768,211,456
      ≈ 3.402823 × 10^38
```

## 2. Shape pools

Including the sticker registry there are 79 selectable shape keys:

- 40 CSS shapes
- 29 emoji
- 10 stickers

Any non-empty custom subset is valid:

```text
2^79 - 1 = 604,462,909,807,314,587,353,087
```

There are also six preset pools: `all`, `geometry`, `lines`, `organic`, `emoji`,
and `stickers`. The `all` preset is the full set, which is already one of the
custom subsets, so add the five other presets:

```text
2^79 - 1 + 5 = 2^79 + 4
             = 604,462,909,807,314,587,353,092
             ≈ 6.044629 × 10^23
```

Without the sticker registry there are 69 keys (40 shapes + 29 emoji):

```text
2^69 + 4 = 590,295,810,358,705,651,716
         ≈ 5.902958 × 10^20
```

## 3. Renderer settings

| Setting | Values |
| --- | ---: |
| Palette | 8 |
| Layout | 7 |
| Alignment | 7 |
| Size mode | 7 |
| Density | 81 (`20`–`100`) |
| Scale | 81 (`60`–`140`) |
| Safe area | 2 |
| Motion | 10 |
| Direction | 10 |
| Speed | 151 (`50`–`200`) |
| Move | 171 (`30`–`200`) |

The static visual settings (everything except motion, direction, speed, and
move) give:

```text
8 × (2^79 + 4) × 7 × 7 × 7 × 81 × 81 × 2
= 21,764,755,758,036,901,049,838,517,726,656
≈ 2.176475 × 10^31
```

Adding motion, direction, speed, and move gives:

```text
2.176475 × 10^31 × 10 × 10 × 151 × 171
≈ 5.619877 × 10^37
```

## 4. Seed × settings

Multiplying the seed space by the full visual settings gives:

```text
2^128 × 5.619877 × 10^37
≈ 1.912345 × 10^76
```

That is:

```text
19,123,452,461,856,457,933,376,428,517,312,612,551,350,612,939,048,154,491,048,265,182,342,650,265,600
```

Pausing animations doubles the runtime states:

```text
≈ 3.824690 × 10^76
```

Timeline controls add many possible frames per composition without changing the
shape math: `seek()` can address any second, `loop` makes the clip periodic, and
`live` can add non-deterministic mutations. Those states are intentionally not
multiplied into the count above.

Custom colors and custom media registries add user-defined combinations on top,
so the real number is larger. Even this conservative count is so large that two
random 128-bit seeds producing the same composition is practically impossible.
Same seed + same settings always reproduces the same result.

---

Shapy is maintained by [Hemant Rao](https://github.com/hemant-rao) and sponsored
by [Odio Book](https://odiobook.com). If this page helped, consider
[sponsoring the project](https://github.com/sponsors/hemant-rao).
