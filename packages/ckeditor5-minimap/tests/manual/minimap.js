/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import Fullscreen from '@ckeditor/ckeditor5-fullscreen/src/fullscreen.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';

import Minimap from '../../src/minimap.js';
import { shortData, mediumData, longData } from '../fixtures.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const config = {
	plugins: [
		Alignment,
		ArticlePluginSet,
		CloudServices,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		Fullscreen, // no minimap integration in FS, but it should not throw errors when used together
		IndentBlock,
		ImageUpload,
		ImageResize,
		TableProperties,
		TableCellProperties,
		Subscript,
		Superscript,
		PageBreak,
		CodeBlock,
		Minimap,
		EasyImage
	],
	toolbar: [
		'pageBreak', '|',
		'heading', '|',
		'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
		'bold', 'italic', 'blockQuote', '|',
		'codeBlock',
		'alignment', '|',
		'indent', 'outdent', '|',
		'subscript', 'superscript', '|',
		'insertTable', 'imageUpload', '|',
		'undo', 'redo', 'fullscreen'
	],
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:wrapText',
			'|',
			'imageTextAlternative',
			'toggleImageCaption'
		],
		styles: [
			'inline',
			'block',
			'side',
			'alignLeft',
			'alignRight',
			{ name: 'margin', title: 'Reset margins', icon: '', className: 'reset-margin' }
		],
		resizeUnit: 'px'
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
		tableToolbar: [ 'bold', 'italic' ]
	},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4' }
		]
	},
	minimap: {
		container: document.querySelector( '.minimap-container' )
	},
	cloudServices: CS_CONFIG
};

const simpleModelButton = document.getElementById( 'mode-simple' );
const standardModeButton = document.getElementById( 'mode-standard' );

simpleModelButton.addEventListener( 'change', handleModeChange );
standardModeButton.addEventListener( 'change', handleModeChange );

async function handleModeChange( evt ) {
	await startMode( evt.target.value );
}

async function startMode( selectedMode ) {
	if ( selectedMode === 'standard' ) {
		await startStandardMinimapMode();
	} else {
		await startSimpleMinimapMode();
	}
}

async function startStandardMinimapMode() {
	await reloadEditor( config );
}

async function startSimpleMinimapMode() {
	await reloadEditor( {
		...config,
		minimap: {
			useSimplePreview: true,
			container: document.querySelector( '.minimap-container' )
		}
	} );
}

async function reloadEditor( config ) {
	if ( window.editorInstance ) {
		await window.editorInstance.destroy();
	}

	const editor = await DecoupledEditor.create( document.querySelector( '#editor-content' ), config );
	const toolbarContainer = document.querySelector( '#toolbar-container' );

	toolbarContainer.innerHTML = '';
	toolbarContainer.appendChild( editor.ui.view.toolbar.element );

	editor.setData( longData );
	// editor.setData( mediumData );

	window.editorInstance = editor;
}

document.getElementById( 'long' ).addEventListener( 'click', () => {
	window.editorInstance.setData( longData );
} );

document.getElementById( 'medium' ).addEventListener( 'click', () => {
	window.editorInstance.setData( mediumData );
} );

document.getElementById( 'short' ).addEventListener( 'click', () => {
	window.editorInstance.setData( shortData );
} );

startMode( document.querySelector( 'input[name="mode"]:checked' ).value );
