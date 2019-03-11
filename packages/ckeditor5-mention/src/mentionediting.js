/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The mention editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MentionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MentionEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				key: 'data-mention',
				classes: 'mention'
			},
			model: {
				key: 'mention',
				value: viewItem => {
					return viewItem.getAttribute( 'data-mention' );
				}
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: ( modelAttributeValue, viewWriter ) => {
				return viewWriter.createAttributeElement( 'span', {
					class: 'mention',
					'data-mention': modelAttributeValue
				} );
			}
		} );

		// Allow fontSize attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'mention' } );

		// Remove mention attribute if text was edited.
		editor.model.document.registerPostFixer( writer => {
			const changes = editor.model.document.differ.getChanges();

			let wasChanged = false;

			for ( const change of changes ) {
				if ( change.type == 'insert' || change.type == 'remove' ) {
					const textNode = change.position.textNode;

					if ( change.name == '$text' && textNode && textNode.hasAttribute( 'mention' ) ) {
						writer.removeAttribute( 'mention', textNode );
						wasChanged = true;
					}
				}

				if ( change.type == 'remove' ) {
					const nodeBefore = change.position.nodeBefore;

					if ( nodeBefore && nodeBefore.hasAttribute( 'mention' ) ) {
						const text = nodeBefore.data;
						if ( text != nodeBefore.getAttribute( 'mention' ) ) {
							writer.removeAttribute( 'mention', nodeBefore );
							wasChanged = true;
						}
					}
				}
			}

			return wasChanged;
		} );

		editor.model.document.registerPostFixer( writer => {
			const selection = editor.model.document.selection;
			const focus = selection.focus;

			if ( selection.hasAttribute( 'mention' ) && selection.isCollapsed && focus.nodeBefore && focus.nodeBefore.is( 'text' ) ) {
				writer.removeSelectionAttribute( 'mention' );

				return true;
			}
		} );
	}
}
