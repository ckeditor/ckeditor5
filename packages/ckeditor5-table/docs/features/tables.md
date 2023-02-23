---
menu-title: Overview
category: tables
order: 10
modified_at: 2023-02-22
---

# Tables in CKEditor 5 (overview)

{@snippet features/build-table-source}

The table feature offers table creation and editing tools that help content authors bring tabular data into their documents. Tables help organize the content in a distinct, visual way that stands out from the text and is more easily readable for certain types of information. They are perfect for listing, grouping, and otherwise organizing data sets or for providing information in a clear, efficient way. CKEditor 5 offers all necessary functionality to produce advanced, visually appealing and highly efficient tables.

You may look for more interesting details in the [Tables in CKEditor 5](https://ckeditor.com/blog/feature-of-the-month-tables-in-ckeditor-5/) blog post after reading this guide.

<info-box info>
	The basic table feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

## Demo
Use the insert table button {@icon @ckeditor/ckeditor5-table/theme/icons/table.svg Insert table} to insert a new table into the content. Click a table of table cell to invoke the contextual toolbar and add or remove columns {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} and rows {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row}. You can also merge or split cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg Table cell}.

Control the caption {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} and style table {@icon @ckeditor/ckeditor5-table/theme/icons/table-properties.svg Table properties} and table cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg Cell properties} properties, as well as click and drag vertical column border to change its width.

{@snippet features/tables}

## Table features 

The [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package contains multiple plugins that implement various table-related features. The {@link module:table/table~Table `Table`} plugin is at the core of the ecosystem. Available in all {@link installation/getting-started/predefined-builds predefined builds}, it provides the table functionality. There are many other features that extend the editor capabilities:

* {@link features/tables-basic Basic table features} allow users to insert tables into content, add or remove columns and rows and merge or split cells.
* [Table selection](#table-selection)
* [Typing around tables](#typing-around-tables)
* [Contextual toolbar](#table-contextual-toolbar)
* {@link features/tables-styling Table and cell styling tools} let you control the table's border color and style, background color, padding, or text alignment.
* {@link features/tables-resize Table column resize} allows for easy column resize by dragging the border.
* {@link features/tables-caption Table caption feature} allows for adding dedicated table headers with a description.
* {@link features/tables-nesting Nesting tables} enables the user to put table into other tables, creating advanced layouts.


The availability of these plugins varies in different {@link installation/getting-started/predefined-builds predefined editor builds} but the most important ones are present in all builds as presented in the table below:

<figure class="table">
	<table style="text-align: center">
		<thead>
			<tr>
				<th rowspan="2"  style="vertical-align: middle">Image feature (plugin)</th>
				<th colspan="6">Predefined editor build</th>
			</tr>
			<tr>
				<th>{@link installation/getting-started/predefined-builds#classic-editor Classic}</th>
				<th>{@link installation/getting-started/predefined-builds#inline-editor Inline}</th>
				<th>{@link installation/getting-started/predefined-builds#balloon-editor Balloon}</th>
				<th>{@link installation/getting-started/predefined-builds#balloon-block-editor Balloon block}</th>
				<th>{@link installation/getting-started/predefined-builds#document-editor Document}</th>
				<th>{@link installation/getting-started/predefined-builds#superbuild Superbuild}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th>{@link module:table/table~Table}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th>{@link module:table/tabletoolbar~TableToolbar}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th>{@link module:table/tableproperties~TableProperties}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
			</tr>
			<tr>
				<th>{@link module:table/tablecellproperties~TableCellProperties}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
			</tr>
			<tr>
				<th>{@link module:table/tablecolumnresize~TableColumnResize}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
			</tr>
			<tr>
				<th>{@link module:table/tablecaption~TableCaption}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
			</tr>
			<tr>
				<th>{@link module:table/tableselection~TableSelection}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th>{@link module:table/tableclipboard~TableClipboard}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th>{@link module:table/tableutils~TableUtils}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
		</tbody>
	</table>
</figure>

<info-box>
	You can add more table features to your editor using the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) or by customizing your editor build.
</info-box>

## Table selection

The {@link module:table/tableselection~TableSelection} plugin introduces support for the custom selection system for tables that lets you:

* Select an arbitrary rectangular table fragment &mdash; a few cells from different rows, a column (or a few of them) or a row (or multiple rows).
* Apply formatting or add a link to all selected cells at once.

The table selection plugin is loaded automatically by the `Table` plugin and can be tested in the [demo above](#demo).

## Typing around tables

To type before or after a table easily, select the table, then press the Arrow key (<kbd>←</kbd> or <kbd>→</kbd>) once, depending on where you want to add content &ndash; before or after. The table is no longer selected and whatever text you type will appear in the desired position.

## Table contextual toolbar

The {@link module:table/tabletoolbar~TableToolbar} plugin available in all editor builds introduces a contextual toolbar for table. The toolbar appears when a table or a cell is selected and contains various table-related buttons. These would typically include add or remove columns {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} and rows {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row} and merge or split cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg Table cell}. If these features are configured, the toolbar will also contain buttons for captions {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} and table {@icon @ckeditor/ckeditor5-table/theme/icons/table-properties.svg Table properties} and cell {@icon @ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg Cell properties} properties.

{@img assets/img/table-toolbar.png 569 An extended contextual toolbar.}

The table selection plugin is loaded automatically by the `Table` plugin and can be tested in the [demo above](#demo).

## Block vs inline content in table cells

The table feature allows for creating block content (like paragraphs, lists, headings, etc.) inside table cells. However, if a table cell contains just one paragraph and this paragraph has no special attributes (like text alignment), the cell content is considered "inline" and the paragraph is not rendered.

This means that a table cell can have two states: with inline content or with block content. The reason for this differentiation is that most tables contain only inline content (e.g. in the [demo](#demo) above) and it is common for "data tables" to not contain any block content. In such a scenario, printing out `<p>` elements would be semantically incorrect and also unnecessary. There are, however, scenarios where the user wants to create, for example, a list inside a table cell and then the support for block content is necessary.

<info-box>
	"Rendering" here refers to the view layer. In the model, a cell is always filled with at least a `<paragraph>`. This is because of consistency, as &mdash; since a cell always has some block content &mdash; the text is never directly inside the `<tableCell>`. This also allows features like <kbd>Enter</kbd> support to work out of the box (since a `<paragraph>` exists in the model, it can be split despite the fact that it is not present in the view).
</info-box>

### Inline content

The following is the model representation of table cells with inline content only (a single `<paragraph>` inside):

```html
<table>
	<tableRow>
		<tableCell>
			<paragraph>Foo</paragraph>
		</tableCell>
		<tableCell>
			<paragraph>Bar</paragraph>
		</tableCell>
	</tableRow>
</table>
```

The above model structure will be rendered to the {@link module:editor-classic/classiceditor~ClassicEditor#getData data} as:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td>Foo</td>
				<td>Bar</td>
			</tr>
		</tbody>
	</table>
</figure>
```

In the editing view (the editable container in which the user edits the content), additional `<span>` elements are created to compensate for the hidden `<paragraph>` elements:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td><span>Foo</span></td>
				<td><span>Bar</span></td>
			</tr>
		</tbody>
	</table>
</figure>
```

### Block content

If a table cell contains any other block content than a single `<paragraph>` with no attributes, these block elements will be rendered.

The following is a sample table with some block content (model representation):

```html
<table>
	<tableRow>
		<tableCell>
			<paragraph>Foo</paragraph>
			<paragraph>Bar</paragraph>
		</tableCell>
		<tableCell>
			<heading1>Some title</heading1>
		</tableCell>
		<tableCell>
			<paragraph textAlign="right">Baz</paragraph>
		</tableCell>
	</tableRow>
</table>
```

The above model structure will be rendered to the data and to the editing view as:

```html
<figure class="table">
	<table>
		<tbody>
			<tr>
				<td>
					<p>Foo</p>
					<p>Bar</p>
				</td>
				<td>
					<h2>Some title</h2>
				</td>
				<td>
					<p style="text-align: right;">Baz</p>
				</td>
			</tr>
		</tbody>
	</table>
</figure>
```

<info-box info>
	At the moment, it is not possible to completely disallow block content in tables. See the [discussion on GitHub](https://github.com/ckeditor/ckeditor5-table/issues/101) about adding a configuration option that would enable that. Feel free to upvote 👍&nbsp; if this feature is important to you.
</info-box>

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
