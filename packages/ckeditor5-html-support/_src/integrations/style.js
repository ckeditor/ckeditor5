/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/style
 */

import { Plugin } from 'ckeditor5/src/core';
import {
	createObjectView,
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter,
	viewToModelObjectConverter
} from '../converters.js';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support for `style` elements.
 *
 * @extends module:core/plugin~Plugin
 */
export default class StyleElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StyleElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register:style', ( evt, definition ) => {
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			schema.register( 'htmlStyle', definition.modelSchema );

			schema.extend( 'htmlStyle', {
				allowAttributes: [ 'htmlAttributes', 'htmlContent' ],
				isContent: true
			} );

			editor.data.registerRawContentMatcher( {
				name: 'style'
			} );

			conversion.for( 'upcast' ).elementToElement( {
				view: 'style',
				model: viewToModelObjectConverter( definition )
			} );

			conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, dataFilter ) );

			conversion.for( 'downcast' ).elementToElement( {
				model: 'htmlStyle',
				view: ( modelElement, { writer } ) => {
					return createObjectView( 'style', modelElement, writer );
				}
			} );

			conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition ) );

			evt.stop();
		} );
	}
}
