/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';
import '@ckeditor/ckeditor5-theme-lark/theme/theme.scss';

const defaultPositions = BalloonPanelView.defaultPositions;
const container = document.querySelector( '#container' );

for ( const i in defaultPositions ) {
	const target = document.createElement( 'div' );
	target.classList.add( 'target' );
	container.appendChild( target );

	const balloon = new BalloonPanelView();
	balloon.element.textContent = i;
	document.body.appendChild( balloon.element );

	balloon.attachTo( {
		target,
		positions: [
			defaultPositions[ i ]
		]
	} );
}
