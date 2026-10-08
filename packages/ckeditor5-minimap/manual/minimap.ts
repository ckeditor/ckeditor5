/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { ImageUpload, ImageResize } from '@ckeditor/ckeditor5-image';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Fullscreen } from '@ckeditor/ckeditor5-fullscreen';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';

import { Minimap } from '../src/minimap.js';
import { shortData, mediumData, longData } from '../tests/fixtures.js';

import { wrapInShadowRoot } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

declare global {
	interface Window {
		editorInstance: any;
	}
}

// Kept in variables because `document.querySelector()` cannot reach into a shadow root.
const editorContentElement = document.querySelector( '#editor-content' ) as HTMLElement;
const documentContainerElement = document.querySelector( '.document-container' ) as HTMLElement;

// The whole minimap UI goes into one DOM root, and the editing root into a second one nested inside it. What sits
// between them is the point: `.editor-container`, the scrollable ancestor the minimap has to resolve, stays in the
// outer root, so that resolution has to cross a shadow host.
//
// Nesting rather than leaving the toolbar and the minimap container behind in the light DOM is what lets this test
// disable the document-level theme like every other shadow test: everything that needs the theme is inside a root
// that adopted it, so UI rendering unstyled is a real signal here too.
//
// The page's own stylesheets are mirrored into both, as they carry the A4 geometry of `#editor-content` and the
// frame of the containers around it.
const outerDomRoot = wrapInShadowRoot( documentContainerElement );

wrapInShadowRoot( editorContentElement );

// The toolbar and the minimap containers moved into the outer root with the rest of `.document-container`, so they
// are queried from there rather than from the document. The controls above it stay in the light DOM either way.
const uiRoot: Document | ShadowRoot = outerDomRoot ?? document;

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
		container: uiRoot.querySelector( '.minimap-container' )
	},
	cloudServices: CS_CONFIG
};

const simpleModelButton = document.getElementById( 'mode-simple' );
const standardModeButton = document.getElementById( 'mode-standard' );

simpleModelButton!.addEventListener( 'change', handleModeChange );
standardModeButton!.addEventListener( 'change', handleModeChange );

async function handleModeChange( evt: any ) {
	await startMode( evt.target.value );
}

/**
 * Re-creates the editor in whatever preview style and shadow root mode the UI currently selects.
 */
async function reloadSelectedMode() {
	await startMode( ( document.querySelector( 'input[name="mode"]:checked' ) as HTMLInputElement ).value );
}

async function startMode( selectedMode: string ) {
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
			container: uiRoot.querySelector( '.minimap-container' )
		}
	} );
}

async function reloadEditor( config: any ) {
	if ( window.editorInstance ) {
		await window.editorInstance.destroy();
	}

	const editor = await DecoupledEditor.create( {
		...config,
		root: {
			element: editorContentElement
		}
	} );

	const toolbarContainer = uiRoot.querySelector( '#toolbar-container' );

	toolbarContainer!.innerHTML = '';
	toolbarContainer!.appendChild( editor.ui.view.toolbar.element! );

	editor.setData( longData );
	// editor.setData( mediumData );

	window.editorInstance = editor;
}

document.getElementById( 'long' )!.addEventListener( 'click', () => {
	window.editorInstance.setData( longData );
} );

document.getElementById( 'medium' )!.addEventListener( 'click', () => {
	window.editorInstance.setData( mediumData );
} );

document.getElementById( 'short' )!.addEventListener( 'click', () => {
	window.editorInstance.setData( shortData );
} );

reloadSelectedMode();
