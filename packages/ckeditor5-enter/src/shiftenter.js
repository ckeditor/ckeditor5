/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/shiftenter
 */

import ShiftEnterCommand from './shiftentercommand';
import EnterObserver from './enterobserver';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ShiftEnter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ShiftEnter';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const blockElements = editor.data.htmlProcessor.domConverter.blockElements;
		const inlineObjectElements = editor.data.htmlProcessor.domConverter.inlineObjectElements;

		// Configure the schema.
		schema.register( 'softBreak', {
			allowWhere: '$text',
			isInline: true
		} );

		// Configure converters.
		conversion.for( 'upcast' ).elementToElement( {
			view: 'br',
			model: ( viewElement, { writer, consumable } ) => {
				// Find view sibling nodes (threat inline elements as transparent, but not an inline objects):
				// <p><strong>foo[<br>]</strong></p>[<p>bar</p>]
				// <p><strong>foo[<br>]</strong></p>[]
				// <p><strong>foo[<br>]</strong>[bar]</p>
				// <p><strong>foo[<br>][bar]</strong></p>
				// <p>foo[<br>][<img/>]</p>
				const nextSibling = findSibling( viewElement, 'forward', view, { blockElements, inlineObjectElements } );
				const previousSibling = findSibling( viewElement, 'backward', view, { blockElements, inlineObjectElements } );

				const nextSiblingIsBlock = isBlockViewElement( nextSibling, blockElements );
				const previousSiblingIsBlock = isBlockViewElement( previousSibling, blockElements );

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

				const parentBlock = viewElement.findAncestor( node => blockElements.includes( node.name ) );

				// This element is the last in the current parent block so should be ignored (same as browser).
				// Cases:
				// * <p>[<br>]</p> -> <p>[]</p>
				// * <p>foo[<br>]</p> -> <p>foo[]</p>
				// * <p><span>foo[<br>]</span></p> -> <p><span>foo[]</span></p>
				if ( !nextSibling && parentBlock ) {
					consumable.consume( viewElement, { name: true } );

					return null;
				}

				// Ignore <br> that is followed by a block element (same as browser).
				// * foo[<br>]<p>bar</p> -> <p>foo[]</p><p>bar</p>
				if ( nextSiblingIsBlock ) {
					consumable.consume( viewElement, { name: true } );

					return null;
				}

				// Just convert a <br>.
				return writer.createElement( 'softBreak' );
			}
		} );

		conversion.for( 'downcast' ).elementToElement( {
			model: 'softBreak',
			view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
		} );

		view.addObserver( EnterObserver );

		editor.commands.add( 'shiftEnter', new ShiftEnterCommand( editor ) );

		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			data.preventDefault();

			// The hard enter key is handled by the Enter plugin.
			if ( !data.isSoft ) {
				return;
			}

			editor.execute( 'shiftEnter' );
			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}

// Returns sibling node, threats inline elements as transparent (but should stop on an inline objects).
function findSibling( viewElement, direction, view, { blockElements, inlineObjectElements } ) {
	let position = view.createPositionAt( viewElement, direction == 'forward' ? 'after' : 'before' );

	// Find first position that is just before a first:
	// * text node,
	// * BR element,
	// * block element,
	// * inline object element.
	// It's ignoring any inline (non-object) elements like span, strong, etc.
	position = position.getLastMatchingPosition( ( { item } ) => {
		return item.is( 'element' ) && item.name != 'br' &&
			!blockElements.includes( item.name ) && !inlineObjectElements.includes( item.name );
	}, { direction } );

	return direction == 'forward' ? position.nodeAfter : position.nodeBefore;
}

// Returns true for view elements that are listed as block view elements.
function isBlockViewElement( node, blockElements ) {
	return !!node && node.is( 'element' ) && blockElements.includes( node.name );
}
