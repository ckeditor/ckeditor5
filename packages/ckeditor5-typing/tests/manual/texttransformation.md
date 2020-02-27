## Text transformation

The list of default transformations is available in the docs.

Some of the transformations are:

1. Symbols:

    * Copyright: `(c)` to `©`.
    * Registered treademark: `(r)` to `®`.
    * Trade mark: `(tm)` to `™.`

1. Mathematical:

    * Fractions of 2, 3 & 4, like `½` to `½` or `3/4` to `¾`. (ps.: there's no `2/4` 😉)
    * Arrows: `->`, `<-`.
    * Operators: `<=` to `≤`, `>=` to `≥`, `!=` to `≠`.

1. Typography:

    * Dashes: ` -- `, ` --- `.
    * Ellipsis: `...` to `…`

1. Quotes:

    * Primary quotes (english): `'Foo bar'` to `‘Foo bar’`
    * Secondary quotes (english): `"Foo bar's"` to `“Foo bar's”`

### Testing

* Check if the transformation works. Note that some might need a space to trigger (dashes).
* Undo a text transformation and type - it should not re-transform it.
* Change selection - the not transformed elements should stay.
