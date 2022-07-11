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

		// Configure the schema.
		schema.register( 'softBreak', {
			allowWhere: '$text',
			isInline: true
		} );

		// Configure converters.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: 'br',
				model: ( viewElement, { writer } ) => {
					const nextSibling = viewElement.nextSibling;
					const previousSibling = viewElement.previousSibling;

					// This element is the last in the current parent block so should be ignored (same as browser).
					// Cases:
					// * <p><br></p> -> <p></p>
					// * <p>foo<br></p> -> <p>foo</p>
					//
					// Ignore cases when <br> is wrapped with an inline element:
					// * <p><span>foo<br></span></p>
					if ( !nextSibling && isBlockViewElement( viewElement.parent, blockElements ) ) {
						return null;
					}

					const nextSiblingIsBlock = isBlockViewElement( nextSibling, blockElements );
					const previousSiblingIsBlock = isBlockViewElement( previousSibling, blockElements );

					// If the <br> is surrounded by blocks then convert it to a paragraph:
					// * <p>foo</p><br><p>bar</p> -> <p>foo</p><p></p><p>bar</p>
					// * <br><p>foo</p><br> -> <p></p><p>foo</p><p></p>
					// * <br> -> <br>
					if (
						( previousSibling || nextSibling ) &&
						( !previousSibling || previousSiblingIsBlock ) &&
						( !nextSibling || nextSiblingIsBlock )
					) {
						return writer.createElement( 'paragraph' );
					}

					// There is a block element next to a <br>.
					if ( nextSiblingIsBlock ) {
						// Ignore <br> that is followed by a block element (same as browser).
						// * foo<br><p>bar</p> -> <p>foo</p><p>bar</p>
						return null;
					}

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

// Returns true for view elements that are listed as block view elements.
function isBlockViewElement( node, blockElements ) {
	return !!node && node.is( 'element' ) && blockElements.includes( node.name );
}
