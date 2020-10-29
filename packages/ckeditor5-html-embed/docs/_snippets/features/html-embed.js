/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';

ClassicEditor.builtinPlugins.push( HtmlEmbed );

const previewsModeButton = document.getElementById( 'raw-html-previews-enabled' );
const noPreviewsModeButton = document.getElementById( 'raw-html-previews-disabled' );

previewsModeButton.addEventListener( 'change', handleModeChange );
noPreviewsModeButton.addEventListener( 'change', handleModeChange );

startMode( document.querySelector( 'input[name="mode"]:checked' ).value );

async function handleModeChange( evt ) {
	await startMode( evt.target.value );
}

async function startMode( selectedMode ) {
	if ( selectedMode === 'enabled' ) {
		await startEnabledPreviewsMode();
	} else {
		await startDisabledPreviewsMode();
	}
}

async function startEnabledPreviewsMode() {
	await reloadEditor( {
		htmlEmbed: {
			showPreviews: true,
			sanitizeHtml( rawHtml ) {
				return {
					html: rawHtml,
					hasChanged: false
				};
			}
		}
	} );
}

async function startDisabledPreviewsMode() {
	await reloadEditor();
}

async function reloadEditor( config = {} ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	config = Object.assign( config, {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'link',
				'imageUpload',
				'mediaEmbed',
				'insertTable',
				'htmlEmbed',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} );

	window.editor = await ClassicEditor.create( document.querySelector( '#snippet-html-embed' ), config );
}
