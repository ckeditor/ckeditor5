/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, window */

import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';

import '@ckeditor/ckeditor5-theme-lark/theme/theme.scss';

window.createPanel = selector => {
	const view = new BalloonPanelView();

	view.element.innerHTML = `Parent of this panel has position:${ selector }.`;
	view.init();

	document.querySelector( `#${ selector }-container` ).appendChild( view.element );

	view.attachTo( {
		target: document.querySelector( `#anchor-${ selector }` )
	} );
};
