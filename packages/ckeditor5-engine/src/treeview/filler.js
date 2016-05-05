/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Set of utils related to block and inline filler handling.
 *
 * Browsers do not allow to put caret in an element which does not have hight. Because of it, we need to fill all
 * empty elements which should be selectable with elements or characters called "fillers". Unfortunately there is no one
 * universal filler, this is why two types are uses:
 *
 * Block filler is an element which fill blocks, like `<p>`. CKEditor use `<br>` as a block filler during the editing,
 * as browsers do natively. So instead of empty `<p>` there will be `<p><br></p>`. The advantage of block filler is that
 * it is transparent for for selection, so when the caret is before the `<br>` and user press right arrow he will be
 * moved to the next paragraph, not after the `<br>`. The disadvantage is that it breaks a block, so it can not be used
 * in the middle of the text. {@link engine.treeView.filler.BR_FILLER <br> filler} can be replaced with any other
 * character in the data output, for instance {@link engine.treeView.filler.NBSP_FILLER non breaking space}.
 *
 * Inline filler is a filler which does not break text, so can be used inside the text, for instance in the empty
 * `<b>` surrendered by text: `foo<b></b>bar`, if we want to put caret there. CKEditor use a sequence of the zero width
 * spaces as a {@link engine.treeView.filler.INLINE_FILLER inline filler} having the predetermined
 * {@link engine.treeView.filler.INLINE_FILLER_LENGTH length}. The sequence is used, instead of the single character to
 * avoid threating random zero width spaces as an inline filler. Disadvantage of the inline filler is that it is not
 * transparent for the selection. The arrow key move the caret between zero with spaces characters, so the additional
 * code is needed to handle caret.
 *
 * Both inline and block fillers are handled by the {@link engine.treeView.renderer renderer} and are not present in the
 * view.
 *
 * @namespace engine.treeView.filler
 */

/**
 * Br filler creator. This is a function which creates `<br data-filler="true">` element, but should be understand as
 * configuration option more then used directly.
 *
 * @member {Function} engine.treeView.filler.BR_FILLER
 */
export const BR_FILLER = ( domDocument ) => {
	const fillerBr = domDocument.createElement( 'br' );
	fillerBr.dataset.filler = true;

	return fillerBr;
};

/**
 * Nbsp filler creator. This is a function which creates `&nbsp;` text node, but should be understand as
 * configuration option more then used directly.
 *
 * @member {Function} engine.treeView.filler.NBSP_FILLER_FILLER
 */
export const NBSP_FILLER = ( domDocument ) => domDocument.createTextNode( '&nbsp;' );

/**
 * Length of the {@link engine.treeView.filler.INLINE_FILLER INLINE_FILLER}.
 *
 * @member {Function} engine.treeView.filler.INLINE_FILLER_LENGTH
 */
export const INLINE_FILLER_LENGTH = 7;

/**
 * Inline filler which is sequence of the zero width spaces.
 *
 * @member {String} engine.treeView.filler.INLINE_FILLER
 */
export let INLINE_FILLER = '';

for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
	INLINE_FILLER += '\u200b';
}

/**
 * Check if text node starts with {@link engine.treeView.filler.INLINE_FILLER inline filler}.
 *
 *		startsWithFiller( document.createTextNode( INLINE_FILLER ) ); // true
 *		startsWithFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ); // true
 *		startsWithFiller( document.createTextNode( 'foo' ) ); // false
 *
 * @param {Text} domText DOM text node.
 * @returns {Boolean} True if text node starts with {@link engine.treeView.filler.INLINE_FILLER inline filler}.
 */
export function startsWithFiller( domText ) {
	return ( domText.data.substr( 0, INLINE_FILLER_LENGTH ) === INLINE_FILLER );
}

/**
 * Check if text node contains only {@link engine.treeView.filler.INLINE_FILLER inline filler}.
 *
 *		isInlineFiller( document.createTextNode( INLINE_FILLER ) ); // true
 *		isInlineFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ); // false
 *
 * @param {Text} domText DOM text node.
 * @returns {Boolean} True if text node contains only {@link engine.treeView.filler.INLINE_FILLER inline filler}.
 */
export function isInlineFiller( domText ) {
	return domText.data.length == INLINE_FILLER_LENGTH && startsWithFiller( domText );
}

export function getDataWithoutFiller( domText ) {
	if ( startsWithFiller( domText ) ) {
		return domText.data.slice( INLINE_FILLER_LENGTH );
	} else {
		return domText.data;
	}
}

// Cache block fillers templates to improve performance.
const templateBlockFillers = new WeakMap();

/**
 * Check if the node is an instance of the block filler of the given type.
 *
 *		const brFillerInstance = BR_FILLER( document );
 *		isBlockFiller( brFillerInstance, BR_FILLER ); // true
 *
 * @param {Node} domNode DOM node to check.
 * @param {Function} blockFiller Block filler creator.
 * @returns {Boolean} True if text node contains only {@link engine.treeView.filler.INLINE_FILLER inline filler}.
 */
export function isBlockFiller( domNode, blockFiller ) {
	let templateBlockFiller = templateBlockFillers.get( blockFiller );

	if ( !templateBlockFiller ) {
		templateBlockFiller = blockFiller( window.document );
		templateBlockFillers.set( blockFiller, templateBlockFiller );
	}

	return domNode.isEqualNode( templateBlockFiller );
}
