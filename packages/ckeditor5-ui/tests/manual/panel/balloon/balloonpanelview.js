/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';

const defaultPositions = BalloonPanelView.defaultPositions;
const container = document.querySelector( '#container' );
const headingRegex = /(w*)arrow\w*/i;

let currentHeading = '';

for ( const i in defaultPositions ) {
	const target = document.createElement( 'div' );
	const heading = document.createElement( 'h1' );
	const headingText = getCapitalizedHeading( i );

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

function getCapitalizedHeading( text ) {
	const headingText = text.replace( headingRegex, '$1' );
	const normalizedHeading = headingText.replace( /([a-z])([A-Z])/, '$1 $2' );
	const capitalizedText = normalizedHeading.charAt( 0 ).toUpperCase() + normalizedHeading.slice( 1 );

	return capitalizedText;
}
