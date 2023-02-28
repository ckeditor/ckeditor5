/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/dualcontent
 */

import type { ViewElement } from 'ckeditor5/src/engine';
import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { priorities } from 'ckeditor5/src/utils';

import {
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter
} from '../converters';
import DataFilter, { type RegisterEvent } from '../datafilter';
import type { DataSchemaBlockElementDefinition } from '../dataschema';

/**
 * Provides the General HTML Support integration for elements which can behave like sectioning element (e.g. article) or
 * element accepting only inline content (e.g. paragraph).
 *
 * The distinction between this two content models is important for choosing correct schema model and proper content conversion.
 * As an example, it ensures that:
 *
 * * children elements paragraphing is enabled for sectioning elements only,
 * * element and its content can be correctly handled by editing view (splitting and merging elements),
 * * model element HTML is semantically correct and easier to work with.
 *
 * If element contains any block element, it will be treated as a sectioning element and registered using
 * {@link module:html-support/dataschema~DataSchemaDefinition#model} and
 * {@link module:html-support/dataschema~DataSchemaDefinition#modelSchema} in editor schema.
 * Otherwise, it will be registered under {@link module:html-support/dataschema~DataSchemaBlockElementDefinition#paragraphLikeModel} model
 * name with model schema accepting only inline content (inheriting from `$block`).
 */
export default class DualContentModelElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DualContentModelElementSupport' {
		return 'DualContentModelElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on<RegisterEvent>( 'register', ( evt, definition ) => {
			const blockDefinition = definition as DataSchemaBlockElementDefinition;
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			if ( !blockDefinition.paragraphLikeModel ) {
				return;
			}

			// Can only apply to newly registered features.
			if ( schema.isRegistered( blockDefinition.model ) || schema.isRegistered( blockDefinition.paragraphLikeModel ) ) {
				return;
			}

			const paragraphLikeModelDefinition: DataSchemaBlockElementDefinition = {
				model: blockDefinition.paragraphLikeModel,
				view: blockDefinition.view
			};

			schema.register( blockDefinition.model, blockDefinition.modelSchema );
			schema.register( paragraphLikeModelDefinition.model, {
				inheritAllFrom: '$block'
			} );

			conversion.for( 'upcast' ).elementToElement( {
				view: blockDefinition.view!,
				model: ( viewElement, { writer } ) => {
					if ( this._hasBlockContent( viewElement ) ) {
						return writer.createElement( blockDefinition.model );
					}

					return writer.createElement( paragraphLikeModelDefinition.model );
				},
				// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
				// this listener is called before it. If not, some elements will be transformed into a paragraph.
				converterPriority: priorities.get( 'low' ) + 0.5
			} );

			conversion.for( 'downcast' ).elementToElement( {
				view: blockDefinition.view!,
				model: blockDefinition.model
			} );
			this._addAttributeConversion( blockDefinition );

			conversion.for( 'downcast' ).elementToElement( {
				view: paragraphLikeModelDefinition.view!,
				model: paragraphLikeModelDefinition.model
			} );
			this._addAttributeConversion( paragraphLikeModelDefinition );

			evt.stop();
		} );
	}

	/**
	 * Checks whether the given view element includes any other block element.
	 */
	private _hasBlockContent( viewElement: ViewElement ): boolean {
		const view = this.editor.editing.view;
		const blockElements = view.domConverter.blockElements;

		// Traversing the viewElement subtree looking for block elements.
		// Especially for the cases like <div><a href="#"><p>foo</p></a></div>.
		// https://github.com/ckeditor/ckeditor5/issues/11513
		for ( const viewItem of view.createRangeIn( viewElement ).getItems() ) {
			if ( viewItem.is( 'element' ) && blockElements.includes( viewItem.name ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Adds attribute filtering conversion for the given data schema.
	 */
	private _addAttributeConversion( definition: DataSchemaBlockElementDefinition ) {
		const editor = this.editor;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );

		editor.model.schema.extend( definition.model, {
			allowAttributes: 'htmlAttributes'
		} );

		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, dataFilter ) );
		conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition ) );
	}
}
declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ DualContentModelElementSupport.pluginName ]: DualContentModelElementSupport;
	}
}
