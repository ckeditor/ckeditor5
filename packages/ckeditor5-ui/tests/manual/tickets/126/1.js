/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';

window.createPanel = selector => {
	const view = new BalloonPanelView();

	view.render();
	view.element.innerHTML = `Parent of this panel has position:${ selector }.`;

	document.querySelector( `#${ selector }-container` ).appendChild( view.element );

	view.attachTo( {
		target: document.querySelector( `#anchor-${ selector }` )
	} );
};
