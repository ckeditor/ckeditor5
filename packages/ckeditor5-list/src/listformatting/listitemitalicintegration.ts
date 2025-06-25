/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemitalicintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

import { ListEditing } from '../list/listediting.js';
import type { ListFormatting } from '../listformatting.js';

/**
 * The list item italic integration plugin.
 */
export class ListItemItalicIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemItalicIntegration' as const;
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

		if ( !editor.plugins.has( 'ItalicEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		ListFormatting.registerFormatAttribute( 'italic', 'listItemItalic' );

		// Register the downcast strategy in init() so that the attribute name is registered before the list editing
		// registers its converters.
		// This ensures that the attribute is recognized by downcast strategies and bogus paragraphs are handled correctly.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemItalic',

			setAttributeOnDowncast( writer, value, viewElement ) {
				if ( value ) {
					writer.addClass( 'ck-list-marker-italic', viewElement );
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

		if ( !editor.plugins.has( 'ItalicEditing' ) || !this.editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemItalic' } );
		model.schema.setAttributeProperties( 'listItemItalic', {
			isFormatting: true
		} );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'listItemItalic' );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: 'listItemItalic',
			view: {
				name: 'li',
				classes: 'ck-list-marker-italic'
			}
		} );
	}
}
