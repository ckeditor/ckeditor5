---
type: Fix
scope:
  - ckeditor5-table
---

Inserting several rows or columns inside the heading section of a table no longer leaves some of the new cells marked as regular data cells.

Inserting rows into the heading section of a table whose columns are all heading columns, or columns into the heading section of a table whose rows are all heading rows, no longer expands the heading section over the whole table. It also no longer removes the footer rows of such a table.
