/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/style
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import {
	createObjectView,
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter,
	viewToModelObjectConverter
} from '../converters';
import DataFilter, { type RegisterEvent } from '../datafilter';
import type { DataSchemaBlockElementDefinition } from '../dataschema';

/**
 * Provides the General HTML Support for `style` elements.
 */
export default class StyleElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StyleElementSupport' {
		return 'StyleElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on<RegisterEvent>( 'register:style', ( evt, definition ) => {
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
declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ StyleElementSupport.pluginName ]: StyleElementSupport;
	}
}
