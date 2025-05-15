/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/style
 */

import { Plugin } from 'ckeditor5/src/core.js';

import {
	createObjectView,
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter,
	viewToModelObjectConverter
} from '../converters.js';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter.js';
import type { DataSchemaBlockElementDefinition } from '../dataschema.js';

/**
 * Provides the General HTML Support for `style` elements.
 */
export default class StyleElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StyleElementSupport' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on<DataFilterRegisterEvent>( 'register:style', ( evt, definition ) => {
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			schema.register( 'htmlStyle', definition.modelSchema );

			schema.extend( 'htmlStyle', {
				allowAttributes: [ 'htmlStyleAttributes', 'htmlContent' ],
				isContent: true
			} );

			editor.data.registerRawContentMatcher( {
				name: 'style'
			} );

			conversion.for( 'upcast' ).elementToElement( {
				view: 'style',
				model: viewToModelObjectConverter( definition )
			} );

			conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter(
				definition as DataSchemaBlockElementDefinition, dataFilter
			) );

			conversion.for( 'downcast' ).elementToElement( {
				model: 'htmlStyle',
				view: ( modelElement, { writer } ) => {
					return createObjectView( 'style', modelElement, writer );
				}
			} );

			conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition as DataSchemaBlockElementDefinition ) );

			evt.stop();
		} );
	}
}
