/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';

const defaultPositions = BalloonPanelView.defaultPositions;
const container = document.querySelector( '#container' );

// It makes no sense to test the sticky position in this context,
// thus exclude it from this manual test.
delete defaultPositions.viewportStickyNorth;

let currentHeading = '';

for ( const i in defaultPositions ) {
	const target = document.createElement( 'div' );
	const heading = document.createElement( 'h1' );
	const headingText = parseHeadingText( i );

	heading.textContent = headingText;
	target.classList.add( 'target' );

	// Lazy heading
	if ( currentHeading !== headingText ) {
		container.appendChild( heading );
		currentHeading = headingText;
	}

	container.appendChild( target );

	const balloon = new BalloonPanelView();
	balloon.render();
	balloon.element.textContent = i;
	document.body.appendChild( balloon.element );

	balloon.attachTo( {
		target,
		positions: [
			defaultPositions[ i ]
		]
	} );
}

function parseHeadingText( text ) {
	const normalizedText = getNormalizeHeading( text );
	return getCapitalizedHeading( normalizedText );
}

// This helper function creates normalize heading text from a full name of the position,
// removing `ArrowXyz` part, like in the example:
// `southEastArrowNorthMiddleEast` -> `south East`.
function getNormalizeHeading( text ) {
	return text
		.replace( /(w*)arrow\w*/i, '$1' )
		.replace( /([a-z])([A-Z])/, '$1 $2' );
}

function getCapitalizedHeading( text ) {
	return text.charAt( 0 ).toUpperCase() + text.slice( 1 );
}
