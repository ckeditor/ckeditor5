/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/anchorediting
 */

import {
	Plugin,
	type Editor
} from 'ckeditor5/src/core';

import type {
	DowncastConversionApi,
	ViewAttributeElement,
	ViewElement
} from 'ckeditor5/src/engine';

/**
 * Conversion for anchors.
 */
export default class AnchorEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'AnchorEditing' {
		return 'AnchorEditing';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Allow link attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'anchorName' } );

		this._defineConversion();
	}

	public _defineConversion(): void {
		this.editor.conversion.for( 'downcast' )
			.attributeToElement( { model: 'anchorName', view: createLinkElement } );

		function createLinkElement( anchorName: string, { writer }: DowncastConversionApi ): ViewAttributeElement {
			// Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
			const linkElement = writer.createAttributeElement( 'a', { name: anchorName }, { priority: 5 } );

			writer.setCustomProperty( 'link', true, linkElement );

			return linkElement;
		}

		this.editor.conversion.for( 'upcast' )
			.elementToAttribute( {
				view: {
					name: 'a',
					attributes: {
						name: true
					}
				},
				model: {
					key: 'anchorName',
					value: ( viewElement: ViewElement ) => viewElement.getAttribute( 'name' )
				}
			} );
	}
}
