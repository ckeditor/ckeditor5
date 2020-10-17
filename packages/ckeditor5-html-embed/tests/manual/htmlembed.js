/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import sanitizeHtml from 'sanitize-html';
import { clone } from 'lodash-es';
import HTMLEmbed from '../../src/htmlembed';

const restrictedModeButton = document.getElementById( 'mode-enabled' );
const standardModeButton = document.getElementById( 'mode-disabled' );

restrictedModeButton.addEventListener( 'change', handleModeChange );
standardModeButton.addEventListener( 'change', handleModeChange );

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
			previewsInData: true,
			sanitizeHtml( rawHtml ) {
				const config = getSanitizeHtmlConfig( sanitizeHtml.defaults );
				const cleanHtml = sanitizeHtml( rawHtml, config );

				return {
					html: cleanHtml,
					hasModified: rawHtml !== cleanHtml
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
		plugins: [ ArticlePluginSet, HTMLEmbed ],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', '|',
			'undo', 'redo', '|', 'htmlEmbed'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		}
	} );

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}

function getSanitizeHtmlConfig( defaultConfig ) {
	const config = clone( defaultConfig );

	config.allowedTags.push(
		// Allows embedding iframes.
		'iframe',

		// Allows embedding media.
		'audio',
		'video',
		'picture',
		'source',
		'img'
	);

	config.selfClosing.push( 'source' );

	// Remove duplicates.
	config.allowedTags = [ ...new Set( config.allowedTags ) ];

	config.allowedSchemesAppliedToAttributes.push(
		// Responsive images.
		'srcset'
	);

	for ( const htmlTag of config.allowedTags ) {
		if ( !Array.isArray( config.allowedAttributes[ htmlTag ] ) ) {
			config.allowedAttributes[ htmlTag ] = [];
		}

		// Allow inlining styles for all elements.
		config.allowedAttributes[ htmlTag ].push( 'style' );
	}

	// Should we allow the `controls` attribute?
	config.allowedAttributes.video.push( 'width', 'height', 'controls' );
	config.allowedAttributes.audio.push( 'controls' );

	config.allowedAttributes.iframe.push( 'src' );
	config.allowedAttributes.img.push( 'srcset', 'sizes', 'src' );
	config.allowedAttributes.source.push( 'src', 'srcset', 'media', 'sizes', 'type' );

	return config;
}
