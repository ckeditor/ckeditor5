/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, ButtonView, BalloonPanelView */

const balloon = new BalloonPanelView();

const buttonBalloon = new ButtonView();
buttonBalloon.label = 'Balloon panel';
buttonBalloon.withText = true;
buttonBalloon.render();
balloon.render();

balloon.content.add( buttonBalloon );

const positions = BalloonPanelView.defaultPositions;

balloon.pin( {
	target: document.getElementById( 'ui-balloon' ),
	positions: [
		positions.southArrowNorth
	]
} );
document.getElementById( 'ui-balloon' ).append( balloon.element );
