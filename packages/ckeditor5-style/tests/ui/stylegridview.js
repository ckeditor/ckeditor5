/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewCollection } from '@ckeditor/ckeditor5-ui';
import { Locale, FocusTracker, KeystrokeHandler, keyCodes } from '@ckeditor/ckeditor5-utils';

import StyleGridButtonView from '../../src/ui/stylegridbuttonview.js';
import StyleGridView from '../../src/ui/stylegridview.js';

describe( 'StyleGridView', () => {
	let locale, grid;

	beforeEach( async () => {
		locale = new Locale();
		grid = new StyleGridView( locale, [
			{
				name: 'Red heading',
				element: 'h2',
				classes: [ 'red-heading' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: 'red-heading'
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			},
			{
				name: 'Large heading',
				element: 'h2',
				classes: [ 'large-heading' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: 'large-heading'
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			}
		] );
	} );

	afterEach( async () => {
		grid.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have #focusTracker', () => {
			expect( grid.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should have #keystrokes', () => {
			expect( grid.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should set #children', () => {
			expect( grid.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should set #activeStyles', () => {
			expect( grid.activeStyles ).to.deep.equal( [] );
		} );

		it( 'should set #enabledStyles', () => {
			expect( grid.enabledStyles ).to.deep.equal( [] );
		} );

		it( 'should delegate #execute from #children', () => {
			const spy = sinon.spy();

			grid.on( 'execute', spy );
			grid.children.first.fire( 'execute', 'foo' );

			sinon.assert.calledOnceWithExactly( spy, sinon.match.object, 'foo' );
		} );

		it( 'should create #children from style definitions', () => {
			for ( const child of grid.children ) {
				expect( child ).to.be.instanceOf( StyleGridButtonView );
			}

			expect( grid.children.map( ( { label } ) => label ) ).to.deep.equal( [ 'Red heading', 'Large heading' ] );
		} );

		it( 'should change #isOn state of #children depending on #activeStyles', () => {
			grid.activeStyles = [];

			expect( grid.children.map( ( { isOn } ) => isOn ) ).to.deep.equal( [ false, false ] );

			grid.activeStyles = [ 'Large heading' ];

			expect( grid.children.map( ( { isOn } ) => isOn ) ).to.deep.equal( [ false, true ] );
		} );

		it( 'should change #isEnabled state of #children depending on #enabledStyles', () => {
			grid.enabledStyles = [];

			expect( grid.children.map( ( { isEnabled } ) => isEnabled ) ).to.deep.equal( [ false, false ] );

			grid.enabledStyles = [ 'Large heading' ];

			expect( grid.children.map( ( { isEnabled } ) => isEnabled ) ).to.deep.equal( [ false, true ] );
		} );

		it( 'should be a <div>', () => {
			grid.render();

			expect( grid.element.tagName ).to.equal( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			grid.render();

			expect( grid.element.classList.contains( 'ck' ) ).to.be.true;
			expect( grid.element.classList.contains( 'ck-style-grid' ) ).to.be.true;
		} );

		it( 'should have a role attribute', () => {
			grid.render();

			expect( grid.element.getAttribute( 'role' ) ).to.equal( 'listbox' );
		} );

		it( 'should have children in DOM', () => {
			grid.render();

			expect( grid.element.firstChild ).to.equal( grid.children.first.element );
			expect( grid.element.lastChild ).to.equal( grid.children.last.element );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register styleGridView children elements in #focusTracker', () => {
			const grid = new StyleGridView( new Locale(), [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'red-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'large-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				}
			] );

			const spyView = sinon.spy( grid.focusTracker, 'add' );

			grid.render();

			sinon.assert.calledWithExactly( spyView.getCall( 0 ), grid.children.first.element );
			sinon.assert.calledWithExactly( spyView.getCall( 1 ), grid.children.last.element );

			grid.destroy();
		} );

		describe( 'keyboard navigation in the grid', () => {
			let grid;

			beforeEach( async () => {
				grid = new StyleGridView( locale, [
					{
						name: 'Red heading',
						element: 'h2',
						classes: [ 'red-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'red-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					},
					{
						name: 'Yellow heading',
						element: 'h2',
						classes: [ 'yellow-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'yellow-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					},
					{
						name: 'Green heading',
						element: 'h2',
						classes: [ 'green-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'green-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					},
					{
						name: 'Large heading',
						element: 'h2',
						classes: [ 'large-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'large-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					}
				] );

				grid.render();
			} );

			afterEach( async () => {
				grid.destroy();
			} );

			it( '"arrow right" should focus the next focusable style', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the first color button is focused.
				grid.focusTracker.isFocused = true;
				grid.focusTracker.focusedElement = grid.children.first.element;

				const spy = sinon.spy( grid.children.get( 1 ), 'focus' );

				grid.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( '"arrow down" should focus the focusable style in the second row', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the first color button is focused.
				grid.focusTracker.isFocused = true;
				grid.focusTracker.focusedElement = grid.children.first.element;

				const spy = sinon.spy( grid.children.get( 3 ), 'focus' );

				grid.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'starts listening for #keystrokes coming from the #element of the grid view', () => {
			const grid = new StyleGridView( locale, [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'red-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'large-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				}
			] );

			const spy = sinon.spy( grid.keystrokes, 'listenTo' );

			grid.render();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, grid.element );

			grid.destroy();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first style', () => {
			const spy = sinon.spy( grid.children.first, 'focus' );

			grid.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( grid.focusTracker, 'destroy' );

			grid.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( grid.keystrokes, 'destroy' );

			grid.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );
} );
