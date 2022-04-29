/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/dualcontent
 */

import { Plugin } from 'ckeditor5/src/core';
import { priorities } from 'ckeditor5/src/utils';
import {
	modelToViewBlockAttributeConverter,
	viewToModelBlockAttributeConverter
} from '../converters';

import DataFilter from '../datafilter';

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
 *
 * @extends module:core/plugin~Plugin
 */
export default class DualContentModelElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register', ( evt, definition ) => {
			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			if ( !definition.paragraphLikeModel ) {
				return;
			}

			// Can only apply to newly registered features.
			if ( schema.isRegistered( definition.model ) || schema.isRegistered( definition.paragraphLikeModel ) ) {
				return;
			}

			const paragraphLikeModelDefinition = {
				model: definition.paragraphLikeModel,
				view: definition.view
			};

			schema.register( definition.model, definition.modelSchema );
			schema.register( paragraphLikeModelDefinition.model, {
				inheritAllFrom: '$block'
			} );

			conversion.for( 'upcast' ).elementToElement( {
				view: definition.view,
				model: ( viewElement, { writer } ) => {
					if ( this._hasBlockContent( viewElement ) ) {
						return writer.createElement( definition.model );
					}

					return writer.createElement( paragraphLikeModelDefinition.model );
				},
				// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
				// this listener is called before it. If not, some elements will be transformed into a paragraph.
				converterPriority: priorities.get( 'low' ) + 1
			} );

			conversion.for( 'downcast' ).elementToElement( {
				view: definition.view,
				model: definition.model
			} );
			this._addAttributeConversion( definition );

			conversion.for( 'downcast' ).elementToElement( {
				view: paragraphLikeModelDefinition.view,
				model: paragraphLikeModelDefinition.model
			} );
			this._addAttributeConversion( paragraphLikeModelDefinition );

			evt.stop();
		} );
	}

	/**
	 * Checks whether the given view element includes any other block element.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement
	 * @returns {Boolean}
	 */
	_hasBlockContent( viewElement ) {
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
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_addAttributeConversion( definition ) {
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
