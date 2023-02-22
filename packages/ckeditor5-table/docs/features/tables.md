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

TODO

* {@link module:table/table~Table}
* {@link module:table/tabletoolbar~TableToolbar}
* {@link module:table/tableproperties~TableProperties}
* {@link module:table/tablecolumnresize~TableColumnResize}
* {@link module:table/tablecaption~TableCaption}
* {@link module:table/tablecellproperties~TableCellProperties}
* {@link module:table/tableselection~TableSelection}
* {@link module:table/tableclipboard~TableClipboard}
* {@link module:table/tableutils~TableUtils}

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
				<th >{@link module:image/imagetoolbar~ImageToolbar}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/imagecaption~ImageCaption}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/imagestyle~ImageStyle}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/imagetextalternative~ImageTextAlternative}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/imageupload~ImageUpload}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/pictureediting~PictureEditing}</th>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/imageresize~ImageResize}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>✅</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:link/linkimage~LinkImage}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/imageinsert~ImageInsert}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>✅</td>
			</tr>
			<tr>
				<th >{@link module:image/autoimage~AutoImage}</th>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>❌</td>
				<td>✅</td>
			</tr>
		</tbody>
	</table>
</figure>

<info-box>
	You can add more image features to your editor using the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) or {@link features/images-installation manually by customizing your editor build}.
</info-box>

### Basic table features

### Table and cell styling tools

### Table column resize

### Table caption

### Nesting tables

## Table selection

## Typing around tables


## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
