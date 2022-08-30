/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, coreIcons, IconView */

const icon1 = new IconView();
icon1.content = coreIcons.image;

icon1.render();

document.getElementById( 'icon-1' ).appendChild( icon1.element );

const icon2 = new IconView();
icon2.content = coreIcons.eraser;

icon2.render();

document.getElementById( 'icon-2' ).appendChild( icon2.element );

const iconColor1 = new IconView();
iconColor1.content = coreIcons.image;

iconColor1.render();

document.getElementById( 'icon-color-1' ).appendChild( iconColor1.element );

const iconColor2 = new IconView();
iconColor2.content = coreIcons.eraser;

iconColor2.render();

document.getElementById( 'icon-color-2' ).appendChild( iconColor2.element );
