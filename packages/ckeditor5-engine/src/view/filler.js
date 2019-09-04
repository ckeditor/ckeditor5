/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import isText from '@ckeditor/ckeditor5-utils/src/dom/istext';

/**
 * Set of utils related to block and inline fillers handling.
 *
 * Browsers do not allow to put caret in elements which does not have height. Because of it, we need to fill all
 * empty elements which should be selectable with elements or characters called "fillers". Unfortunately there is no one
 * universal filler, this is why two types are uses:
 *
 * * Block filler is an element which fill block elements, like `<p>`. CKEditor uses `<br>` as a block filler during the editing,
 * as browsers do natively. So instead of an empty `<p>` there will be `<p><br></p>`. The advantage of block filler is that
 * it is transparent for the selection, so when the caret is before the `<br>` and user presses right arrow he will be
 * moved to the next paragraph, not after the `<br>`. The disadvantage is that it breaks a block, so it can not be used
 * in the middle of a line of text. The {@link module:engine/view/filler~BR_FILLER `<br>` filler} can be replaced with any other
 * character in the data output, for instance {@link module:engine/view/filler~NBSP_FILLER non-breaking space}.
 *
 * * Inline filler is a filler which does not break a line of text, so it can be used inside the text, for instance in the empty
 * `<b>` surrendered by text: `foo<b></b>bar`, if we want to put the caret there. CKEditor uses a sequence of the zero-width
 * spaces as an {@link module:engine/view/filler~INLINE_FILLER inline filler} having the predetermined
 * {@link module:engine/view/filler~INLINE_FILLER_LENGTH length}. A sequence is used, instead of a single character to
 * avoid treating random zero-width spaces as the inline filler. Disadvantage of the inline filler is that it is not
 * transparent for the selection. The arrow key moves the caret between zero-width spaces characters, so the additional
 * code is needed to handle the caret.
 *
 * Both inline and block fillers are handled by the {@link module:engine/view/renderer~Renderer renderer} and are not present in the
 * view.
 *
 * @module engine/view/filler
 */

/**
 * `<br>` filler creator. This is a function which creates `<br data-cke-filler="true">` element.
 * It defines how the filler is created.
 *
 * @see module:engine/view/filler~NBSP_FILLER
 * @function
 */
export const BR_FILLER = domDocument => {
	const fillerBr = domDocument.createElement( 'br' );
	fillerBr.dataset.ckeFiller = true;

	return fillerBr;
};

// eslint-disable-next-line new-cap
const BR_FILLER_REF = BR_FILLER( window.document );

/**
 * Non-breaking space filler creator. This is a function which creates `&nbsp;` text node.
 * It defines how the filler is created.
 *
 * @see module:engine/view/filler~BR_FILLER
 * @function
 */
export const NBSP_FILLER = domDocument => domDocument.createTextNode( '\u00A0' );

/**
 * Length of the {@link module:engine/view/filler~INLINE_FILLER INLINE_FILLER}.
 */
export const INLINE_FILLER_LENGTH = 7;

/**
 * Inline filler which is sequence of the zero width spaces.
 */
export let INLINE_FILLER = '';

for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
	INLINE_FILLER += '\u200b';
}

/**
 * Checks if the node is a text node which starts with the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 *
 *		startsWithFiller( document.createTextNode( INLINE_FILLER ) ); // true
 *		startsWithFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ); // true
 *		startsWithFiller( document.createTextNode( 'foo' ) ); // false
 *		startsWithFiller( document.createElement( 'p' ) ); // false
 *
 * @param {Node} domNode DOM node.
 * @returns {Boolean} True if the text node starts with the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 */
export function startsWithFiller( domNode ) {
	return isText( domNode ) && ( domNode.data.substr( 0, INLINE_FILLER_LENGTH ) === INLINE_FILLER );
}

/**
 * Checks if the text node contains only the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 *
 *		isInlineFiller( document.createTextNode( INLINE_FILLER ) ); // true
 *		isInlineFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ); // false
 *
 * @param {Text} domText DOM text node.
 * @returns {Boolean} True if the text node contains only the {@link module:engine/view/filler~INLINE_FILLER inline filler}.
 */
export function isInlineFiller( domText ) {
	return domText.data.length == INLINE_FILLER_LENGTH && startsWithFiller( domText );
}

/**
 * Get string data from the text node, removing an {@link module:engine/view/filler~INLINE_FILLER inline filler} from it,
 * if text node contains it.
 *
 *		getDataWithoutFiller( document.createTextNode( INLINE_FILLER + 'foo' ) ) == 'foo' // true
 *		getDataWithoutFiller( document.createTextNode( 'foo' ) ) == 'foo' // true
 *
 * @param {Text} domText DOM text node, possible with inline filler.
 * @returns {String} Data without filler.
 */
export function getDataWithoutFiller( domText ) {
	if ( startsWithFiller( domText ) ) {
		return domText.data.slice( INLINE_FILLER_LENGTH );
	} else {
		return domText.data;
	}
}

/**
 * Checks if the node is an instance of the block filler of the given type.
 *
 *		const brFillerInstance = BR_FILLER( document );
 *		isBlockFiller( brFillerInstance, 'br' ); // true
 *		isBlockFiller( brFillerInstance, 'nbsp' ); // false
 *
 * **Note:**: For 'nbsp' mode the method also checks context of a node so it cannot be a detached node.
 *
 * @param {Node} domNode DOM node to check.
 * @param {module:engine/view/filler~blockFillerMode} mode Mode of a block filler.
 * @returns {Boolean} True if a node is considered a block filler for given mode.
 */
export function isBlockFiller( domNode, mode ) {
	return mode == 'br' ? domNode.isEqualNode( BR_FILLER_REF ) : isNbspBlockFiller( domNode );
}

/**
 * Assign key observer which move cursor from the end of the inline filler to the beginning of it when
 * the left arrow is pressed, so the filler does not break navigation.
 *
 * @param {module:engine/view/view~View} view View controller instance we should inject quirks handling on.
 */
export function injectQuirksHandling( view ) {
	view.document.on( 'keydown', jumpOverInlineFiller );
}

// Move cursor from the end of the inline filler to the beginning of it when, so the filler does not break navigation.
function jumpOverInlineFiller( evt, data ) {
	if ( data.keyCode == keyCodes.arrowleft ) {
		const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

		if ( domSelection.rangeCount == 1 && domSelection.getRangeAt( 0 ).collapsed ) {
			const domParent = domSelection.getRangeAt( 0 ).startContainer;
			const domOffset = domSelection.getRangeAt( 0 ).startOffset;

			if ( startsWithFiller( domParent ) && domOffset <= INLINE_FILLER_LENGTH ) {
				domSelection.collapse( domParent, 0 );
			}
		}
	}
}

// Checks if given node is a nbsp block filler.
//
// A &nbsp; is a block filler only if it is a single child of a block element.
//
// @param {Node} domNode DOM node.
// @returns {Boolean}
function isNbspBlockFiller( domNode ) {
	const isNBSP = isText( domNode ) && domNode.data == '\u00A0';

	return isNBSP && hasBlockParent( domNode ) && domNode.parentNode.childNodes.length === 1;
}

// Name of DOM nodes that are considered a block.
const blockElements = [ 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

// Checks if domNode has block parent.
//
// @param {Node} domNode DOM node.
// @returns {Boolean}
function hasBlockParent( domNode ) {
	const parent = domNode.parentNode;

	return parent && parent.tagName && blockElements.includes( parent.tagName.toLowerCase() );
}

/**
 * Enum representing type of the block filler.
 *
 * Possible values:
 *
 * * `br` - for `<br>` block filler used in editing view,
 * * `nbsp` - for `&nbsp;` block fillers used in the data.
 *
 * @typedef {String} module:engine/view/filler~blockFillerMode
 */
