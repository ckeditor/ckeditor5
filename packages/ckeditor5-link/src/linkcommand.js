/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import Text from '../engine/model/text.js';
import Range from '../engine/model/range.js';
import getSchemaValidRanges from '../core/command/helpers/getschemavalidranges.js';
import isAttributeAllowedInSelection from '../core/command/helpers/isattributeallowedinselection.js';

/**
 * The link command. It is used by the {@link Link.Link link feature}.
 *
 * @memberOf link
 * @extends core.command.Command
 */
export default class LinkCommand extends Command {
	/**
	 * @see core.command.Command
	 * @param {core.editor.Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Flag indicating whether command is active. For collapsed selection it means that typed characters will have
		 * the command's attribute set. For range selection it means that all nodes inside have the attribute applied.
		 *
		 * @observable
		 * @member {Boolean} core.command.ToggleAttributeCommand#value
		 */
		this.set( 'isValue', false );

		this.listenTo( this.editor.document.selection, 'change:attribute', () => {
			this.isValue = this.editor.document.selection.hasAttribute( 'link' );
		} );
	}

	/**
	 * Checks if {@link engine.model.Document#schema} allows to create attribute in {@link engine.model.Document#selection}
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	_checkEnabled() {
		const document = this.editor.document;

		return isAttributeAllowedInSelection( 'link', document.selection, document.schema );
	}

	/**
	 * Executes the command if it is enabled.
	 *
	 * When selection is not-collapsed then `link` attribute will be applied to nodes inside selection, but only to
	 * this nodes where `link` attribute is allowed (disallowed nodes will be omitted).
	 *
	 * When selection is collapsed then new {@link engine.model.Text Text node} with `link` attribute will be inserted
	 * in place of caret, but only if such an element is allowed in this place. _data of inserted text will be equal
	 * to `href` parameter. Selection will be updated to wrap just inserted text node.
	 *
	 * @private
	 * @param {String} href Link destination.
	 */
	_doExecute( href ) {
		const document = this.editor.document;
		const selection = document.selection;

		document.enqueueChanges( () => {
			// Keep it as one undo step.
			const batch = document.batch();

			if ( selection.isCollapsed ) {
				const ranges = selection.getRanges();
				const updatedRanges = [];

				for ( let range of ranges ) {
					// Get parent of current selection position.
					const parent = range.start.parent;

					// Insert Text node with link attribute if is allowed in parent.
					if ( document.schema.check( { name: '$text', attributes: 'link', inside: parent.name } ) ) {
						const node = new Text( href, { link: href } );

						batch.insert( range.start, node );
						// Create new range wrapping just created node.
						updatedRanges.push( Range.createOn( node ) );
					}
				}

				// Update selection.
				// If there is no updatedRanges it means that each insertion was disallowed.
				if ( updatedRanges.length ) {
					selection.setRanges( updatedRanges, selection.isBackward );
					selection.setAttribute( 'link', href );
				}
			} else {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where `link` attribute is disallowed.
				const ranges = getSchemaValidRanges( 'link', selection.getRanges(), document.schema );

				for ( let range of ranges ) {
					batch.setAttribute( range, 'link', href );
				}
			}
		} );
	}
}
