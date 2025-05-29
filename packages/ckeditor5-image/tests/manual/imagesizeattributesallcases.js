/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import ImageResize from '../../src/imageresize.js';
import ImageSizeAttributes from '../../src/imagesizeattributes.js';
import PictureEditing from '../../src/pictureediting.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

const commonConfig = getConfig();
const configPx = getConfig( true );

const editors = [
	{
		id: 'inline1',
		title: '[Inline] plain (no attributes, no styles)',
		config: commonConfig,
		data: '<p><img src="game_boy.jpg" alt=""></p>'
	},
	{
		id: 'inline2',
		title: '[Inline] natural size | width + height attributes: Resize in %',
		config: commonConfig,
		data: '<p><img src="game_boy.jpg" alt="" width="384" height="500"></p>'
	},
	{
		id: 'inline3',
		title: '[Inline] natural size | width + height attributes: Resized (width % style)',
		config: commonConfig,
		data: '<p><img style="width:22.69%;" src="game_boy.jpg" alt="" width="384" height="500"></p>'
	},
	{
		id: 'inline4',
		title: '[Inline] natural size | width + height attributes: Resized (width % style)',
		config: commonConfig,
		data: '<p><img class="image_resized" style="width:22.69%;" src="game_boy.jpg" alt="" width="384" height="500"></p>'
	},
	{
		id: 'inline5',
		title: '[Inline] natural size | width + height attributes: Resize in px',
		config: configPx,
		data: '<p><img src="game_boy.jpg" alt="" width="384" height="500"></p>'
	},
	{
		id: 'inline6',
		title: '[Inline] natural size | width + height attributes: Resized (width px style only)',
		config: configPx,
		data: '<p><img class="image_resized" style="width:307px;" src="game_boy.jpg" alt="" width="384" height="500"></p>'
	},
	{
		id: 'inline7',
		title: '[Inline] natural size | width + height attributes: Resized (width and height px style)',
		config: configPx,
		data: '<p><img style="height:400px;width:307px;" src="game_boy.jpg" alt="" width="384" height="500"></p>'
	},
	{
		id: 'inline8',
		title: '[Inline] natural size | styles only (w/o width & height attributes): Resize in %',
		config: commonConfig,
		data: '<p><img style="width:384px;height:500px;" src="game_boy.jpg" alt=""></p>'
	},
	{
		id: 'inline9',
		title: '[Inline] natural size | only resize in % (only width style)',
		config: commonConfig,
		data: '<p><img class="image_resized" style="width:12.34%;" src="game_boy.jpg" alt=""></p>'
	},
	{
		id: 'inline10',
		title: '[Inline] natural size | styles only (w/o width & height attributes): Resize in px',
		config: configPx,
		data: '<p><img style="width:384px;height:500px;" src="game_boy.jpg" alt=""></p>'
	},
	{
		id: 'inline11',
		title: '[Inline] broken aspect ratio | width + height attributes',
		config: commonConfig,
		data: '<p><img src="game_boy.jpg" alt="" width="500" height="500"></p>'
	},
	{
		id: 'inline12',
		title: '[Inline] broken aspect ratio | styles only (w/o width & height attributes)',
		config: commonConfig,
		data: '<p><img style="width:500px;height:500px;" src="game_boy.jpg" alt=""></p>'
	},
	{
		id: 'block1',
		title: '[Block] plain (no attributes, no styles)',
		config: commonConfig,
		data: '<figure class="image"><img src="game_boy.jpg" alt=""></figure>'
	},
	{
		id: 'block2',
		title: '[Block] natural size | width + height attributes: Resize in %',
		config: commonConfig,
		data: '<figure class="image"><img src="game_boy.jpg" width="384" height="500" alt=""></figure>'
	},
	{
		id: 'block3',
		title: '[Block] natural size | width + height attributes: Resized (width % style)',
		config: commonConfig,
		data: '<figure class="image" style="width:10.09%;"><img src="game_boy.jpg" alt="" width="384" height="500"></figure>'
	},
	{
		id: 'block4',
		title: '[Block] natural size | width + height attributes: Resized (width % style)',
		config: commonConfig,
		data: '<figure class="image image_resized" style="width:10.09%;"><img src="game_boy.jpg" alt="" width="384" height="500"></figure>'
	},
	{
		id: 'block5',
		title: '[Block] natural size | width + height attributes: Resize in px',
		config: configPx,
		data: '<figure class="image"><img src="game_boy.jpg" width="384" height="500" alt=""></figure>'
	},
	{
		id: 'block6',
		title: '[Block] natural size | width + height attributes: Resized (width px style only)',
		config: configPx,
		data: '<figure class="image image_resized" style="width:115px;"><img src="game_boy.jpg" alt="" width="384" height="500"></figure>'
	},
	{
		id: 'block7',
		title: '[Block] natural size | width + height attributes: Resized (width and height px style)',
		config: configPx,
		data: '<figure class="image image_resized" style="height:150px;width:115px;">' +
			'<img src="game_boy.jpg" alt="" width="384" height="500"></figure>'
	},
	{
		id: 'block8',
		title: '[Block] natural size | styles only (w/o width & height attributes): Resize in %',
		config: commonConfig,
		data: '<figure class="image" style="width:384px;height:500px;"><img src="game_boy.jpg" alt=""></figure>'
	},
	{
		id: 'block9',
		title: '[Block] natural size | only resize in % (only width style)',
		config: commonConfig,
		data: '<figure class="image image_resized" style="width:19.21%;"><img src="game_boy.jpg" alt=""></figure>'
	},
	{
		id: 'block10',
		title: '[Block] natural size | styles only (w/o width & height attributes): Resize in px',
		config: configPx,
		data: '<figure class="image" style="width:384px;height:500px;"><img src="game_boy.jpg" alt=""></figure>'
	},
	{
		id: 'block11',
		title: '[Block] broken aspect ratio | width + height attributes',
		config: commonConfig,
		data: '<figure class="image"><img src="game_boy.jpg" width="500" height="500" alt=""></figure>'
	},
	{
		id: 'block12',
		title: '[Block] broken aspect ratio | styles only (w/o width & height attributes)',
		config: commonConfig,
		data: '<figure class="image" style="width:500px;height:500px;"><img src="game_boy.jpg" alt=""></figure>'
	},
	{
		id: 'inline101',
		title: '[Inline] natural size | width + height attributes: Resized (height % style)',
		config: commonConfig,
		data: '<p><img style="height:20%;" src="parrot_2.jpg" alt="" width="300" height="451"></p>'
	},
	{
		id: 'inline102',
		title: '[Inline] natural size | width + height attributes: Resized (height px style)',
		config: configPx,
		data: '<p><img style="height:200px;" src="parrot_2.jpg" alt="" width="300" height="451"></p>'
	},
	{
		id: 'inline103',
		title: '[Inline] natural size | only resize in % (only height style)',
		config: commonConfig,
		data: '<p><img style="height:20%;" src="parrot_2.jpg" alt=""></p>'
	},
	{
		id: 'inline104',
		title: '[Inline] natural size | only resize in px (only height style)',
		config: configPx,
		data: '<p><img style="height:200px;" src="parrot_2.jpg" alt=""></p>'
	},
	{
		id: 'inline105',
		title: '[Inline] width + height attributes: Resized (height & width % style)',
		config: commonConfig,
		data: '<p><img style="width:20%;height:20%;" src="parrot_2.jpg" alt="" width="300" height="451"></p>'
	},
	{
		id: 'inline106',
		title: '[Inline] only resize in % (height & width % style)',
		config: commonConfig,
		data: '<p><img style="width:20%;height:20%;" src="parrot_2.jpg" alt=""></p>'
	},
	{
		id: 'block101',
		title: '[Block] natural size | width + height attributes: Resized (height % style)',
		config: commonConfig,
		data: '<figure class="image" style="height:20%;"><img src="parrot_2.jpg" alt="" width="300" height="451"></figure>'
	},
	{
		id: 'block102',
		title: '[Block] natural size | width + height attributes: Resized (height px style)',
		config: configPx,
		data: '<figure class="image" style="height:200px;"><img src="parrot_2.jpg" alt="" width="300" height="451"></figure>'
	},
	{
		id: 'block103',
		title: '[Block] natural size | only resize in % (only height style)',
		config: commonConfig,
		data: '<figure class="image" style="height:20%;"><img src="parrot_2.jpg" alt=""></figure>'
	},
	{
		id: 'block104',
		title: '[Block] natural size | only resize in px (only height style)',
		config: configPx,
		data: '<figure class="image" style="height:200px;"><img src="parrot_2.jpg" alt=""></figure>'
	},
	{
		id: 'block105',
		title: '[Block] width + height attributes: Resized (height & width % style)',
		config: commonConfig,
		data: '<figure class="image" style="width:20%;height:20%;"><img src="parrot_2.jpg" alt="" width="300" height="451"></figure>'
	},
	{
		id: 'block106',
		title: '[Block] only resize in % (height & width % style)',
		config: commonConfig,
		data: '<figure class="image" style="width:20%;height:20%;"><img src="parrot_2.jpg" alt=""></figure>'
	},
	{
		id: 'inline201',
		title: '[Picture: Inline] plain (no styles)',
		config: commonConfig,
		data: '<p><picture>' +
					'<source srcset="logo-square.png" media="(max-width: 800px)" type="image/png">' +
					'<source srcset="logo-wide.png" media="(min-width: 800px)" type="image/png">' +
					'<img src="logo-wide.png" alt="">' +
				'</picture></p>'
	},
	{
		id: 'inline202',
		title: '[Picture: Inline] resized (width style %)',
		config: commonConfig,
		data: '<p><picture>' +
					'<source srcset="logo-square.png" media="(max-width: 800px)" type="image/png">' +
					'<source srcset="logo-wide.png" media="(min-width: 800px)" type="image/png">' +
					'<img class="image_resized" style="width:50%;" src="logo-wide.png" alt="">' +
				'</picture></p>'
	},
	{
		id: 'block201',
		title: '[Picture: Block] plain (no styles)',
		config: commonConfig,
		data: '<figure class="image"><picture>' +
					'<source srcset="logo-square.png" media="(max-width: 800px)" type="image/png">' +
					'<source srcset="logo-wide.png" media="(min-width: 800px)" type="image/png">' +
					'<img src="logo-wide.png" alt="">' +
				'</picture></figure>'
	},
	{
		id: 'block202',
		title: '[Picture: Block] resized (width style %)',
		config: commonConfig,
		data: '<figure class="image image_resized" style="width:50%;"><picture>' +
					'<source srcset="logo-square.png" media="(max-width: 800px)" type="image/png">' +
					'<source srcset="logo-wide.png" media="(min-width: 800px)" type="image/png">' +
					'<img src="logo-wide.png" alt="">' +
				'</picture></figure>'
	}
];

function getConfig( resizeUnitInPx = false ) {
	const config = {
		plugins: [
			ArticlePluginSet,
			ImageResize,
			Code,
			ImageSizeAttributes,
			Indent,
			IndentBlock,
			PictureEditing,
			PasteFromOffice
		],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo', 'outdent', 'indent' ],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|', 'toggleImageCaption', 'resizeImage' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		}
	};

	if ( resizeUnitInPx ) {
		config.image.resizeUnit = 'px';
	}

	return config;
}

async function initEditors() {
	await Promise.all( editors.map( async editorObj => {
		insertEditorStructure( editorObj );

		const domElement = document.querySelector( `#${ editorObj.id }` );

		const editor = await ClassicEditor.create( domElement, { ...editorObj.config, initialData: editorObj.data } );

		window[ editorObj.id ] = editor;

		editor.model.document.on( 'change:data', () => {
			updateLogsAndData( domElement, editor );
		} );

		logInitialData( domElement, editorObj );
		updateLogsAndData( domElement, editor );
	} ) );

	CKEditorInspector.attach( Object.fromEntries( editors.map( editorObj => [ editorObj.id, window[ editorObj.id ] ] ) ) );
}

initEditors().catch( err => {
	console.error( err.stack );
} );

function insertEditorStructure( editorObj ) {
	const colorClass = editorObj.id.startsWith( 'inline' ) ? 'inlineColor' : 'blockColor';

	document.body.insertAdjacentHTML( 'beforeend',
		`<h2>${ editorObj.title }</h2>` +
		`<span>Editor id: <strong>${ editorObj.id }<strong></span>` +
		'<div class="editor-wrapper">' +
			`<div id="${ editorObj.id }" class="${ editorObj.id }"></div>` +
			'<div class="editor-data ck-content"></div>' +
			`<div class="editor-data-text ${ colorClass }"><h3>Initial data:</h3></div>` +
			`<div class="editor-model ${ colorClass }"><h3>Model:</h3></div>` +
		'</div>'
	);
}

function logInitialData( domElement, editorObj ) {
	const editorDataText = domElement.parentElement.querySelector( '.editor-data-text' );

	editorDataText.insertAdjacentText( 'beforeend', editorObj.data );
	editorDataText.insertAdjacentHTML( 'beforeend', '<h3>Output data:</h3>' );
}

function updateLogsAndData( domElement, editor ) {
	const editorModel = domElement.parentElement.querySelector( '.editor-model' );
	const editorDataHtml = domElement.parentElement.querySelector( '.editor-data' );
	const editorDataText = domElement.parentElement.querySelector( '.editor-data-text' );

	// model
	editorModel.insertAdjacentText( 'beforeend', getData( editor.model, { withoutSelection: true } ) );
	editorModel.insertAdjacentHTML( 'beforeend', '<p>---</p>' );

	// data (html)
	editorDataHtml.innerHTML = editor.getData();

	// data (output data)
	editorDataText.insertAdjacentText( 'beforeend', editor.getData() );
	editorDataText.insertAdjacentHTML( 'beforeend', '<p>---</p>' );
}
