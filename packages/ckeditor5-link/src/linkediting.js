/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/linkediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	downcastAttributeToElement
} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import LinkCommand from './linkcommand';
import UnlinkCommand from './unlinkcommand';
import { createLinkElement } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findLinkRange from './findlinkrange';
import '../theme/link.css';

const HIGHLIGHT_CLASSES = [ 'ck', 'ck-link_selected' ];

/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow link attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'linkHref' } );

		editor.conversion.for( 'downcast' )
			.add( downcastAttributeToElement( { model: 'linkHref', view: createLinkElement } ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( {
				view: {
					name: 'a',
					attributes: {
						href: true
					}
				},
				model: {
					key: 'linkHref',
					value: viewElement => viewElement.getAttribute( 'href' )
				}
			} ) );

		// Create linking commands.
		editor.commands.add( 'link', new LinkCommand( editor ) );
		editor.commands.add( 'unlink', new UnlinkCommand( editor ) );

		// Enable two-step caret movement for `linkHref` attribute.
		bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'linkHref' );

		// Setup highlight over selected link.
		this._setupLinkHighlight();
	}

	/**
	 * Adds the visual highlight style to a link in which the selection is anchored.
	 * Together with two-step caret movement, it indicates the user is typing inside the link.
	 *
	 * The current implementation adds the `.ck .ck-link_selected` classes to the link in the view
	 * in the following way:
	 * * The classes are removed in the downcast dispatcher's chain with the highest possible
	 * priority so they don't interfere during further conversion.
	 * * The classes are added in the view post fixer, which is the last one to execute in
	 * the {@link module:engine/view/view~View#change}.
	 *
	 * @private
	 */
	_setupLinkHighlight() {
		const editor = this.editor;
		const view = editor.editing.view;
		const highlightedLinks = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const selection = editor.model.document.selection;

			if ( selection.hasAttribute( 'linkHref' ) ) {
				const modelRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ) );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );

				for ( const item of viewRange.getItems() ) {
					if ( item.is( 'a' ) ) {
						writer.addClass( HIGHLIGHT_CLASSES, item );
						highlightedLinks.add( item );
					}
				}
			}
		} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );
		} );

		// Removing the class.
		function removeHighlight() {
			view.change( writer => {
				for ( const item of highlightedLinks.values() ) {
					writer.removeClass( HIGHLIGHT_CLASSES, item );
					highlightedLinks.delete( item );
				}
			} );
		}
	}
}
