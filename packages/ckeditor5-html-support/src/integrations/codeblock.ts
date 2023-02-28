/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/codeblock
 */

import type {
	DowncastAttributeEvent,
	DowncastDispatcher,
	Element,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement
} from 'ckeditor5/src/engine';
import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import { updateViewAttributes, type GHSViewAttributes } from '../conversionutils';
import DataFilter, { type RegisterEvent } from '../datafilter';

/**
 * Provides the General HTML Support integration with {@link module:code-block/codeblock~CodeBlock Code Block} feature.
 */
export default class CodeBlockElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ DataFilter ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CodeBlockElementSupport' {
		return 'CodeBlockElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		if ( !this.editor.plugins.has( 'CodeBlockEditing' ) ) {
			return;
		}

		const dataFilter = this.editor.plugins.get( DataFilter );

		dataFilter.on<RegisterEvent>( 'register:pre', ( evt, definition ) => {
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

/**
 * View-to-model conversion helper preserving allowed attributes on {@link module:code-block/codeblock~CodeBlock Code Block}
 * feature model element.
 *
 * Attributes are preserved as a value of `htmlAttributes` model attribute.
 * @param dataFilter
 * @returns Returns a conversion callback.
 */
function viewToModelCodeBlockAttributeConverter( dataFilter: DataFilter ) {
	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( 'element:code', ( evt, data, conversionApi ) => {
			const viewCodeElement = data.viewItem;
			const viewPreElement = viewCodeElement.parent;

			if ( !viewPreElement || !viewPreElement.is( 'element', 'pre' ) ) {
				return;
			}

			preserveElementAttributes( viewPreElement, 'htmlAttributes' );
			preserveElementAttributes( viewCodeElement, 'htmlContentAttributes' );

			function preserveElementAttributes( viewElement: ViewElement, attributeName: string ) {
				const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange! );
				}
			}
		}, { priority: 'low' } );
	};
}

/**
 * Model-to-view conversion helper applying attributes from {@link module:code-block/codeblock~CodeBlock Code Block}
 * feature model element.
 * @returns Returns a conversion callback.
 */
function modelToViewCodeBlockAttributeConverter() {
	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAttributeEvent>( 'attribute:htmlAttributes:codeBlock', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const { attributeOldValue, attributeNewValue } = data;
			const viewCodeElement = conversionApi.mapper.toViewElement( data.item as Element )!;
			const viewPreElement = viewCodeElement.parent as ViewElement;

			updateViewAttributes(
				conversionApi.writer,
				attributeOldValue as GHSViewAttributes,
				attributeNewValue as GHSViewAttributes,
				viewPreElement
			);
		} );

		dispatcher.on<DowncastAttributeEvent>( 'attribute:htmlContentAttributes:codeBlock', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const { attributeOldValue, attributeNewValue } = data;
			const viewCodeElement = conversionApi.mapper.toViewElement( data.item as Element );

			updateViewAttributes(
				conversionApi.writer,
				attributeOldValue as GHSViewAttributes,
				attributeNewValue as GHSViewAttributes,
				viewCodeElement!
			);
		} );
	};
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ CodeBlockElementSupport.pluginName ]: CodeBlockElementSupport;
	}
}
