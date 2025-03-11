/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BalloonPanelView, ButtonView } from 'ckeditor5';

const balloonButton = new ButtonView();
balloonButton.set( { label: 'Balloon button', withText: true } );
balloonButton.render();

const balloon = new BalloonPanelView();
balloon.render();
balloon.content.add( balloonButton );

document.body.append( balloon.element );

balloon.pin( {
	target: document.querySelector( '.ui-balloon' ),
	positions: [ BalloonPanelView.defaultPositions.northArrowSouth ]
} );

document.body.classList.add( 'ck' );
document.body.setAttribute( 'dir', 'ltr' );
