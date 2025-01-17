/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/script
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
	public static get pluginName() {
		return 'ScriptElementSupport' as const;
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

		dataFilter.on<DataFilterRegisterEvent>( 'register:script', ( evt, definition ) => {
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			schema.register( 'htmlScript', definition.modelSchema );

			schema.extend( 'htmlScript', {
				allowAttributes: [ 'htmlScriptAttributes', 'htmlContent' ],
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
