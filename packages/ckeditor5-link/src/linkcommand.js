/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import findLinkRange from './findlinkrange';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

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

	constructor( editor ) {
		super( editor );

		/**
		 * Keeps collection of {@link module:link/utils~ManualDecorator}
		 * recognized from {@link module:link/link~LinkConfig#decorators}.
		 * You can consider it as a model of states for custom attributes added to links.
		 *
		 * @readonly
		 * @type {module:utils/collection~Collection}
		 */
		this.customAttributes = new Collection();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( 'linkHref' );

		for ( const customAttr of this.customAttributes ) {
			customAttr.value = doc.selection.getAttribute( customAttr.id ) || false;
		}

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'linkHref' );
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
	execute( href, customAttrs = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		// Stores information about custom attributes to turn on/off.
		const truthyCustomAttributes = [];
		const falsyCustomAttributes = [];
		Object.entries( customAttrs ).forEach( entriesPair => {
			if ( entriesPair[ 1 ] ) {
				truthyCustomAttributes.push( entriesPair[ 0 ] );
			} else {
				falsyCustomAttributes.push( entriesPair[ 0 ] );
			}
		} );

		model.change( writer => {
			// If selection is collapsed then update selected link or insert new one at the place of caret.
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `linkHref` attribute.
				if ( selection.hasAttribute( 'linkHref' ) ) {
					// Then update `linkHref` value.
					const linkRange = findLinkRange( position, selection.getAttribute( 'linkHref' ), model );

					writer.setAttribute( 'linkHref', href, linkRange );
					truthyCustomAttributes.forEach( item => {
						writer.setAttribute( item, true, linkRange );
					} );
					falsyCustomAttributes.forEach( item => {
						writer.removeAttribute( item, linkRange );
					} );

					// Create new range wrapping changed link.
					writer.setSelection( linkRange );
				}
				// If not then insert text node with `linkHref` attribute in place of caret.
				// However, since selection in collapsed, attribute value will be used as data for text node.
				// So, if `href` is empty, do not create text node.
				else if ( href !== '' ) {
					const attributes = toMap( selection.getAttributes() );

					attributes.set( 'linkHref', href );

					truthyCustomAttributes.forEach( item => {
						attributes.set( item, true );
					} );

					const node = writer.createText( href, attributes );

					model.insertContent( node, position );

					// Create new range wrapping created node.
					writer.setSelection( writer.createRangeOn( node ) );
				}
			} else {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where `linkHref` attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'linkHref' );

				for ( const range of ranges ) {
					writer.setAttribute( 'linkHref', href, range );
					truthyCustomAttributes.forEach( item => {
						writer.setAttribute( item, true, range );
					} );
					falsyCustomAttributes.forEach( item => {
						writer.removeAttribute( item, range );
					} );
				}
			}
		} );
	}
}
