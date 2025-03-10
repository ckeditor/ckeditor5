### Layout Table

Based on the feature heuristic, upcasted tables will be set to layout tables when one of the below conditions is met:

 - there is no figure wrapper,
 - there is no `<caption`> element inside `<table>`,
 - there is no `content-table` class.

Besides this, any other table will be set as a content table (regular one).

If a table is recognized as a layout table, any `<th>` elements it contains will be converted to `<td>` elements.

Setting header row or column on layout tables is blocked.
