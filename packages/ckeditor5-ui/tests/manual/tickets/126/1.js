/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, window */

import BalloonPanelView from 'ckeditor5-ui/src/balloonpanel/balloonpanelview';

window.createPanel = ( selector ) => {
	const view = new BalloonPanelView();

	view.element.innerHTML = `Parent of this panel has position:${ selector }.`;
	view.init().then( () => {
		document.querySelector( `#${ selector }-container` ).appendChild( view.element );

		view.attachTo( {
			target: document.querySelector( `#anchor-${ selector }` )
		} );
	} );
};
