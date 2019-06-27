## Text transformation

The list of default transformations is available in the docs.

Some of the transformations are:

1. Symbols:

    * Copyright: `(c)` -> `©`.
    * Registered treademark: `(r)` -> `®`.
    * Trade mark: `(tm)` -> `™.`

1. Mathematical:

    * Fractions of 2, 3 & 4, like `½` -> `½` or `3/4` -> `¾`. (ps.: there's no `2/4` 😉)
    * Arrows: `->`, `<-`.
    * Operators: `<=` -> `≤`, `>=` -> `≥`, `!=` -> `≠`.

1. Typography:
    
    * Dashes: ` -- ` & ` --- `.
    * Ellipsis: `...` -> `…`
    
1. Quotes:

    * Primary quotes (english): `'Foo bar'` -> `‘Foo bar’` 
    * Secondary quotes (english): `"Foo bar's"` -> `“Foo bar's”`

### Testing

* Check if the transformation works. Note that some might need a space to trigger (dashes).
* Undo a text transformation and type - it should not re-transform it.
* Change selection - the not transformed elements should stay. 
