/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Set of utils related to keyboard support.
 *
 * @namespace engine.treeView.filler
 */

/**
 * @member {Object} engine.treeView.filler.BR_FILLER
 */
export const BR_FILLER = ( domDocument ) => {
	const fillerBr = domDocument.createElement( 'br' );
	fillerBr.dataset.filler = true;

	return fillerBr;
};

export const NBSP_FILLER = ( domDocument ) => domDocument.createTextNode( '&nbsp;' );

export const INLINE_FILLER_LENGTH = 7;

export let INLINE_FILLER = '';

for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
	INLINE_FILLER += '\u200b';
}

export function startsWithFiller( domText ) {
	return ( domText.data.substr( 0, INLINE_FILLER_LENGTH ) === INLINE_FILLER );
}

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

const templateBlockFillers = new WeakMap();

export function isBlockFiller( domNode, blockFiller ) {
	let templateBlockFiller = templateBlockFillers.get( blockFiller );

	if ( !templateBlockFiller ) {
		templateBlockFiller = blockFiller( window.document );
		templateBlockFillers.set( blockFiller, templateBlockFiller );
	}

	return domNode.isEqualNode( templateBlockFiller );
}
