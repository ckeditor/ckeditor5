/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/common
 */

/**
 * The filter removes `<b>` tag wrapper added by Google Docs for copied content.
 *
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment
 * @returns {module:engine/view/documentfragment~DocumentFragment}
 */
export function removeBoldTagWrapper( documentFragment ) {
	const firstChild = documentFragment.getChild( 0 );

	if ( firstChild && firstChild.is( 'b' ) && firstChild.getStyle( 'font-weight' ) === 'normal' ) {
		const children = firstChild.getChildren();

		documentFragment._removeChildren( 0 );
		documentFragment._insertChild( 0, children );
	}

	return documentFragment;
}
