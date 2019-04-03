/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import ColorTableView from './../../src/ui/colortableview';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ColorTableView', () => {
	let locale, colorTableView;

	const colorDefinitions = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		},
		{
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		},
		{
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];

	beforeEach( () => {
		locale = { t() {} };
		colorTableView = new ColorTableView( locale, {
			colors: colorDefinitions,
			columns: 5,
			removeButtonLabel: 'Remove color'
		} );
		colorTableView.render();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates items collection', () => {
			expect( colorTableView.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates focus tracker', () => {
			expect( colorTableView.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates keystroke handler', () => {
			expect( colorTableView.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates observable for selected color', () => {
			expect( colorTableView.selectedColor ).to.be.undefined;

			colorTableView.set( 'selectedColor', 'white' );

			expect( colorTableView.selectedColor ).to.equal( 'white' );
		} );

		it( 'sets tooltip for the remove color button', () => {
			expect( colorTableView.removeButtonLabel ).to.equal( 'Remove color' );
		} );

		it( 'sets number of drawed columns', () => {
			expect( colorTableView.columns ).to.equal( 5 );
		} );

		it( 'creates focus cycler', () => {
			expect( colorTableView._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'has proper class', () => {
			expect( colorTableView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( colorTableView.element.classList.contains( 'ck-color-table' ) ).to.be.true;
		} );
	} );

	describe( 'update elements in focus tracker', () => {
		it( 'focuses the tile in DOM', () => {
			const spy = sinon.spy( colorTableView._focusCycler, 'focusFirst' );

			colorTableView.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'focuses last the tile in DOM', () => {
			const spy = sinon.spy( colorTableView._focusCycler, 'focusLast' );

			colorTableView.focusLast();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'remove color button', () => {
		let removeButton;

		beforeEach( () => {
			removeButton = colorTableView.items.first;
		} );

		it( 'has proper class', () => {
			expect( removeButton.element.classList.contains( 'ck-color-table__remove-color' ) ).to.be.true;
		} );

		it( 'has proper setting', () => {
			expect( removeButton.withText ).to.be.true;
			expect( removeButton.icon ).to.equal( removeButtonIcon );
			expect( removeButton.tooltip ).to.be.true;
			expect( removeButton.label ).to.equal( 'Remove color' );
		} );

		it( 'executes event with "null" value', () => {
			const spy = sinon.spy();
			colorTableView.on( 'execute', spy );

			removeButton.element.dispatchEvent( new Event( 'click' ) );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, { value: null } );
		} );
	} );

	describe( 'static colors grid', () => {
		let staticColorTable;

		beforeEach( () => {
			staticColorTable = colorTableView.items.get( 1 );
		} );

		it( 'has added 3 children from definition', () => {
			expect( staticColorTable.items.length ).to.equal( 3 );
		} );

		it( 'binds #selectedColor to the table', () => {
			colorTableView.selectedColor = 'foo';
			expect( staticColorTable.selectedColor ).to.equal( 'foo' );

			colorTableView.selectedColor = 'bar';
			expect( staticColorTable.selectedColor ).to.equal( 'bar' );
		} );

		colorDefinitions.forEach( ( item, index ) => {
			it( `dispatch event to parent element for color: ${ item.color }`, () => {
				const spy = sinon.spy();
				colorTableView.on( 'execute', spy );

				staticColorTable.items.get( index ).element.dispatchEvent( new Event( 'click' ) );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, sinon.match.any, {
					value: item.color,
					label: item.label,
					hasBorder: item.options.hasBorder
				} );
			} );
		} );
	} );
} );
