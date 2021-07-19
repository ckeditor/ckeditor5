/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/mediaembed
 */

import { Plugin } from 'ckeditor5/src/core';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:media-embed/mediaembed~MediaEmbed Media Embed} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedElementSupport extends Plugin {
	static get requires() {
		return [ DataFilter ];
	}

	init() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'MediaEmbed' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register:oembed', ( evt, definition ) => {
			if ( definition.model !== 'htmlOembed' ) {
				return;
			}

			schema.extend( 'media', {
				allowAttributes: [
					'htmlAttributes',
					// Map of attributes on the containing `<figure>`.
					'htmlFigureAttributes'
				]
			} );

			conversion.for( 'upcast' ).add( viewToModelOembedAttributesConverter() );

			evt.stop();
		} );

		dataFilter.on( 'register:figure', () => {
			// conversion.for( 'upcast' ).add( consumeTableFigureConverter() );
		} );
	}
}

function viewToModelOembedAttributesConverter() {
	return dispatcher => {
		dispatcher.on( 'element:oembed', ( evt, data, conversionApi ) => {
			debugger;
		}, { priority: 'high' } );
	};
}

// function consumeTableFigureConverter
