/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/linkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Text from '@ckeditor/ckeditor5-engine/src/model/text';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import findLinkRange from './findlinkrange';

/**
 * The link command. It is used by the {@link module:link/link~Link link feature}.
 *
 * @extends module:core/command~Command
 */
export default class LinkCommand extends Command {
	/**
	 * The value of the `'linkHref'` attribute if the start of the selection is located in a node with this attribute.
	 *
	 * @observable
	 * @readonly
	 * @member {Object|undefined} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		const doc = this.editor.document;

		this.value = doc.selection.getAttribute( 'linkHref' );
		this.isEnabled = doc.schema.checkAttributeInSelection( doc.selection, 'linkHref' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is non-collapsed, the `linkHref` attribute will be applied to nodes inside the selection, but only to
	 * those nodes where the `linkHref` attribute is allowed (disallowed nodes will be omitted).
	 *
	 * When the selection is collapsed and is not inside the text with the `linkHref` attribute, the
	 * new {@link module:engine/model/text~Text Text node} with the `linkHref` attribute will be inserted in place of caret, but
	 * only if such element is allowed in this place. The `_data` of the inserted text will equal the `href` parameter.
	 * The selection will be updated to wrap the just inserted text node.
	 *
	 * When the selection is collapsed and inside the text with the `linkHref` attribute, the attribute value will be updated.
	 *
	 * @fires execute
	 * @param {String} href Link destination.
	 */
	execute( href ) {
		const doc = this.editor.document;
		const selection = doc.selection;

		doc.enqueueChanges( () => {
			// Keep it as one undo step.
			const batch = doc.batch();

			// If selection is collapsed then update selected link or insert new one at the place of caret.
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `linkHref` attribute.
				if ( selection.hasAttribute( 'linkHref' ) ) {
					// Then update `linkHref` value.
					const linkRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ) );

					batch.setAttribute( linkRange, 'linkHref', href );

					// Create new range wrapping changed link.
					selection.setRanges( [ linkRange ] );
				}
				// If not then insert text node with `linkHref` attribute in place of caret.
				else {
					const node = new Text( href, { linkHref: href } );

					batch.insert( position, node );

					// Create new range wrapping created node.
					selection.setRanges( [ Range.createOn( node ) ] );
				}
			} else {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where `linkHref` attribute is disallowed.
				const ranges = doc.schema.getValidRanges( selection.getRanges(), 'linkHref' );

				for ( const range of ranges ) {
					batch.setAttribute( range, 'linkHref', href );
				}
			}
		} );
	}
}
