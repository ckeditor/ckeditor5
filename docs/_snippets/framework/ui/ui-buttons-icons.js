/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ButtonView */

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

const keystrokeButton = new ButtonView();
keystrokeButton.set( {
	label: 'A button with a keystroke',
	withText: true,
	withKeystroke: true,
	keystroke: 'Ctrl+A'
} );
keystrokeButton.render();
document.getElementById( 'button-keystroke' ).append( keystrokeButton.element );

const iconButton = new ButtonView();
iconButton.set( {
	label: 'A button with an icon',
	withText: false,
	icon: checkIcon,
	class: 'ck-button-save',
	tooltip: true
} );
iconButton.render();
document.getElementById( 'button-icon' ).append( iconButton.element );

const iconKeystrokeButton = new ButtonView();
iconKeystrokeButton.set( {
	label: 'A button with an icon and a keystroke',
	icon: cancelIcon,
	keystroke: 'Esc',
	withKeystroke: true,
	class: 'ck-button-cancel',
	tooltip: true
} );

iconKeystrokeButton.render();
document.getElementById( 'button-keystroke-icon' ).append( iconKeystrokeButton.element );

