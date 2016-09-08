/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, balloonPanel */

import LinkBalloonPanelView from '/ckeditor5/link/ui/linkballoonpanelview.js';
import BalloonPanelView from '/ckeditor5/ui/balloonpanel/balloonpanelview.js';

describe( 'LinkBalloonPanelView', () => {
	let view;

	beforeEach( () => {
		view = new LinkBalloonPanelView();
	} );

	describe( 'constructor', () => {
		it( 'should extend BalloonPanelView class', () => {
			expect( view ).to.be.instanceof( BalloonPanelView );
		} );

		it( 'should extend BalloonPanel element by additional class', () => {
			expect( view.element.classList.contains( 'ck-link-balloon-panel' ) ).to.be.true;
		} );
	} );
} );
