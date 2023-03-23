/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/script
 */

import { Plugin } from 'ckeditor5/src/core';
import {
	createObjectView,
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter,
	viewToModelObjectConverter
} from '../converters';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter';
import type { DataSchemaBlockElementDefinition } from '../dataschema';

/**
 * Provides the General HTML Support for `script` elements.
 */
export default class ScriptElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ScriptElementSupport' {
		return 'ScriptElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on<DataFilterRegisterEvent>( 'register:script', ( evt, definition ) => {
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			schema.register( 'htmlScript', definition.modelSchema );

			schema.extend( 'htmlScript', {
				allowAttributes: [ 'htmlAttributes', 'htmlContent' ],
				isContent: true
			} );

			editor.data.registerRawContentMatcher( {
				name: 'script'
			} );

			conversion.for( 'upcast' ).elementToElement( {
				view: 'script',
				model: viewToModelObjectConverter( definition )
			} );

			conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter(
				definition as DataSchemaBlockElementDefinition,
				dataFilter
			) );

			conversion.for( 'downcast' ).elementToElement( {
				model: 'htmlScript',
				view: ( modelElement, { writer } ) => {
					return createObjectView( 'script', modelElement, writer );
				}
			} );

			conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition as DataSchemaBlockElementDefinition ) );

			evt.stop();
		} );
	}
}
