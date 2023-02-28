/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/codeblock
 */

import { Plugin } from 'ckeditor5/src/core';
import { updateViewAttributes } from '../conversionutils.js';

import DataFilter from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:code-block/codeblock~CodeBlock Code Block} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlockElementSupport extends Plugin {
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
		return 'CodeBlockElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		if ( !this.editor.plugins.has( 'CodeBlockEditing' ) ) {
			return;
		}

		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on( 'register:pre', ( evt, definition ) => {
			if ( definition.model !== 'codeBlock' ) {
				return;
			}

			const editor = this.editor;
			const schema = editor.model.schema;
			const conversion = editor.conversion;

			// Extend codeBlock to allow attributes required by attribute filtration.
			schema.extend( 'codeBlock', {
				allowAttributes: [ 'htmlAttributes', 'htmlContentAttributes' ]
			} );

			conversion.for( 'upcast' ).add( viewToModelCodeBlockAttributeConverter( dataFilter ) );
			conversion.for( 'downcast' ).add( modelToViewCodeBlockAttributeConverter() );

			evt.stop();
		} );
	}
}

// View-to-model conversion helper preserving allowed attributes on {@link module:code-block/codeblock~CodeBlock Code Block}
// feature model element.
//
// Attributes are preserved as a value of `htmlAttributes` model attribute.
//
// @private
// @param {module:html-support/datafilter~DataFilter} dataFilter
// @returns {Function} Returns a conversion callback.
function viewToModelCodeBlockAttributeConverter( dataFilter ) {
	return dispatcher => {
		dispatcher.on( 'element:code', ( evt, data, conversionApi ) => {
			const viewCodeElement = data.viewItem;
			const viewPreElement = viewCodeElement.parent;

			if ( !viewPreElement || !viewPreElement.is( 'element', 'pre' ) ) {
				return;
			}

			preserveElementAttributes( viewPreElement, 'htmlAttributes' );
			preserveElementAttributes( viewCodeElement, 'htmlContentAttributes' );

			function preserveElementAttributes( viewElement, attributeName ) {
				const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
				}
			}
		}, { priority: 'low' } );
	};
}

// Model-to-view conversion helper applying attributes from {@link module:code-block/codeblock~CodeBlock Code Block}
// feature model element.
//
// @private
// @returns {Function} Returns a conversion callback.
function modelToViewCodeBlockAttributeConverter() {
	return dispatcher => {
		dispatcher.on( 'attribute:htmlAttributes:codeBlock', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const { attributeOldValue, attributeNewValue } = data;
			const viewCodeElement = conversionApi.mapper.toViewElement( data.item );
			const viewPreElement = viewCodeElement.parent;

			updateViewAttributes( conversionApi.writer, attributeOldValue, attributeNewValue, viewPreElement );
		} );

		dispatcher.on( 'attribute:htmlContentAttributes:codeBlock', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const { attributeOldValue, attributeNewValue } = data;
			const viewCodeElement = conversionApi.mapper.toViewElement( data.item );

			updateViewAttributes( conversionApi.writer, attributeOldValue, attributeNewValue, viewCodeElement );
		} );
	};
}
