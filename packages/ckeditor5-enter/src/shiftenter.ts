/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/shiftenter
 */

import ShiftEnterCommand from './shiftentercommand.js';
import EnterObserver, { type ViewDocumentEnterEvent } from './enterobserver.js';
import { Plugin } from '@ckeditor/ckeditor5-core';
import type { ViewElement, EditingView, DomConverter } from '@ckeditor/ckeditor5-engine';

/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */
export default class ShiftEnter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShiftEnter' as const;
	}

	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const domConverter = editor.data.htmlProcessor.domConverter;
		const t = this.editor.t;

		// Configure the schema.
		schema.register( 'softBreak', {
			allowWhere: '$text',
			isInline: true
		} );

		// Configure converters.
		conversion.for( 'upcast' ).elementToElement( {
			view: 'br',
			model: ( viewElement, { writer } ) => {
				// Find view sibling nodes (threat inline elements as transparent, but not an inline objects):
				// <p><strong>foo[<br>]</strong></p>[<p>bar</p>]
				// <p><strong>foo[<br>]</strong></p>[]
				// <p><strong>foo[<br>]</strong>[bar]</p>
				// <p><strong>foo[<br>][bar]</strong></p>
				// <p>foo[<br>][<img/>]</p>
				const nextSibling = findSibling( viewElement, 'forward', view, domConverter );
				const previousSibling = findSibling( viewElement, 'backward', view, domConverter );

				const nextSiblingIsBlock = domConverter.isBlockViewElement( nextSibling );
				const previousSiblingIsBlock = domConverter.isBlockViewElement( previousSibling );

				// If the <br> is surrounded by blocks then convert it to a paragraph:
				// * <p>foo</p>[<br>]<p>bar</p> -> <p>foo</p>[<p></p>]<p>bar</p>
				// * <p>foo</p>[<br>] -> <p>foo</p>[<p></p>]
				// * [<br>]<p>foo</p> -> [<p></p>]<p>foo</p>
				//
				// But don't convert if it's a <br> alone:
				// * <br> -> <br>
				if (
					( previousSibling || nextSibling ) &&
					( !previousSibling || previousSiblingIsBlock ) &&
					( !nextSibling || nextSiblingIsBlock )
				) {
					return writer.createElement( 'paragraph' );
				}

				// Just convert a <br>.
				return writer.createElement( 'softBreak' );
			}
		} );

		conversion.for( 'downcast' )
			.elementToElement( {
				model: 'softBreak',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
			} );

		view.addObserver( EnterObserver );

		editor.commands.add( 'shiftEnter', new ShiftEnterCommand( editor ) );

		this.listenTo<ViewDocumentEnterEvent>( viewDocument, 'enter', ( evt, data ) => {
			// When not in composition, we handle the action, so prevent the default one.
			// When in composition, it's the browser who modify the DOM (renderer is disabled).
			if ( !viewDocument.isComposing ) {
				data.preventDefault();
			}

			// The hard enter key is handled by the Enter plugin.
			if ( !data.isSoft ) {
				return;
			}

			editor.execute( 'shiftEnter' );
			view.scrollToTheSelection();
		}, { priority: 'low' } );

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Insert a soft break (a <code>&lt;br&gt;</code> element)' ),
					keystroke: 'Shift+Enter'
				}
			]
		} );
	}
}

/**
 * Returns sibling node, threats inline elements as transparent (but should stop on an inline objects).
 */
function findSibling(
	viewElement: ViewElement,
	direction: 'forward' | 'backward',
	view: EditingView,
	domConverter: DomConverter
) {
	let position = view.createPositionAt( viewElement, direction == 'forward' ? 'after' : 'before' );

	// Find first position that is just before a first:
	// * text node,
	// * BR element,
	// * block element,
	// * inline object element.
	// It's ignoring any inline (non-object) elements like span, strong, etc.
	position = position.getLastMatchingPosition( ( { item } ) => (
		!item.is( '$textProxy' ) &&
		!domConverter.isBlockViewElement( item ) &&
		!domConverter.isInlineObjectElement( item )
	), { direction } );

	return direction == 'forward' ? position.nodeAfter : position.nodeBefore;
}
