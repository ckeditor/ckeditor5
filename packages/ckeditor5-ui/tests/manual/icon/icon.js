/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import IconView from '../../../src/icon/iconview';

import '@ckeditor/ckeditor5-theme-lark/theme/theme.scss';

const wrapper = document.querySelector( '#inline-svg' );

const icon = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
    <!-- Generator: Sketch 3.5.2 (25235) - http://www.bohemiancoding.com/sketch -->
    <title>image</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <g id="image" sketch:type="MSArtboardGroup" fill="#454545">
            <g id="icon:image" sketch:type="MSLayerGroup" transform="translate(2.000000, 3.000000)">
                <path d="M0,11.9941413 C0,13.1019465 0.894513756,14 1.99406028,14 L14.0059397,14 C15.1072288,14 16,13.1029399 16,11.9941413
                 L16,2.00585866 C16,0.898053512 15.1054862,0 14.0059397,0 L1.99406028,0 C0.892771196,0 0,0.897060126 0,2.00585866
                 L0,11.9941413 Z M1,2.00247329 C1,1.44882258 1.44994876,1 2.00684547,1 L13.9931545,1 C14.5492199,1 15,1.45576096
                 15,2.00247329 L15,11.9975267 C15,12.5511774 14.5500512,13 13.9931545,13 L2.00684547,13 C1.45078007,13 1,12.544239
                 1,11.9975267 L1,2.00247329 Z M2.0237314,12.0028573 L14,12.0028573 L14,8.90598928 L11.1099289,4.64285714
                 L8.01350775,9.9000001 L5.01091767,7.79714291 L2,10.9601769 L2.0237314,12.0028573 Z M4.40625001,3 C3.62959688,3
                  3,3.62360071 3,4.39285714 C3,5.16210429 3.62959688,5.78571429 4.40625001,5.78571429 C5.18289376,5.78571429
                  5.81250002,5.16210429 5.81250002,4.39285714 C5.81250002,3.62360071 5.18289376,3 4.40625001,3 L4.40625001,3 Z"
                  id="path4700" sketch:type="MSShapeGroup"></path>
            </g>
        </g>
    </g>
</svg>`;

// Small.
addCase( renderIcon( icon, 20 ) );

// Medium.
addCase( renderIcon( icon, 40 ) );

// Large.
addCase( renderIcon( icon, 60 ) );

// Color.
addCase( renderIcon( icon, 60, 'red' ) );

// Inherited color.
const iconWrapper = document.createElement( 'p' );
iconWrapper.style.color = 'blue';
iconWrapper.appendChild( document.createTextNode( 'foo' ) );
iconWrapper.appendChild( renderIcon( icon, 60 ) );
iconWrapper.appendChild( document.createTextNode( 'bar' ) );
addCase( iconWrapper );

function renderIcon( content, size, color ) {
	const iconView = new IconView();

	iconView.content = content;
	iconView.init();

	if ( size ) {
		iconView.element.style.width = `${ size }px`;
		iconView.element.style.height = `${ size }px`;
	}

	if ( color ) {
		iconView.element.style.color = color;
	}

	return iconView.element;
}

function addCase( el ) {
	const item = document.createElement( 'li' );

	item.appendChild( el );

	wrapper.appendChild( item );
}
