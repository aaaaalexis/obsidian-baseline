<div align="center">

![](img/hero.png)

### The baseline of your thoughts.

_From the creator of [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino)_

<a href="https://aaaaalexis.github.io/obsidian-baseline/install?name=Baseline"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Open%20in-Obsidian.svg?size=default&amp;theme=violet&amp;mode=dark&amp;logo=obsidian&amp;labelGap=3"><img alt="badge" src="https://shieldcn.dev/badge/Open%20in-Obsidian.svg?size=default&amp;theme=violet&amp;mode=light&amp;logo=obsidian&amp;labelGap=3"></picture></a>
<a href="https://buymeacoffee.com/svnaxis"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Buy%20me%20a%20coffee.svg?size=default&amp;theme=amber&amp;mode=dark&amp;logo=buymeacoffee"><img alt="badge" src="https://shieldcn.dev/badge/Buy%20me%20a%20coffee.svg?size=default&amp;theme=amber&amp;mode=light&amp;logo=buymeacoffee"></picture></a>
<a href="https://wikipedia.org/wiki/Taiwan"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Made%20in-Taiwan.svg?variant=secondary&amp;size=default&amp;mode=dark&amp;logo=ri%3AFaHeart&amp;labelGap=3"><img alt="badge" src="https://shieldcn.dev/badge/Made%20in-Taiwan.svg?variant=secondary&amp;size=default&amp;mode=light&amp;logo=ri%3AFaHeart&amp;labelGap=3"></picture></a>

</div>

## Quick Start

### Migrating from another theme?

Seamlessly migrate your existing Style Settings from supported themes.

**Carry your settings over with [Style Settings Migration Tool ↗](https://aaaaalexis.github.io/obsidian-baseline/migration)**

### Looking for inspiration?

Discover and share Style Settings presets in Baseline Marketplace.

**Explore community-made presets in [Baseline Marketplace ↗](https://aaaaalexis.github.io/obsidian-baseline/marketplace)**

## Overview

### Sleek by default. Yours by design.

**Beautiful starting point.** Clean layout, organized interface, and subtle animations make Baseline feel effortless from the first install.

![](img/elements.png)

**Make it yours.** With deep [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) integration, every detail is yours to shape. Colors, spacing, typography, and beyond.

![](img/colors.png)

**Built for mobile.** Enhanced navigation, refined menus, and comfortable spacing bring the same quality experience to every screen.

![](img/mobile.png)

## Philosophy

### Less _and_ more.

Baseline is built on a simple belief: a great theme should work beautifully without touching a single setting, and transform completely when you're ready to explore.

- **Refined foundation**

  Clean, modern, and polished from day one. Baseline sets a standard your vault can grow from.

- **Thoughtful customization**

  Every option is designed with care. So no matter how far you go, Baseline always looks intentional.

- **More than a theme**

  Hover sidebars, compact elements, polished interface... Baseline takes the best ideas from the community and gives them a home. More than a theme, this is a new starting point for everyone to built upon.

## Features

Baseline supports all filter and helper classes from [Minimal](https://github.com/kepano/obsidian-minimal).

### Banner

| Class                   | Description                                                                                 |
| :---------------------- | :------------------------------------------------------------------------------------------ |
| `banner`                | Add at the end of the image link, e.g. `![[image.jpeg\|banner]]`                            |
| `banner-fade`           | Add faded edge to the banner (requires `banner`)                                            |
| `banner-icon`           | Add an emoji or letter as note icon using callout, e.g. `> [!banner-icon] 👋`               |
| `banner-title`          | Moves inline title next to the icon (requires `banner-icon`)                                |
| `y0`, `y5`... to `y100` | Adjust the vertical position of the banner (requires `banner`), from 0 to 100 in steps of 5 |

### [Block width](https://minimal.guide/features/block-width)

| Class                                  | Description                           |
| :------------------------------------- | :------------------------------------ |
| `wide`                                 | Entire note uses wide line width      |
| `max`                                  | Entire note uses max line width       |
| `table-100`, `bases-100`, `img-100`    | Fill 100% of the pane width           |
| `table-max`, `bases-max`, `img-max`    | Fill the max line width (default 90%) |
| `table-wide`, `bases-wide`, `img-wide` | Fill the wide line width              |

### [Cards](https://minimal.guide/Block+types/Cards)

| Class                 | Description                                      |
| :-------------------- | :----------------------------------------------- |
| `cards` (required)    | Set all Dataview tables to card layout           |
| `list-cards`          | Set all bullet lists to card layout              |
| `cards-align-bottom`  | Align the last element of a card to the bottom   |
| `cards-cover`         | Images are resized to fill the defined space     |
| `cards-16-9`          | Fit images in cards to 16:9 ratio                |
| `cards-1-1`           | Fit images in cards to 1:1 ratio (square)        |
| `cards-2-1`           | Fit images in cards to 2:1 ratio                 |
| `cards-2-3`           | Fit images in cards to 2:3 ratio                 |
| `cards-cols-1` to `8` | Force a specific number of columns (from 1 to 8) |

### Embeds

| Class              | Description              |
| :----------------- | :----------------------- |
| `embed-strict`     | Remove embed background  |
| `embed-hide-title` | Hide embedded file title |

### [Image filters](https://minimal.guide/images#Image+filters)

Add at the end of the image link, e.g. `![[image.jpeg#invert]]`

| Filter       | Description                                                                        |
| :----------- | :--------------------------------------------------------------------------------- |
| `#blend`     | Blend image into background                                                        |
| `#invert`    | Invert images in dark mode — ideal for charts and handwriting on light backgrounds |
| `#invertW`   | Invert images in light mode — ideal for charts and handwriting on dark backgrounds |
| `#circle`    | Crop image to a circle                                                             |
| `#outline`   | Add outline around image                                                           |
| `#interface` | Add drop shadow behind image                                                       |

### [Image grids](https://minimal.guide/Block+types/Image+grids)

| Class      | Description          |
| :--------- | :------------------- |
| `img-grid` | Activate image grids |

### [Tables](https://minimal.guide/tables)

| Class           | Description                                         |
| :-------------- | :-------------------------------------------------- |
| `table-nowrap`  | Disable line wrapping in table cells                |
| `table-wrap`    | Force line wrapping in table cells                  |
| `table-center`  | Center small tables narrower than line width        |
| `table-numbers` | Add row numbers to tables                           |
| `table-tabular` | Use tabular figures in tables                       |
| `table-small`   | Use small font size in tables                       |
| `table-tiny`    | Use tiny font size in tables                        |
| `table-lines`   | Add borders around all table cells                  |
| `row-lines`     | Add borders between table rows                      |
| `col-lines`     | Add borders between table columns                   |
| `row-alt`       | Add striped background to alternating table rows    |
| `col-alt`       | Add striped background to alternating table columns |
| `row-hover`     | Highlight rows on hover                             |

### [Bases](https://minimal.guide/tables)

| Class           | Description                                                    |
| :-------------- | :------------------------------------------------------------- |
| `bases-row-alt` | Add striped background to alternating Bases table view rows    |
| `bases-col-alt` | Add striped background to alternating Bases table view columns |
| `bases-plain`   | Hide embedded Bases toolbar                                    |

### [Alternate checkboxes](https://github.com/damiankorcz/Alternative-Checkboxes-Reference-Set)

![](img/checkbox.png)

| Syntax  | Description |
| ------- | ----------- |
| `- [ ]` | To-do       |
| `- [/]` | Incomplete  |
| `- [x]` | Done        |
| `- [-]` | Canceled    |
| `- [>]` | Forwarded   |
| `- [<]` | Scheduling  |
| `- [?]` | Question    |
| `- [!]` | Important   |
| `- [*]` | Star        |
| `- ["]` | Quote       |
| `- [l]` | Location    |
| `- [b]` | Bookmark    |
| `- [i]` | Information |
| `- [S]` | Savings     |
| `- [I]` | Idea        |
| `- [p]` | Pros        |
| `- [c]` | Cons        |
| `- [f]` | Fire        |
| `- [k]` | Key         |
| `- [w]` | Win         |
| `- [u]` | Up          |
| `- [d]` | Down        |
| `- [+]` | Add         |
| `- [B]` | Brainstorm  |
| `- [a]` | Alarm       |
| `- [n]` | Note        |
| `- [R]` | Review      |
| `- [t]` | Time        |
| `- [P]` | Phone       |
| `- [L]` | Love        |

## Credits

### Community Themes

- [**Minimal** by kepano](https://github.com/kepano/obsidian-minimal) ([Donate](https://www.buymeacoffee.com/kepano)) - Color schemes, Dataview cards, image filters, table helper classes
- [**AnuPpuccin** by AnubisNekhet](https://github.com/AnubisNekhet/AnuPpuccin/) ([Donate](https://buymeacoffee.com/anubisnekhet)) - Catppuccin color schemes
- [**Sanctum** by jdanielmourao](https://github.com/jdanielmourao/obsidian-sanctum) ([Donate](https://ko-fi.com/jdanielmourao)) - Sanctum color scheme
- [**Tiniri** by vladstudio](https://github.com/vladstudio/tiniri-obsidian/) ([Donate](https://vlad.studio/signup)) - Tiniri color scheme
- [**Border** by Akifyss](https://github.com/Akifyss/obsidian-border) - Border workspace
- [**Iridium** by kyffa](https://github.com/kyffa/Iridium) - Frame workspace

### Extras

- [**Chill Jinshu Song** by Warren2060](https://github.com/Warren2060/ChillJinshuSong) - Heading font for extended language support
- [**Obsidian Baseline Theme Customization** by bwya77](https://github.com/bwya77/obsidian-baseline-customization) - Admin color scheme, Block properties style

### Inspiration

- [**Craft Docs**](https://www.craft.do/) - Cupertino workspace, Fusion workspace

## License

Baseline is licensed under the [MIT license](LICENSE).
