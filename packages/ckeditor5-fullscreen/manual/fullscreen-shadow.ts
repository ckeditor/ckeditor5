/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { AutoImage, ImageResize, ImageInsert } from '@ckeditor/ckeditor5-image';
import { AutoLink, LinkImage } from '@ckeditor/ckeditor5-link';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Underline } from '@ckeditor/ckeditor5-basic-styles';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FontColor, FontSize } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { HtmlComment, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { ShowBlocks } from '@ckeditor/ckeditor5-show-blocks';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { TableCellProperties, TableProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { Style } from '@ckeditor/ckeditor5-style';
import type { Editor } from '@ckeditor/ckeditor5-core';

import { Fullscreen } from '../src/fullscreen.js';

import { createEditorDomRoot, getOverlayConfig } from '@ckeditor/ckeditor5-ui/manual/_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

type EditorType = 'classic' | 'decoupled';

const MOUNT = document.getElementById( 'mount' )!;
const EDITOR_TEMPLATE = document.getElementById( 'editor-template' ) as HTMLTemplateElement;

const EDITOR_TYPE_SELECT = document.getElementById( 'editor-type' ) as HTMLSelectElement;
const CUSTOM_CONTAINER_INPUT = document.getElementById( 'custom-container' ) as HTMLInputElement;
const MENU_BAR_INPUT = document.getElementById( 'menu-bar' ) as HTMLInputElement;
const MENU_BAR_FULLSCREEN_INPUT = document.getElementById( 'menu-bar-fullscreen' ) as HTMLInputElement;

// The root the editor currently lives in: the `#mount` element in the light DOM, or a shadow root. Kept in a
// variable rather than read from the DOM, because a closed root cannot be reached through `host.shadowRoot`.
let editorDomRoot: HTMLElement | ShadowRoot;
let editorInstance: Editor | null = null;
let currentData: string | null = null;

const toolbarItems = [
	'fullscreen',
	'|',
	'heading', 'style',
	'|',
	'bold', 'italic', 'underline', 'removeFormat',
	'|',
	'link', 'insertImage', 'insertTable', 'blockQuote',
	'|',
	'bulletedList', 'numberedList', 'alignment',
	'|',
	'fontSize', 'fontColor', 'highlight', 'specialCharacters',
	'|',
	'sourceEditing', 'findAndReplace', 'showBlocks',
	'|',
	'undo', 'redo'
];

const commonConfig = {
	plugins: [
		ArticlePluginSet, Underline, RemoveFormat, FindAndReplace, FontColor, FontSize, Highlight,
		TableProperties, TableCellProperties, TableCaption, TableColumnResize,
		ImageResize, ImageInsert, LinkImage, AutoImage, AutoLink, HtmlComment,
		Alignment, BlockQuote, PasteFromOffice, ShowBlocks, TextTransformation,
		SpecialCharacters, SpecialCharactersEssentials,
		SourceEditing, Style, GeneralHtmlSupport, Fullscreen
	],
	toolbar: {
		items: toolbarItems
	},
	table: {
		contentToolbar: [
			'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
		]
	},
	image: {
		toolbar: [
			'imageTextAlternative', 'toggleImageCaption', '|',
			'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
			'resizeImage'
		]
	},
	root: {
		placeholder: 'Type the content here!'
	},
	style: {
		definitions: [
			{
				name: 'Title',
				element: 'h2',
				classes: [ 'document-title' ]
			},
			{
				name: 'Info box',
				element: 'p',
				classes: [ 'info-box' ]
			},
			{
				name: 'Marker',
				element: 'span',
				classes: [ 'marker' ]
			}
		]
	}
};

function getEditorConfig(): Record<string, any> {
	const customContainer = editorDomRoot.querySelector( '.custom-fullscreen-container' ) as HTMLElement;

	customContainer.style.display = CUSTOM_CONTAINER_INPUT.checked ? 'block' : 'none';

	return {
		...commonConfig,
		toolbar: { items: toolbarItems, shouldNotGroupWhenFull: true },
		fullscreen: {
			menuBar: { isVisible: MENU_BAR_FULLSCREEN_INPUT.checked },
			toolbar: { shouldNotGroupWhenFull: true },
			...( CUSTOM_CONTAINER_INPUT.checked ? { container: customContainer } : {} )
		},
		...getOverlayConfig()
	};
}

async function restart(): Promise<void> {
	const type = EDITOR_TYPE_SELECT.value as EditorType;

	if ( editorInstance ) {
		currentData = editorInstance.getData();

		await editorInstance.destroy();

		editorInstance = null;
	}

	editorDomRoot = createEditorDomRoot( MOUNT, { template: EDITOR_TEMPLATE } );

	const editorElement = editorDomRoot.querySelector( '#editor' ) as HTMLElement;
	const config = getEditorConfig();

	if ( type === 'classic' ) {
		editorInstance = await ClassicEditor.create( {
			...config,
			attachTo: editorElement,
			menuBar: { isVisible: MENU_BAR_INPUT.checked }
		} );
	} else {
		const editor = await DecoupledEditor.create( {
			...config,
			root: { element: editorElement }
		} );

		editorDomRoot.querySelector( '.document-editor__toolbar' )!.appendChild( editor.ui.view.toolbar.element! );

		if ( MENU_BAR_INPUT.checked ) {
			editorDomRoot.querySelector( '.document-editor__menu-bar' )!.appendChild( editor.ui.view.menuBarView.element! );
		}

		editorInstance = editor;
	}

	window.editor = editorInstance;

	if ( currentData !== null ) {
		editorInstance.setData( currentData );
	}
}

/**
 * Every control rebuilds the editor, so the restarts are queued – switching two of them quickly must not leave two
 * editors racing for the same root.
 */
let pendingRestart = Promise.resolve();

function scheduleRestart(): void {
	pendingRestart = pendingRestart
		.then( () => restart() )
		.catch( err => console.error( err.stack ) );
}

for ( const control of [
	EDITOR_TYPE_SELECT, CUSTOM_CONTAINER_INPUT, MENU_BAR_INPUT, MENU_BAR_FULLSCREEN_INPUT
] ) {
	control.addEventListener( 'change', scheduleRestart );
}

scheduleRestart();
