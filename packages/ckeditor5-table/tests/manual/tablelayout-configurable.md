### Configuration of the Layout Table

By default the feature heuristic, upcasted tables will be set to layout tables when one of the below conditions is met:

 - there is no figure wrapper,
 - there is no `<caption`> element inside `<table>`,
 - there is no `content-table` class.

But it can be changed using configuration option, for example to prefer the external table type to be `content` use:

```
table: {
  tableLayout: {
    preferredExternalTableType: 'content'
  }
}
```

Similar for layout tables:

```
table: {
  tableLayout: {
    preferredExternalTableType: 'layout'
  }
}
```

*Note: The highest priority has recognition by CSS classnames: `content-table` and `layout-table`.*
