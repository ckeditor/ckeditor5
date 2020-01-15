/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';

const defaultPositions = BalloonPanelView.defaultPositions;
const container = document.querySelector( '#container' );

for ( const i in defaultPositions ) {
	const target = document.createElement( 'div' );
	target.classList.add( 'target' );
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
