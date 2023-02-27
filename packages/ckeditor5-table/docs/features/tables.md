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

## Demo
Use the insert table button {@icon @ckeditor/ckeditor5-table/theme/icons/table.svg Insert table} to insert a new table into the content. Click a table of table cell to invoke the contextual toolbar and add or remove columns {@icon @ckeditor/ckeditor5-table/theme/icons/table-column.svg Table column} and rows {@icon @ckeditor/ckeditor5-table/theme/icons/table-row.svg Table row}. You can also merge or split cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg Table cell}.

Control the caption {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Table caption} and style table {@icon @ckeditor/ckeditor5-table/theme/icons/table-properties.svg Table properties} and table cells {@icon @ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg Cell properties} properties, as well as click and drag vertical column border to change its width.

{@snippet features/tables}

## Table features 

The [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package contains multiple plugins that implement various table-related features. The {@link module:table/table~Table `Table`} plugin is at the core of the ecosystem. Available in all {@link installation/getting-started/predefined-builds predefined builds}, it provides the table functionality. There are many other features that extend the editor capabilities:

* {@link features/tables-basic Basic table features} allow users to insert tables into content, add or remove columns and rows and merge or split cells.
* {@link features/tables-basic#table-selection Table selection}
* {@link features/tables-basic#typing-around-tables Typing around tables}
* {@link features/tables-basic#table-contextual-toolbar Contextual toolbar}
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

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
