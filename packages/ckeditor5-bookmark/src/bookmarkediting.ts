/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/bookmarkediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { toWidget } from 'ckeditor5/src/widget.js';
import { IconView } from 'ckeditor5/src/ui.js';
import type { ViewUIElement, DowncastWriter } from 'ckeditor5/src/engine.js';

import bookmarkIcon from '../theme/icons/bookmark.svg';

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

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: {
					name: 'bookmark',
					attributes: [ 'bookmarkId' ]
				},
				view: ( modelElement, { writer } ) => {
					const emptyElement = writer.createEmptyElement( 'a', {
						'id': modelElement.getAttribute( 'bookmarkId' )
					} );

					// `getFillerOffset` is not needed to set here, because `emptyElement` has already covered it.

					return emptyElement;
				}
			} );

		conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: {
					name: 'bookmark',
					attributes: [ 'bookmarkId' ]
				},
				view: ( modelElement, { writer } ) => {
					const id = modelElement.getAttribute( 'bookmarkId' );
					const containerElement = writer.createContainerElement( 'a', {
						id,
						class: 'ck-bookmark'
					}, [ this._createBookmarkUIElement( writer ) ] );

					// `getFillerOffset` is not needed to set here, because `toWidget` has already covered it.

					const labelCreator = () => `${ id } ${ t( 'bookmark widget' ) }`;

					return toWidget( containerElement, writer, { label: labelCreator } );
				}
			} );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: element => {
					const isAnchorElement = element.name === 'a';

					if ( !isAnchorElement ) {
						return null;
					}

					const hasIdAttribute = element.hasAttribute( 'id' );
					const hasHrefAttribute = element.hasAttribute( 'href' );
					const isEmpty = element.isEmpty;

					if ( !hasIdAttribute || hasHrefAttribute || !isEmpty ) {
						return null;
					}

					return { name: true };
				},
				model: ( viewElement, { writer } ) => {
					const bookmarkId = viewElement.getAttribute( 'id' );

					return writer.createElement( 'bookmark', { bookmarkId } );
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
