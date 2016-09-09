/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import Text from '../engine/model/text.js';
import Range from '../engine/model/range.js';
import getSchemaValidRanges from '../core/command/helpers/getschemavalidranges.js';
import isAttributeAllowedInSelection from '../core/command/helpers/isattributeallowedinselection.js';
import findLinkRange from './findlinkrange.js';

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
		 * Currently selected `linkHref` attribute value.
		 *
		 * @observable
		 * @member {Boolean} core.command.ToggleAttributeCommand#value
		 */
		this.set( 'value', undefined );

		this.listenTo( this.editor.document.selection, 'change:attribute', () => {
			this.value = this.editor.document.selection.getAttribute( 'linkHref' );
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

		return isAttributeAllowedInSelection( 'linkHref', document.selection, document.schema );
	}

	/**
	 * Executes the command.
	 *
	 * When selection is non-collapsed, then `linkHref` attribute will be applied to nodes inside selection, but only to
	 * those nodes where `linkHref` attribute is allowed (disallowed nodes will be omitted).
	 *
	 * When selection is collapsed and is not inside text with `linkHref` attribute, then new {@link engine.model.Text Text node} with
	 * `linkHref` attribute will be inserted in place of caret, but only if such an element is allowed in this place. `_data` of
	 * the inserted text will equal `href` parameter. Selection will be updated to wrap just inserted text node.
	 *
	 * When selection is collapsed and inside text with `linkHref` attribute, the attribute value will be updated.
	 *
	 * @protected
	 * @param {String} href Link destination.
	 */
	_doExecute( href ) {
		const document = this.editor.document;
		const selection = document.selection;

		document.enqueueChanges( () => {
			// Keep it as one undo step.
			const batch = document.batch();

			// If selection is collapsed then update selected link or insert new one at the place of caret.
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();
				const parent = position.parent;

				// When selection is inside text with `linkHref` attribute.
				if ( selection.hasAttribute( 'linkHref' ) ) {
					// Then update `linkHref` value.
					const linkRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ) );

					batch.setAttribute( linkRange, 'linkHref', href );

					// Create new range wrapping changed link.
					selection.setRanges( [ linkRange ] );
				}
				// If not then insert text node with `linkHref` attribute in place of caret.
				else if ( document.schema.check( { name: '$text', attributes: 'linkHref', inside: parent.name } ) ) {
					const node = new Text( href, { linkHref: href } );

					batch.insert( position, node );

					// Create new range wrapping created node.
					selection.setRanges( [ Range.createOn( node ) ] );
				}
			} else {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where `linkHref` attribute is disallowed.
				const ranges = getSchemaValidRanges( 'linkHref', selection.getRanges(), document.schema );

				for ( let range of ranges ) {
					batch.setAttribute( range, 'linkHref', href );
				}
			}
		} );
	}
}
