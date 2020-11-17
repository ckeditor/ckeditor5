/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import sanitizeHtml from 'sanitize-html';
import { clone } from 'lodash-es';
import { foo } from '@ckeditor/ckeditor5-dll/foo';
import { bar } from '@ckeditor/ckeditor5-dll/bar';
import { Plugin, ClassicEditor, HtmlEmbedEditing, HtmlEmbedUI } from '@ckeditor/ckeditor5-dll/utils';

foo();
bar();

class MahPlugin extends Plugin {
	init() {
		console.log( 'MahPlugin: works.' );
	}
}

class CustomHtmlEmbed extends Plugin {
	static get requires() {
		return [ HtmlEmbedEditing, HtmlEmbedUI ];
	}

	init() {
		console.log( 'CustomHtmlEmbed: works.' );
	}
}

const config = Object.assign( {}, ClassicEditor.defaultConfig, {
	extraPlugins: [ MahPlugin, CustomHtmlEmbed ],
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml( rawHtml ) {
			const config = getSanitizeHtmlConfig( sanitizeHtml.defaults );
			const cleanHtml = sanitizeHtml( rawHtml, config );

			return {
				html: cleanHtml,
				hasChanged: rawHtml !== cleanHtml
			};
		}
	}
} );

config.toolbar.items.push( 'htmlEmbed' );

ClassicEditor.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;
	} );

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

	config.allowedAttributes.audio.push( 'controls' );
	config.allowedAttributes.video.push( 'width', 'height', 'controls' );

	config.allowedAttributes.iframe.push( 'src' );
	config.allowedAttributes.img.push( 'srcset', 'sizes', 'src' );
	config.allowedAttributes.source.push( 'src', 'srcset', 'media', 'sizes', 'type' );

	return config;
}
