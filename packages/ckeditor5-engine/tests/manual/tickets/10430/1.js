/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const config = {
	cloudServices: CS_CONFIG,
	image: {
		toolbar: [
			'toggleImageCaption',
			'|',
			'imageTextAlternative'
		]
	},
	plugins: [
		ArticlePluginSet,
		ImageResize,
		Mention
	],
	mention: {
		feeds: [
			{
				marker: '@',
				feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ],
				minimumCharacters: 1
			}
		]
	},
	toolbar: [
		'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
	]
};

ClassicEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;

		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'highlight',
			view: () => {
				return {
					classes: 'highlight',
					priority: 1
				};
			}
		} );

		editor.model.change( writer => {
			const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
			const name = 'highlight:1234';

			writer.addMarker( name, { range, usingOperation: false } );
		} );

		window.updateSelectionRenderingStatus( true );
	} )
	.catch( error => {
		console.error( error.stack );
	} );

const blockedBanner = document.createElement( 'div' );
blockedBanner.classList.add( 'block-banner' );
blockedBanner.innerHTML = 'Selection rendering is ';

document.body.appendChild( blockedBanner );

window.updateSelectionRenderingStatus = function( isAllowed ) {
	if ( isAllowed ) {
		blockedBanner.classList.remove( 'blocked' );
	} else {
		blockedBanner.classList.add( 'blocked' );
	}
};
