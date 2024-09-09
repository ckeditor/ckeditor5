/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/bookmarkediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { Widget, toWidget } from 'ckeditor5/src/widget.js';
import { IconView } from 'ckeditor5/src/ui.js';

import bookmarkIcon from '../theme/icons/bookmark.svg';
import type { ViewUIElement, DowncastWriter } from 'ckeditor5/src/engine.js';

/**
 * The bookmark editing plugin.
 */
export default class BookmarkEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BookmarkEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Widget ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._defineSchema();
		this._defineConverters();
	}

	/**
	 * Defines the schema for the bookmark feature.
	 */
	private _defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'bookmark', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: 'bookmarkId',
			disallowAttributes: 'linkHref'
		} );
	}

	/**
	 * Defines the converters for the bookmark feature.
	 */
	private _defineConverters() {
		const { editor } = this;
		const { conversion, t } = editor;

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'bookmark',
			view: ( modelElement, { writer } ) => {
				const emptyElement = writer.createEmptyElement( 'a', {
					'id': modelElement.getAttribute( 'bookmarkId' )
				} );

				emptyElement.getFillerOffset = () => null;

				return emptyElement;
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'bookmark',
			view: ( modelElement, { writer } ) => {
				const id = modelElement.getAttribute( 'bookmarkId' );
				const containerElement = writer.createContainerElement( 'a', {
					id,
					class: 'ck-bookmark'
				}, [ this._createBookmarkUIElement( writer ) ] );

				// `getFillerOffset` is not needed to set here, because `toWidget` has already covered it.

				return toWidget( containerElement, writer, {
					label: ` ${ t( 'Bookmark' ) } ${ id }`
				} );
			}
		} );
	}

	/**
	 * Creates a UI element for the `bookmark` representation in editing view.
	 */
	private _createBookmarkUIElement( writer: DowncastWriter ): ViewUIElement {
		return writer.createUIElement( 'span', { class: 'ck-bookmark__icon' }, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			const icon = new IconView();

			icon.set( {
				content: bookmarkIcon,
				isColorInherited: false
			} );

			icon.render();

			domElement.appendChild( icon.element! );

			return domElement;
		} );
	}
}
