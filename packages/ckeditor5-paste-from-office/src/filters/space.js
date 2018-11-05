/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/space
 */

/**
 * Replaces last space preceding elements closing tag with `&nbsp;`. Such operation prevents spaces from being removed
 * during further DOM/View processing (see especially {@link module:engine/view/domconverter~DomConverter#_processDataFromDomText}).
 * This method also takes into account Word specific `<o:p></o:p>` empty tags.
 *
 * @param {String} htmlString HTML string in which spacing should be normalized.
 * @returns {String} Input HTML with spaces normalized.
 */
export function normalizeEndTagsPrecedingSpace( htmlString ) {
	return htmlString
		.replace( / <\//g, '\u00A0</' )
		.replace( / <o:p><\/o:p>/g, '\u00A0<o:p></o:p>' );
}

/**
 * Normalizes spacing in special Word `spacerun spans` (`<span style='mso-spacerun:yes'>\s+</span>`) by replacing
 * all spaces with `&nbsp; ` pairs. This prevents spaces from being removed during further DOM/View processing
 * (see especially {@link module:engine/view/domconverter~DomConverter#_processDataFromDomText}).
 *
 * @param {Document} htmlDocument Native `Document` object in which spacing should be normalized.
 */
export function normalizeSpacerunSpans( htmlDocument ) {
	htmlDocument.querySelectorAll( 'span[style*=spacerun]' ).forEach( el => {
		// Use `el.childNodes[ 0 ].data.length` instead of `el.innerText.length`. For `el.innerText.length` which
		// contains spaces mixed with `&nbsp;` Edge browser returns incorrect length.
		const innerTextLength = el.childNodes[ 0 ].data.length;

		el.innerHTML = Array( innerTextLength + 1 ).join( '\u00A0 ' ).substr( 0, innerTextLength );
	} );
}
