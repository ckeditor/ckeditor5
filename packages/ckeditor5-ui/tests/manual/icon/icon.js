/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import IconView from '../../../src/icon/iconview';
import testUtils from '../../_utils/utils';

const icon = `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
	<path d="M2 14.994C2 16.102 2.895 17 3.994 17h12.012A2 2 0 0 0 18 14.994V5.006A2.001 2.001 0 0 0
	16.006 3H3.994A2 2 0 0 0 2 5.006v9.988zm1-9.992C3 4.45 3.45 4 4.007 4h11.986A1.01 1.01 0 0 1 17
	5.002v9.996C17 15.55 16.55 16 15.993 16H4.007A1.01 1.01 0 0 1 3 14.998V5.002zm1.024
	10H16v-3.096l-2.89-4.263-3.096 5.257-3.003-2.103L4 13.96l.024 1.043zM6.406 6A1.4 1.4 0 0 0 5
	7.393a1.4 1.4 0 0 0 1.406 1.393 1.4 1.4 0 0 0 1.407-1.393A1.4 1.4 0 0 0 6.406 6z"
	fill-rule="evenodd"/>
</svg>`;

const iconDirty = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
	<title>Title</title>
	<desc>Desc</desc>
	<path d="M2 14.994C2 16.102 2.895 17 3.994 17h12.012A2 2 0 0 0 18 14.994V5.006A2.001 2.001 0 0 0
	16.006 3H3.994A2 2 0 0 0 2 5.006v9.988zm1-9.992C3 4.45 3.45 4 4.007 4h11.986A1.01 1.01 0 0 1 17
	5.002v9.996C17 15.55 16.55 16 15.993 16H4.007A1.01 1.01 0 0 1 3 14.998V5.002zm1.024
	10H16v-3.096l-2.89-4.263-3.096 5.257-3.003-2.103L4 13.96l.024 1.043zM6.406 6A1.4 1.4 0 0 0 5
	7.393a1.4 1.4 0 0 0 1.406 1.393 1.4 1.4 0 0 0 1.407-1.393A1.4 1.4 0 0 0 6.406 6z"
	fill-rule="evenodd"/>
</svg>`;

const iconViewBox = `<svg viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg">
<path d="M3.5 26.24c0 1.939 1.566 3.51 3.49 3.51h21.02a3.5 3.5 0 0 0 3.49-3.51V8.76a3.502 3.502 0 0
0-3.49-3.51H6.99A3.5 3.5 0 0 0 3.5 8.76v17.48zM5.25 8.753C5.25 7.787 6.038 7 7.012 7h20.976a1.767 1.767 0 0
1 1.762 1.753v17.494c0 .965-.788 1.753-1.762 1.753H7.012a1.767 1.767 0 0 1-1.762-1.753V8.753zm1.792
17.5H28v-5.419l-5.058-7.46-5.418 9.2-5.255-3.68L7 24.43l.042 1.825v-.002zM11.21 10.5a2.45 2.45 0 0 0-2.46
2.438 2.45 2.45 0 0 0 2.46 2.438 2.45 2.45 0 0 0 2.463-2.438A2.45 2.45 0 0 0 11.21 10.5z"
fill-rule="evenodd"/></svg>`;

const ui = testUtils.createTestUIView( {
	'icon20': '#icon20',
	'icon40': '#icon40',
	'icon60': '#icon60',
	'iconRed': '#icon-red',
	'iconBlueInherited': '#icon-blue-inherited',
	'iconDirty': '#icon-dirty',
	'iconViewBox': '#icon-view-box'
} );

ui.icon20.add( getIcon( icon, 20 ) );
ui.icon40.add( getIcon( icon, 40 ) );
ui.icon60.add( getIcon( icon, 60 ) );

ui.iconRed.add( getIcon( icon, 20, 'red' ) );
ui.iconBlueInherited.add( getIcon( icon, 20 ) );

ui.iconDirty.add( getIcon( iconDirty, 100, 'green' ) );
ui.iconViewBox.add( getIcon( iconViewBox, 100, 'green' ) );

function getIcon( content, size, color ) {
	const iconView = new IconView();

	iconView.render();
	iconView.content = content;

	if ( size ) {
		iconView.element.style.width = `${ size }px`;
		iconView.element.style.height = `${ size }px`;
	}

	if ( color ) {
		iconView.element.style.color = color;
	}

	return iconView;
}
