---
type: Feature
scope:
  - ckeditor5-table
closes:
  - https://github.com/ckeditor/ckeditor5/issues/12712
---

Rows and columns inserted into a table now keep the formatting of the row or column the user acted on. When the table cell properties feature is enabled, new cells inherit the cell styles of the corresponding cells (borders, background color, padding, and alignment). Typing in a new empty cell continues the text formatting found at the start of the corresponding cell, as well as its paragraph alignment. This applies to inserting rows above or below, inserting columns to the left or right, pressing <kbd>Tab</kbd> in the last table cell, expanding a table while pasting, and splitting a cell. Text formatting is also continued in editors without the table cell properties feature.

Rows and columns inserted at the boundary of the heading or footer section now become part of the section of the row or column the user acted on. For example, a row inserted below the last heading row becomes a heading row, and a row inserted above the first footer row becomes a footer row. Rows and columns added next to a table made of heading or footer rows only, or of heading columns only, still become regular body rows and columns.

The `TableUtils#insertRows()` and `TableUtils#insertColumns()` methods accept the new `referenceRow` and `referenceColumn` options that enable this behavior. Calls without these options work as before.
