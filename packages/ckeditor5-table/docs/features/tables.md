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

{@snippet features/tables}

## Table features 

The [`@ckeditor/ckeditor5-table`](https://www.npmjs.com/package/@ckeditor/ckeditor5-table) package contains multiple plugins that implement various table-related features. The {@link module:table/table~Table `Table`} plugin is at the core of the ecosystem. Available in all {@link installation/getting-started/predefined-builds predefined builds}, it provides the table functionality. There are many other features that extend the editor capabilities:

* Basic table features
	* Table selection
	* Typing around tables
* Table and cell styling tools
* Table column resize
* Table caption
* Nesting tables


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
