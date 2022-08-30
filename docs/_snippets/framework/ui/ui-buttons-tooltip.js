/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, ButtonView */

const tooltip1 = new ButtonView();
tooltip1.set( {
	label: 'South',
	withText: true,
	tooltip: 'The content of the tooltip'
} );

tooltip1.render();
document.getElementById( 'tooltip1' ).append( tooltip1.element );

const tooltip2 = new ButtonView();
tooltip2.set( {
	label: 'North',
	withText: true,
	tooltip: true,
	tooltipPosition: 'n'
} );

tooltip2.render();
document.getElementById( 'tooltip2' ).append( tooltip2.element );

const tooltip3 = new ButtonView();
tooltip3.set( {
	label: 'West',
	withText: true,
	tooltip: true,
	tooltipPosition: 'w'
} );
tooltip3.render();
document.getElementById( 'tooltip3' ).append( tooltip3.element );

const tooltip4 = new ButtonView();
tooltip4.set( {
	label: 'East',
	withText: true,
	tooltip: true,
	tooltipPosition: 'e'
} );
tooltip4.render();
document.getElementById( 'tooltip4' ).append( tooltip4.element );

const tooltip5 = new ButtonView();
tooltip5.set( {
	label: 'South East',
	withText: true,
	tooltip: true,
	tooltipPosition: 'se'
} );
tooltip5.render();
document.getElementById( 'tooltip5' ).append( tooltip5.element );

const tooltip6 = new ButtonView();
tooltip6.set( {
	label: 'South West',
	withText: true,
	tooltip: true,
	tooltipPosition: 'sw'
} );

tooltip6.render();
document.getElementById( 'tooltip6' ).append( tooltip6.element );
