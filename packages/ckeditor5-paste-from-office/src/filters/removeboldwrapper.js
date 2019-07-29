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
export default function removeBoldWrapper( documentFragment, writer ) {
	for ( const child of documentFragment.getChildren() ) {
		if ( child.is( 'b' ) && child.getStyle( 'font-weight' ) === 'normal' ) {
			const childIndex = documentFragment.getChildIndex( child );

			writer.remove( child );
			writer.insertChild( childIndex, child.getChildren(), documentFragment );
		}
	}
}
