/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event */

import ColorTableView from './../../src/ui/colortableview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ColorTileView from '@ckeditor/ckeditor5-ui/src/colorgrid/colortileview';

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
			removeButtonLabel: 'Remove color',
			documentColorsLabel: 'Document colors',
			documentColorsCount: 4
		} );
		colorTableView.render();
	} );

	afterEach( () => {
		colorTableView.destroy();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'creates items collection', () => {
			expect( colorTableView.items ).to.be.instanceOf( ViewCollection );
		} );

		it( 'store color definitions', () => {
			expect( colorTableView.colorDefinitions ).to.be.instanceOf( Array );
			expect( colorTableView.colorDefinitions ).to.deep.equal( colorDefinitions );
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

		it( 'sets tooltip for the document colors section', () => {
			expect( colorTableView.documentColorsLabel ).to.equal( 'Document colors' );
		} );

		it( 'sets number of drawn columns', () => {
			expect( colorTableView.columns ).to.equal( 5 );
		} );

		it( 'creates collection of document colors', () => {
			expect( colorTableView.documentColors ).to.be.instanceOf( Collection );
		} );

		it( 'sets maximum numbero of document colors', () => {
			expect( colorTableView.documentColorsCount ).to.equal( 4 );
		} );

		it( 'creates focus cycler', () => {
			expect( colorTableView._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'has correct class', () => {
			expect( colorTableView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( colorTableView.element.classList.contains( 'ck-color-table' ) ).to.be.true;
		} );

		it( 'has correct amount of children', () => {
			expect( colorTableView.items.length ).to.equal( 3 );
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
					options: {
						hasBorder: item.options.hasBorder
					}
				} );
			} );
		} );
	} );

	describe( 'document colors', () => {
		const colorBlack = {
			color: '#000000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		};
		const colorWhite = {
			color: '#FFFFFF',
			label: 'Black',
			options: {
				hasBorder: true
			}
		};
		const colorRed = {
			color: 'rgb(255,0,0)',
			options: {
				hasBorder: false
			}
		};
		const colorEmpty = {
			color: 'hsla(0,0%,0%,0)',
			options: {
				isEnabled: false,
				hasBorder: true
			}
		};
		describe( 'default checks', () => {
			let documentColorsGridView, documentColors;

			beforeEach( () => {
				documentColors = colorTableView.documentColors;
				documentColorsGridView = colorTableView.items.last;
			} );

			describe( 'model manipulation', () => {
				it( 'adding items works properly', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 1 );
					expect( documentColors.first.color ).to.equal( '#000000' );
					expect( documentColors.first.label ).to.equal( 'Black' );
					expect( documentColors.first.options.hasBorder ).to.be.false;
				} );

				it( 'adding multiple times same color should not populate items collection', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).to.own.include( colorBlack );
					expect( documentColors.length ).to.equal( 1 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).to.own.include( colorBlack );
					expect( documentColors.length ).to.equal( 1 );
				} );

				it( 'adding duplicated colors don\'t add it to model', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColors.add( Object.assign( {}, colorWhite ) );
					documentColors.add( Object.assign( {}, colorRed ) );

					expect( documentColors.length ).to.equal( 3 );
					expect( documentColors.get( 0 ) ).to.own.include( colorBlack );
					expect( documentColors.get( 1 ) ).to.own.include( colorWhite );
					expect( documentColors.get( 2 ) ).to.own.include( colorRed );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 3 );
					expect( documentColors.get( 0 ) ).to.own.include( colorBlack );
					expect( documentColors.get( 1 ) ).to.own.include( colorWhite );
					expect( documentColors.get( 2 ) ).to.own.include( colorRed );
				} );

				it( 'should correctly add disabled colors', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorEmpty ) );

					expect( documentColors.length ).to.equal( 1 );
					expect( documentColors.first.color ).to.equal( 'hsla(0,0%,0%,0)' );
					expect( documentColors.first.options.hasBorder ).to.be.true;
					expect( documentColors.first.options.isEnabled ).to.be.false;
				} );
			} );

			describe( 'events', () => {
				it( 'added colors delegates execute to parent', () => {
					const spy = sinon.spy();
					colorTableView.on( 'execute', spy );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColorsGridView.items.first.element.dispatchEvent( new Event( 'click' ) );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWith( spy, sinon.match.any, {
						value: '#000000',
						label: 'Black',
						options: {
							hasBorder: false
						}
					} );
				} );
			} );

			describe( 'binding', () => {
				it( 'add tile item when document colors model is updated', () => {
					let itm;
					expect( documentColors.length ).to.equal( 0 );
					expect( documentColorsGridView.items.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 1 );

					expect( documentColorsGridView.items.length ).to.equal( 1 );

					itm = documentColorsGridView.items.first;
					expect( itm ).to.be.instanceOf( ColorTileView );
					expect( itm.label ).to.equal( 'Black' );
					expect( itm.color ).to.equal( '#000000' );
					expect( itm.hasBorder ).to.be.false;
					expect( itm.isEnabled ).to.be.true;

					documentColors.add( Object.assign( {}, colorEmpty ) );
					itm = documentColorsGridView.items.get( 1 );
					expect( itm ).to.be.instanceOf( ColorTileView );
					expect( itm.color ).to.equal( 'hsla(0,0%,0%,0)' );
					expect( itm.hasBorder ).to.be.true;
					expect( itm.isEnabled ).to.be.false;
				} );
			} );
		} );

		describe( 'empty', () => {
			let colorTableView;
			beforeEach( () => {
				locale = { t() {} };
				colorTableView = new ColorTableView( locale, {
					colors: colorDefinitions,
					columns: 5,
					removeButtonLabel: 'Remove color',
					documentColorsCount: 0
				} );
				colorTableView.render();
			} );

			afterEach( () => {
				colorTableView.destroy();
			} );

			it( 'should not add document colors grid to the view', () => {
				expect( colorTableView.items.length ).to.equal( 2 );
				expect( colorTableView.documentColors.length ).to.equal( 0 );
				expect( colorTableView.documentColorsCount ).to.equal( 0 );
			} );
		} );
	} );
} );
