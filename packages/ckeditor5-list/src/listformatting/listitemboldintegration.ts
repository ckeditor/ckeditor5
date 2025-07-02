/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemboldintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { env } from 'ckeditor5/src/utils.js';

import { ListEditing } from '../list/listediting.js';
import type { ListFormatting } from '../listformatting.js';

/**
 * The list item bold integration plugin.
 */
export class ListItemBoldIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemBoldIntegration' as const;
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
	public static get requires() {
		return [ ListEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const ListFormatting: ListFormatting = editor.plugins.get( 'ListFormatting' );
		const listEditing = editor.plugins.get( ListEditing );

		if ( !editor.plugins.has( 'BoldEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		ListFormatting.registerFormatAttribute( 'bold', 'listItemBold' );

		// Register the downcast strategy in init() so that the attribute name is registered before the list editing
		// registers its converters.
		// This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemBold',

			setAttributeOnDowncast( writer, value, viewElement, options ) {
				if ( value ) {
					writer.addClass( 'ck-list-marker-bold', viewElement );

					// See: https://github.com/ckeditor/ckeditor5/issues/18790.
					if ( env.isSafari && !( options && options.dataPipeline ) ) {
						writer.setStyle( '--ck-content-list-marker-dummy-bold', '0', viewElement );
					}
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const model = editor.model;

		if ( !editor.plugins.has( 'BoldEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemBold' } );
		model.schema.setAttributeProperties( 'listItemBold', {
			isFormatting: true
		} );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'listItemBold' );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: 'listItemBold',
			view: {
				name: 'li',
				classes: 'ck-list-marker-bold'
			}
		} );
	}
}
