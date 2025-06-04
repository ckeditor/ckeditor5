/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-disable @stylistic/max-len */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import Table from '../../src/table.js';
import TableToolbar from '../../src/tabletoolbar.js';
import TableSelection from '../../src/tableselection.js';
import TableClipboard from '../../src/tableclipboard.js';
import TableProperties from '../../src/tableproperties.js';
import TableCellProperties from '../../src/tablecellproperties.js';
import TableColumnResize from '../../src/tablecolumnresize.js';
import TableCaption from '../../src/tablecaption.js';
import PlainTableOutput from '../../src/plaintableoutput.js';
import TableLayout from '../../src/tablelayout.js';

const initialHTML = `<h2>Source structure: &lt;table&gt;</h2>
	<hr>

	<h3>Source: &lt;table class="table"&gt;</h3>

	<table class="table">
		<tr>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
	</table>
	<h3>Source: &lt;table class="table layout-table"&gt;</h3>

	<table class="table layout-table">
		<tr>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
	</table>


	<hr>
	<h3>Source: &lt;table class="table layout-table ck-table-resized" style="width:30%;"&gt;</h3>

	<table class="table layout-table" style="width:30%;" role="presentation">
		<colgroup>
			<col style="width:28.59%;">
			<col style="width:19.93%;">
			<col style="width:51.48%;">
		</colgroup>
		<tbody>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
			</tr>
			<tr>
				<td>1</td>
				<td>2</td>
				<td>3</td>
			</tr>
		</tbody>
	</table>

	<hr>
	<h3>Source: &lt;table class="table layout-table"&gt; containing &lt;caption&gt;</h3>

	<table class="table layout-table">
		<caption>Caption</caption>
		<tr>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
	</table>

	<hr>
	<h3>Source: &lt;table class="table content-table"&gt; containing &lt;caption&gt;</h3>

	<table class="table content-table">
		<caption>Caption</caption>
		<tr>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
	</table>

	<hr>
	<h3>Source: &lt;table class="table"&gt; containing &lt;caption&gt;</h3>

	<table class="table">
		<caption>Caption</caption>
		<tr>
			<td>a</td>
			<td>b</td>
			<td>c</td>
		</tr>
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
	</table>

	<hr>
	<h3>Source: &lt;table&gt; containing &lt;thead&gt;/&lt;th&gt;</h3>

	<table>
		<thead>
			<tr>
				<th>0</th>
				<th>1</th>
				<th>2</th>
				<th>3</th>
				<th>4</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
				<td>d</td>
				<td>e</td>
			</tr>
			<tr>
				<td>f</td>
				<td>g</td>
				<td>h</td>
				<td>i</td>
				<td>j</td>
			</tr>
			<tr>
				<td>k</td>
				<td>l</td>
				<td>m</td>
				<td>n</td>
				<td>o</td>
			</tr>
			<tr>
				<td>p</td>
				<td>q</td>
				<td>r</td>
				<td>s</td>
				<td>t</td>
			</tr>
		</tbody>
	</table>

	<hr>
	<h3>Source: &lt;table class="table layout-table"&gt; containing &lt;thead&gt;/&lt;th&gt;</h3>

	<table class="table layout-table">
		<thead>
			<tr>
				<th>0</th>
				<th>1</th>
				<th>2</th>
				<th>3</th>
				<th>4</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
				<td>d</td>
				<td>e</td>
			</tr>
			<tr>
				<td>f</td>
				<td>g</td>
				<td>h</td>
				<td>i</td>
				<td>j</td>
			</tr>
			<tr>
				<td>k</td>
				<td>l</td>
				<td>m</td>
				<td>n</td>
				<td>o</td>
			</tr>
			<tr>
				<td>p</td>
				<td>q</td>
				<td>r</td>
				<td>s</td>
				<td>t</td>
			</tr>
		</tbody>
	</table>

	<hr>
	<h3>Source: &lt;table class="table content-table"&gt; containing &lt;thead&gt;/&lt;th&gt;</h3>

	<table class="table content-table">
		<thead>
			<tr>
				<th>0</th>
				<th>1</th>
				<th>2</th>
				<th>3</th>
				<th>4</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
				<td>d</td>
				<td>e</td>
			</tr>
			<tr>
				<td>f</td>
				<td>g</td>
				<td>h</td>
				<td>i</td>
				<td>j</td>
			</tr>
			<tr>
				<td>k</td>
				<td>l</td>
				<td>m</td>
				<td>n</td>
				<td>o</td>
			</tr>
			<tr>
				<td>p</td>
				<td>q</td>
				<td>r</td>
				<td>s</td>
				<td>t</td>
			</tr>
		</tbody>
	</table>

	<hr>
	<h2>Source structure: &lt;figure&gt;&lt;table&gt;</h2>
	<hr>
	<h3>Source: &lt;figure&gt;&lt;table&gt;</h3>

	<figure>
		<table>
			<caption>Caption</caption>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
			</tr>
			<tr>
				<td>1</td>
				<td>2</td>
				<td>3</td>
			</tr>
		</table>
	</figure>

	<hr>
	<h3>Source: &lt;figure class="table"&gt;&lt;table&gt;</h3>

	<figure class="table">
		<table>
			<caption>Caption</caption>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
			</tr>
			<tr>
				<td>1</td>
				<td>2</td>
				<td>3</td>
			</tr>
		</table>
	</figure>

	<hr>
	<h3>Source: &lt;figure&gt;&lt;table class="table layout-table"&gt;</h3>

	<figure>
		<table class="table layout-table">
			<caption>Caption</caption>
			<tr>
				<td>a</td>
				<td>b</td>
				<td>c</td>
			</tr>
			<tr>
				<td>1</td>
				<td>2</td>
				<td>3</td>
			</tr>
		</table>
	</figure>

	<hr>
	<h3>Source: &lt;figure&gt;&lt;table&gt; containing &lt;thead&gt;/&lt;th&gt;</h3>
	<figure>
		<table>
			<thead>
				<tr>
					<th>0</th>
					<th>1</th>
					<th>2</th>
					<th>3</th>
					<th>4</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>a</td>
					<td>b</td>
					<td>c</td>
					<td>d</td>
					<td>e</td>
				</tr>
				<tr>
					<td>f</td>
					<td>g</td>
					<td>h</td>
					<td>i</td>
					<td>j</td>
				</tr>
				<tr>
					<td>k</td>
					<td>l</td>
					<td>m</td>
					<td>n</td>
					<td>o</td>
				</tr>
				<tr>
					<td>p</td>
					<td>q</td>
					<td>r</td>
					<td>s</td>
					<td>t</td>
				</tr>
			</tbody>
		</table>
	</figure>

	<h3>Look of widget type around and selection handle is changed in layout tables, also only hovered table shows mention
		earlier widget handlers.</h3>
	<p></p>
	<table class="table content-table" role="presentation">
		<tbody>
			<tr>
				<td>
					<p>foo</p>
					<table class="table content-table" role="presentation">
						<tbody>
							<tr>
								<td style="width:33.333333%;">bar</td>
								<td style="width:33.333333%;">
									<table class="table layout-table"
										style="border-color:hsl(120, 75%, 60%);border-style:solid;width:100%;"
										role="presentation">
										<tbody>
											<tr>
												<td>baz</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
											</tr>
											<tr>
												<td>&nbsp;</td>
												<td style="border-color:hsl(0, 75%, 60%);">&nbsp;</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
											</tr>
											<tr>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
											</tr>
											<tr>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
												<td>&nbsp;</td>
											</tr>
										</tbody>
									</table>
								</td>
								<td style="width:33.333333%;">&nbsp;</td>
							</tr>
							<tr>
								<td style="width:33.333333%;">&nbsp;</td>
								<td style="width:33.333333%;">&nbsp;</td>
								<td style="width:33.333333%;">&nbsp;</td>
							</tr>
						</tbody>
					</table>
				</td>
				<td>b</td>
				<td>c</td>
			</tr>
			<tr>
				<td>1</td>
				<td>2</td>
				<td>3</td>
			</tr>
		</tbody>
	</table>
	<p></p>

	<hr>
	<h2>Knows issues:</h2>
	<h3>when table or table cell has for example set: <code>border-bottom-width:0</code> and <code>border-bottom-width:0</code> - outline is not shown but default border cames in on left and right</h3>
	<p></p>
	<table style="padding: 30px;">
		<tr>
			<td style="border-bottom-width:0;border-top-width:0; padding: 30px;">
				<table class="table"
					style="border-collapse: collapse; border-spacing: 0; border-radius: 0; border-color: red;">
					<tr>
						<td>a</td>
						<td>b</td>
						<td>c</td>
					</tr>
					<tr>
						<td>1</td>
						<td>2</td>
						<td>3</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>`;

const config = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		GeneralHtmlSupport,
		HorizontalLine,
		Table,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableProperties,
		TableCellProperties,
		TableColumnResize,
		TableCaption,
		PlainTableOutput,
		TableLayout
	],
	toolbar: [
		'undo', 'redo', '|',
		'insertTable', 'insertTableLayout', '|',
		'heading', '|',
		'bold', 'italic', 'link', '|',
		'bulletedList', 'numberedList', 'blockQuote'
	],
	table: {
		contentToolbar: [
			'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
		]
	},
	htmlSupport: {
		allow: [
			{
				name: /.*/,
				attributes: true,
				classes: true,
				styles: true
			}
		]
	},
	menuBar: {
		isVisible: true
	},
	initialData: initialHTML
};

let editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );

window.editor = editor;

const configTableTypes = {
	default: {},
	content: {
		tableLayout: {
			preferredExternalTableType: 'content'
		}
	},
	layout: {
		tableLayout: {
			preferredExternalTableType: 'layout'
		}
	}
};

const tableTypeSelect = document.querySelector( '#tableType' );

tableTypeSelect.addEventListener( 'change', async () => {
	await editor.destroy();

	const newConfig = { ...config, initialData: initialHTML };

	newConfig.table = {
		...newConfig.table,
		...configTableTypes[ tableTypeSelect.value ]
	};

	editor = await ClassicEditor.create( document.querySelector( '#editor' ), newConfig );
	window.editor = editor;
} );

