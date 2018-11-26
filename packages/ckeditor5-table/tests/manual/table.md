### Loading

1. The data should be loaded with:
  * a complex table with:
    - one heading row,
    - two heading columns,
    - merged cells in heading columns section,
  * a table with 2 tbody sections in the DOM - should be rendered as a table with one tbody.
  * a table with no tbody sections in the DOM - should be rendered as a table with one tbody.
  * a table with a thead section between two tbody sections in dom - should be rendered as a table with one thead and on tbody section in proper order: 1, 2, 3.

2. Main toolbar should have insert table dropdown.

3. While the table cell is selected there should be a toolbar attached to the table with 3 dropdowns:
  * column dropdown with items:
    - header column,
    - insert column left,
    - insert column right,
    - delete column.
  * row dropdown with items:
    - header row,
    - insert row below,
    - insert row above,
    - delete row.
  * merge cell dropdown with items:
    - merge cell up,
    - merge cell right,
    - merge cell down,
    - merge cell left,
    - split cell vertically,
    - split cell horizontally,

4. While the table widget is selected there should be `bold` and `italic` buttons

### Testing

Inserting table:

1. Insert table of chosen size - the inserted table should have number columns & rows as selected in dropdown.
2. Re-opening dropdown should reset selected table size.
3. Table cannot be inserted into other table.

Column manipulation:

1. Insert column in table heading section.
2. Insert column in merged cell.
3. Insert column at the end/beginning of a table.
4. Remove column from table heading section.
5. Remove column of merged cell.
6. Change column heading status.

Column manipulation:

1. Insert row in table heading section.
2. Insert row in merged cell.
3. Insert row at the end/beginning of a table.
4. Remove row from table heading section.
5. Remove row of merged cell.
6. Change row heading status.

Merging cells:

1. Merge cell on the left/right/top/bottom of current cell.
2. Merge cell on the left/right/top/bottom touching another table section (mergin a table cell from header row with a cell from body should not be possible).
3. Merge cells that are already merged.

Splitting cells:
1. Split not merged cell vertically/horizontally.
2. Split already merged cell vertically/horizontally.
