/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module block-quote/blockquoteediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Enter } from 'ckeditor5/src/enter';
import { Delete } from 'ckeditor5/src/typing';

import BlockQuoteCommand from './blockquotecommand';

/**
 * The block quote editing.
 *
 * Introduces the `'blockQuote'` command and the `'blockQuote'` model element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockQuoteEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BlockQuoteEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Enter, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		editor.commands.add( 'blockQuote', new BlockQuoteCommand( editor ) );

		schema.register( 'blockQuote', {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );

		editor.conversion.elementToElement( { model: 'blockQuote', view: 'blockquote' } );

		// Postfixer which cleans incorrect model states connected with block quotes.
		editor.model.document.registerPostFixer( writer => {
			const changes = editor.model.document.differ.getChanges();

			for ( const entry of changes ) {
				if ( entry.type == 'insert' ) {
					const element = entry.position.nodeAfter;

					if ( !element ) {
						// We are inside a text node.
						continue;
					}

					if ( element.is( 'element', 'blockQuote' ) && element.isEmpty ) {
						// Added an empty blockQuote - remove it.
						writer.remove( element );

						return true;
					} else if ( element.is( 'element', 'blockQuote' ) && !schema.checkChild( entry.position, element ) ) {
						// Added a blockQuote in incorrect place. Unwrap it so the content inside is not lost.
						writer.unwrap( element );

						return true;
					} else if ( element.is( 'element' ) ) {
						// Just added an element. Check that all children meet the scheme rules.
						const range = writer.createRangeIn( element );

						for ( const child of range.getItems() ) {
							if (
								child.is( 'element', 'blockQuote' ) &&
								!schema.checkChild( writer.createPositionBefore( child ), child )
							) {
								writer.unwrap( child );

								return true;
							}
						}
					}
				} else if ( entry.type == 'remove' ) {
					const parent = entry.position.parent;

					if ( parent.is( 'element', 'blockQuote' ) && parent.isEmpty ) {
						// Something got removed and now blockQuote is empty. Remove the blockQuote as well.
						writer.remove( parent );

						return true;
					}
				}
			}

			return false;
		} );

		const viewDocument = this.editor.editing.view.document;
		const selection = editor.model.document.selection;
		const blockQuoteCommand = editor.commands.get( 'blockQuote' );

		// Overwrite default Enter key behavior.
		// If Enter key is pressed with selection collapsed in empty block inside a quote, break the quote.
		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			if ( !selection.isCollapsed || !blockQuoteCommand.value ) {
				return;
			}

			const positionParent = selection.getLastPosition().parent;

			if ( positionParent.isEmpty ) {
				editor.execute( 'blockQuote' );
				editor.editing.view.scrollToTheSelection();

				data.preventDefault();
				evt.stop();
			}
		}, { context: 'blockquote' } );

		// Overwrite default Backspace key behavior.
		// If Backspace key is pressed with selection collapsed in first empty block inside a quote, break the quote.
		this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			if ( data.direction != 'backward' || !selection.isCollapsed || !blockQuoteCommand.value ) {
				return;
			}

			const positionParent = selection.getLastPosition().parent;

			if ( positionParent.isEmpty && !positionParent.previousSibling ) {
				editor.execute( 'blockQuote' );
				editor.editing.view.scrollToTheSelection();

				data.preventDefault();
				evt.stop();
			}
		}, { context: 'blockquote' } );
	}
}
