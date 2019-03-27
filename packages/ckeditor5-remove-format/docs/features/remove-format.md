---
title: Remove Format
category: features
---

The {@link module:remove-format/removeformat~RemoveFormat} feature allow to easily remove any formatting.

Since it only clears formatting markup, this means that items like links, tables or images will not be removed.

{@snippet features/build-remove-format-source}

## Demo

{@snippet features/remove-format}

## Configuring the remove format feature

Elements considered by remove format feature are determined by schema. Only elements marked with `isFormatting` property are removed by the remove format feature.
