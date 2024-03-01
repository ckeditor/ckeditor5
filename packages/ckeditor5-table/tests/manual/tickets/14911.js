/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Autosave } from '@ckeditor/ckeditor5-autosave';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import {
	TableProperties,
	TableColumnResize,
	TableCaption,
	TableCellProperties
} from '@ckeditor/ckeditor5-table';

const table1 = `<table>
    <thead>
    <tr>
        <th scope="col">Col Header 1</th>
        <th scope="col">Col Header 2</th>
        <th scope="col">Col Header 3</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th scope="rowgroup" colspan="3">Rowgroup Header 1</th>
    </tr>
    <tr>
        <th scope="row">Row Header 1</th>
        <td>Data 1,1</td>
        <td>Data 2,1</td>
    </tr>
    </tbody>
</table>
`;

const table2 = `<table>
    <thead>
    <tr>
        <th scope="col">Col Header 1</th>
        <th scope="col">Col Header 2</th>
        <th scope="col">Col Header 3</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th scope="rowgroup" colspan="3">Rowgroup Header 1</th>
    </tr>
    <tr>
        <th scope="row">Row Header 1</th>
        <td>Data 1,1</td>
        <td>Data 2,1</td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <th scope="rowgroup" colspan="3">Rowgroup Header 2</th>
    </tr>
    <tr>
        <th scope="row">Row Header 2</th>
        <td>Data 1,2</td>
        <td>Data 2,2</td>
    </tr>
    <tr>
        <th scope="row">Row Header 3</th>
        <td>Data 1,3</td>
        <td>Data 2,3</td>
    </tr>
    </tbody>
</table>
`;

const table3 = `<table>
    <thead>
    <tr>
        <th scope="col">Col Header 1</th>
        <th scope="col">Col Header 2</th>
        <th scope="col">Col Header 3</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <th scope="rowgroup">Rowgroup Header 1</th>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <th scope="row">Row Header 1</th>
        <th scope="row">Row Subheader 1</th>
        <td>Data 1,1</td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <th scope="row">Row Header 2</th>
        <th scope="row">Row Subheader 2</th>
        <td>Data 1,2</td>
    </tr>
    <tr>
        <th scope="row">Row Header 3</th>
        <th scope="row">Row Subheader 3</th>
        <td>Data 1,3</td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <th scope="rowgroup">Rowgroup Header 2</th>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <th scope="row">Row Header 4</th>
        <th scope="row">Row Subheader 4</th>
        <td>Data 1,4</td>
    </tr>
    </tbody>
</table>
`;

const table4 = `
<table class="apple-table-examples e2">

    <colgroup> <col/></colgroup>
    <colgroup> <col/> <col/> <col/></colgroup>

<thead><tr><th> </th><th>2008 </th><th>2007 </th><th>2006
   </th></tr></thead><tbody><tr><th scope="rowgroup"> Research and development
         </th><td> $ 1,109 </td><td> $ 782 </td><td> $ 712
    </td></tr><tr><th scope="row"> Percentage of net sales
         </th><td> 3.4% </td><td> 3.3% </td><td> 3.7%
   </td></tr></tbody><tbody><tr><th scope="rowgroup"> Selling, general, and administrative
         </th><td> $ 3,761 </td><td> $ 2,963 </td><td> $ 2,433
    </td></tr><tr><th scope="row"> Percentage of net sales
         </th><td> 11.6% </td><td> 12.3% </td><td> 12.6%
  </td></tr></tbody></table>
`;

const table5 = `
<table border="1" cellpadding="2" cellspacing="3">
<caption>Example 1: TRAVEL EXPENSES (actual cost, US$)</caption>
<thead>
  <tr>
    <th><p><span id="t1-r1-l1">TRIP</span>,<br><span id="t1-r1-l2">&nbsp;date</span></p></th>
    <th scope="col">Meals</th>
    <th scope="col">Room</th>
    <th scope="col"><abbr title="Transportation">Trans.</abbr></th>
    <th scope="col">Total</th>
  </tr>
</thead>
<tbody>
  <tr>
    <th scope="rowgroup" headers="t1-r1-l1">San Jose</th>
  </tr>
  <tr>
    <td scope="row" headers="t1-r1-l2">&nbsp;25 Aug 97</td>
    <td>37.74</td>
    <td>112.00</td>
    <td>45.00</td>
  </tr>
  <tr>
    <td scope="row" headers="t1-r1-l2">&nbsp;26 Aug 97</td>
    <td>27.28</td>
    <td>112.00</td>
    <td>45.00</td>
  </tr>
  <tr>
    <td scope="row">Subtotal</td>
    <td>65.02</td>
    <td>224.00</td>
    <td>90.00</td>
    <td>379.02</td>
  </tr>
</tbody>
<tbody>
  <tr>
    <th scope="rowgroup" headers="t1-r1-l1">Seattle</th>
  </tr>
  <tr>
    <td scope="row" headers="t1-r1-l2">&nbsp;27 Aug 97</td>
    <td>96.25</td>
    <td>109.00</td>
    <td>36.00</td>
  </tr>
  <tr>
    <td scope="row" headers="t1-r1-l2">&nbsp;28 Aug 97</td>
    <td>35.00</td>
    <td>109.00</td>
    <td>36.00</td>
  </tr>
  <tr>
    <td scope="row">Subtotal</td>
    <td>131.25</td>
    <td>218.00</td>
    <td>72.00</td>
    <td>421.25</td>
  </tr>
</tbody>
<tbody>
  <tr>
    <th scope="row">Totals</th>
    <td>196.27</td>
    <td>442.00</td>
    <td>162.00</td>
    <td>800.27</td>
  </tr>
</tbody>
</table>
`;

const examples = [ table1, table2, table3, table4, table5 ];

examples.forEach( async ( example, index ) => {
	const tableNumber = index + 1;
	const exampleHtml = generateExample( tableNumber, example );

	// Use insertAdjacentHTML to avoid disrupting the DOM
	document.body.insertAdjacentHTML( 'beforeend', exampleHtml );

	await createTableInPre( tableNumber, example, 'example' );
	createEditor( tableNumber, example, 'standard' );
	createEditor( tableNumber, example, 'ghs' );
} );

function generateExample( number, table ) {
	return `
<h2>Example ${ number }</h2>
<div class="container">
	<div class="row">
		<div class="column-title">Standard HTML Table ${ number }</div>
		<div class="column-title">Editor ${ number }</div>
		<div class="column-title">Editor ${ number } with GHS</div>
	</div>
	<div class="row">
		<div class="column raw-table" id="table-${ number }">
			${ table }
		</div>
		<div class="column">
			<div id="editor-standard-${ number }"></div>
		</div>
		<div class="column">
			<div id="editor-ghs-${ number }"></div>
		</div>
	</div>
	<div class="row">
		<div class="column code-block" id="html-example-${ number }"></div>
		<div class="column code-block" id="html-from-editor-standard-${ number }"></div>
		<div class="column code-block" id="html-from-editor-ghs-${ number }"></div>
	</div>
</div>
`;
}

async function createTableInPre( number, table, target ) {
	let divForExample = '';
	switch ( target ) {
		case 'ghs':
			divForExample = `html-from-editor-ghs-${ number }`;
			break;
		case 'standard':
			divForExample = `html-from-editor-standard-${ number }`;
			break;
		case 'example':
			divForExample = `html-example-${ number }`;
			break;
		default:
			throw Error( 'Target for pre not known.' );
	}

	const formatted = await window.prettier.format( table, {
		parser: 'html',
		plugins: window.prettierPlugins
	} );

	const preElement = document.createElement( 'pre' );
	preElement.textContent = formatted;
	document.getElementById( divForExample ).replaceChildren( preElement );
}

function createEditor( number, table, type ) {
	let plugins = [
		ArticlePluginSet,
		SourceEditing,
		TableColumnResize,
		TableProperties,
		TableCellProperties,
		TableCaption,
		Autosave
	];

	let config = {
		initialData: table,
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		toolbar: [ 'insertTable', 'sourceEditing' ],
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableProperties',
				'tableCellProperties'
			]
		},
		autosave: {
			save( editor ) {
				createTableInPre( number, editor.getData(), type );
			}
		}
	};

	let element = '';
	switch ( type ) {
		case 'ghs':
			element = `editor-ghs-${ number }`;
			plugins = [ ...plugins, GeneralHtmlSupport ];
			config = {
				...config,
				plugins,
				htmlSupport: {
					allow: [
						{
							name: /.*/,
							attributes: true,
							classes: true,
							styles: true
						}
					]
				}
			};
			break;
		case 'standard':
			element = `editor-standard-${ number }`;
			config = { ...config, plugins };
			break;
		default:
			throw Error( 'Editor not known.' );
	}
	console.log( config );

	ClassicEditor.create( document.getElementById( element ), config )
		.then( editor => {
			window.CKEditorInspector.attach( editor );

			createTableInPre( number, editor.getData(), type );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
