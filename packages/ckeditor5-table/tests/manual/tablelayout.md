### Layout Table

Based on feature heuristic, upcasted tables will be set to layout tables when one of below condition is met:
 - there is no figure wrapper,
 - there is no `<caption`> element inside `<table>`,
 - there is no `content-table` class.

Besides this any other table will be set as a content table (regular one).

If a table recognize as layout table will contains `<th>` all those cells will be changed into `<td>`.

If a table is recognized as a layout table, any `<th>` elements it contains will be converted to `<td>` elements. Setting header row or collumn on layout tables is blocked.
