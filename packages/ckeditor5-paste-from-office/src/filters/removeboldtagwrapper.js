/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/removeboldtagwrapper
 */

/**
 * Removes `<b>` tag wrapper added by Google Docs to a copied content.
 *
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment
 */
export default function removeBoldTagWrapper( { documentFragment, writer } ) {
	for ( const childWithWrapper of documentFragment.getChildren() ) {
		if ( childWithWrapper.is( 'b' ) && childWithWrapper.getStyle( 'font-weight' ) === 'normal' ) {
			const childIndex = documentFragment.getChildIndex( childWithWrapper );
			const removedElement = writer.remove( childWithWrapper )[ 0 ];

			writer.insertChild( childIndex, removedElement.getChildren(), documentFragment );
		}
	}
}
