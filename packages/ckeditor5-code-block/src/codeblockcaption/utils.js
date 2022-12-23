/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblockcaption/utils
 */

/**
 *
 * @param {module:engine/model/element~Element} modelElement Element to check if it is a codeblock wrapper
 * @returns {Boolean}
 */
export function isCodeblockWrapper( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'codeBlock' );
}

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption for codeblock.
 * Example format for codeblock caption is like below.
 *
 * `<pre>
 *	  <code>
 *		  some codes here
 *	  </code>
 *	  <figcaption>
 *		  some caption is here
 *	  </figcaption>
 * </pre>`
 *
 * @param {module:engine/view/element~Element} element
 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
 * cannot be matched.
 */
export function matchCodeblockCaptionViewElement( element ) {
	const parent = element.parent;

	if ( element.name == 'figcaption' && parent && parent.name == 'code' ) {
		return { name: true };
	}

	return null;
}

/**
 * It returns codeblock-caption node inside codeblockModelElement or `null` if there is no caption node inside modelElement.
 * @param {module:engine/model/element~Element} codeblockModelElement
 * @returns {module:engine/model/node~Node|null}
 */
export function getCaptionFromCodeblockModelElement( codeblockModelElement ) {
	for ( const node of codeblockModelElement.getChildren() ) {
		if ( !!node && node.is( 'element', 'caption' ) ) {
			return node;
		}
	}

	return null;
}

/**
 * It returns codeblock caption inside selected codeblock element or `null` if there is no
 * codeblock caption in selection scope.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {module:engine/model/element~Element|null}
 */
export function getCodeblockCaptionFromModelSelection( selection ) {
	const codeblockElement = selection.getFirstPosition().findAncestor( 'codeBlock' );

	if ( !codeblockElement ) {
		return null;
	}

	return getCaptionFromCodeblockModelElement( codeblockElement );
}

/**
 * It returns if the selection is placed inside codeblock caption or not.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {Boolean}
 */
export function isInsideCodeblockCaptionFromSelection( selection ) {
	const captionElement = selection.getFirstPosition().findAncestor( 'caption' );

	if ( !captionElement ) {
		return false;
	}

	return isCodeblockWrapper( captionElement.parent );
}
