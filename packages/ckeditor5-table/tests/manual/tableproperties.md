### Loading

The editor should be loaded with tables:

1. A table with various table styles set and with nested styled table in the last row.
1. A "Table from Word" sample.
1. A "Table from GDocs" sample.
1. A "Table from GDocs" sample that has one cell with many styles set.

Compare their visual styles with the ones beside the editor. Most of the styles should be preserved.

**Note**: Not all styles are preserved (i.e. the column height/width in the second GDocs table). Also note that the original table might have a different cell padding.

After all, clear the editor before starting checking the default table and cell properties.

### Default table properties

After inserting a new table, the default styles (printed below) should be applied to the table automatically:

```json
{
    "borderStyle": "dashed",
    "borderColor": "hsl(0, 0%, 60%)",
    "borderWidth": "3px",
    "alignment": "left"
}
```

Use the `Table properties` icon in the table toolbar and compare values.

### Default cells properties

After inserting a new table, the default styles (printed below) should be applied to all cells automatically:

```json
{
    "borderStyle": "dotted",
    "borderColor": "hsl(120, 75%, 60%)",
    "borderWidth": "2px",
    "horizontalAlignment": "right",
    "verticalAlignment": "bottom"
}
```

Use the `Cell properties` icon in the table toolbar and compare values.
