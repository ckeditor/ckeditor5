/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MentionCommand from './mentioncommand';

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

		// Allow mention attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'mention' } );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				key: 'data-mention',
				classes: 'mention'
			},
			model: {
				key: 'mention',
				value: viewItem => ( {
					name: viewItem.getAttribute( 'data-mention' )
				} )
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: ( modelAttributeValue, viewWriter ) => {
				const mention = modelAttributeValue && modelAttributeValue.name || modelAttributeValue;

				return viewWriter.createAttributeElement( 'span', {
					class: 'mention',
					'data-mention': mention
				} );
			}
		} );

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

						const mention = nodeBefore.getAttribute( 'mention' );

						const name = mention.name || mention;

						const textName = text.slice( 1 );

						if ( textName != name ) {
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

		editor.commands.add( 'mention', new MentionCommand( editor ) );
	}
}
