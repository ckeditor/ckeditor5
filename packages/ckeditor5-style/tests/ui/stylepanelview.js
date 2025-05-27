/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler, Locale } from '@ckeditor/ckeditor5-utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

import StyleGroupView from '../../src/ui/stylegroupview.js';
import StylePanelView from '../../src/ui/stylepanelview.js';

describe( 'StylePanelView', () => {
	let locale, panel;

	beforeEach( async () => {
		locale = new Locale();
		panel = new StylePanelView( locale, {
			block: [
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
			],
			inline: [
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ],
					previewTemplate: {
						tag: 'span',
						attributes: {
							class: 'deleted'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Cited work',
					element: 'span',
					classes: [ 'cited', 'another-class' ],
					previewTemplate: {
						tag: 'span',
						attributes: {
							class: [ 'cited', 'another-class' ]
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Small text',
					element: 'span',
					classes: [ 'small' ],
					previewTemplate: {
						tag: 'span',
						attributes: {
							class: 'small'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				}
			]
		} );
	} );

	afterEach( async () => {
		panel.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create #focusTracker instance', () => {
			expect( panel.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( panel.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should set #children', () => {
			expect( panel.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should set #blockStylesGroupView', () => {
			expect( panel.blockStylesGroupView ).to.be.instanceOf( StyleGroupView );
			expect( panel.blockStylesGroupView.labelView.text ).to.equal( 'Block styles' );
			expect( panel.blockStylesGroupView.gridView.children.length ).to.equal( 2 );
		} );

		it( 'should set #inlineStylesGroupView', () => {
			expect( panel.inlineStylesGroupView ).to.be.instanceOf( StyleGroupView );
			expect( panel.inlineStylesGroupView.labelView.text ).to.equal( 'Text styles' );
			expect( panel.inlineStylesGroupView.gridView.children.length ).to.equal( 3 );
		} );

		it( 'should set #activeStyles', () => {
			expect( panel.activeStyles ).to.deep.equal( [] );
		} );

		it( 'should set #enabledStyles', () => {
			expect( panel.enabledStyles ).to.deep.equal( [] );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( panel._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( panel._focusables ).to.be.instanceOf( ViewCollection );
		} );

		describe( 'style groups', () => {
			it( 'should add #blockStylesGroupView to #children when there are block definitions', () => {
				expect( panel.children.first ).to.equal( panel.blockStylesGroupView );
			} );

			it( 'should add #inlineStylesGroupView to #children when there are inline definitions', () => {
				expect( panel.children.last ).to.equal( panel.inlineStylesGroupView );
			} );

			it( 'should not add #blockStylesGroupView to #children when there are no block definitions', () => {
				const panel = new StylePanelView( locale, {
					block: [],
					inline: [
						{
							name: 'Deleted text',
							element: 'span',
							classes: [ 'deleted' ],
							previewTemplate: {
								tag: 'span',
								attributes: {
									class: 'deleted'
								},
								children: [
									{ text: 'AaBbCcDdEeFfGgHhIiJj' }
								]
							}
						}
					]
				} );

				expect( panel.children.first ).to.equal( panel.inlineStylesGroupView );
				expect( panel.children.last ).to.equal( panel.inlineStylesGroupView );

				panel.destroy();
			} );

			it( 'should not add #inlineStylesGroupView to #children when there are no inline definitions', () => {
				const panel = new StylePanelView( locale, {
					block: [
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
					],
					inline: []
				} );

				expect( panel.children.first ).to.equal( panel.blockStylesGroupView );
				expect( panel.children.last ).to.equal( panel.blockStylesGroupView );

				panel.destroy();
			} );

			it( 'should delegate #execute from #blockStylesGroupView grid', () => {
				const spy = sinon.spy();

				panel.on( 'execute', spy );
				panel.blockStylesGroupView.gridView.fire( 'execute', 'foo' );

				sinon.assert.calledOnceWithExactly( spy, sinon.match.object, 'foo' );
			} );

			it( 'should delegate #execute from #inlineStylesGroupView grid', () => {
				const spy = sinon.spy();

				panel.on( 'execute', spy );
				panel.inlineStylesGroupView.gridView.fire( 'execute', 'foo' );

				sinon.assert.calledOnceWithExactly( spy, sinon.match.object, 'foo' );
			} );

			it( 'should bind #activeStyles and #enabledStyles to #blockStylesGroupView grid', () => {
				panel.activeStyles = [ 'foo', 'bar' ];
				panel.enabledStyles = [ 'baz', 'qux' ];

				expect( panel.blockStylesGroupView.gridView.activeStyles ).to.deep.equal( [ 'foo', 'bar' ] );
				expect( panel.blockStylesGroupView.gridView.enabledStyles ).to.deep.equal( [ 'baz', 'qux' ] );

				panel.activeStyles = [ 'a' ];
				panel.enabledStyles = [];

				expect( panel.blockStylesGroupView.gridView.activeStyles ).to.deep.equal( [ 'a' ] );
				expect( panel.blockStylesGroupView.gridView.enabledStyles ).to.deep.equal( [] );
			} );

			it( 'should bind #activeStyles and #enabledStyles to #inlineStylesGroupView grid', () => {
				panel.activeStyles = [ 'foo', 'bar' ];
				panel.enabledStyles = [ 'baz', 'qux' ];

				expect( panel.inlineStylesGroupView.gridView.activeStyles ).to.deep.equal( [ 'foo', 'bar' ] );
				expect( panel.inlineStylesGroupView.gridView.enabledStyles ).to.deep.equal( [ 'baz', 'qux' ] );

				panel.activeStyles = [ 'a' ];
				panel.enabledStyles = [];

				expect( panel.inlineStylesGroupView.gridView.activeStyles ).to.deep.equal( [ 'a' ] );
				expect( panel.inlineStylesGroupView.gridView.enabledStyles ).to.deep.equal( [] );
			} );
		} );

		it( 'should be a <div>', () => {
			panel.render();

			expect( panel.element.tagName ).to.equal( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			panel.render();

			expect( panel.element.classList.contains( 'ck-style-panel' ) ).to.be.true;
		} );

		describe( 'focus management', () => {
			beforeEach( () => {
				panel.render();
				document.body.appendChild( panel.element );
			} );

			afterEach( () => {
				panel.element.remove();
			} );

			describe( 'keyboard navigation between style groups in the panel', () => {
				it( 'should focus the next focusable item on "tab"', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the first style grid is focused.
					panel.focusTracker.isFocused = true;
					panel.focusTracker.focusedElement = panel.blockStylesGroupView.gridView.element;

					const spy = sinon.spy( panel.inlineStylesGroupView.gridView, 'focus' );

					panel.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( 'should focus the previous focusable item on "sfift + tab"', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the first style grid is focused.
					panel.focusTracker.isFocused = true;
					panel.focusTracker.focusedElement = panel.blockStylesGroupView.gridView.element;

					const spy = sinon.spy( panel.inlineStylesGroupView.gridView, 'focus' );

					panel.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'focus()', () => {
				it( 'should focus the first grid', () => {
					const spy = sinon.spy( panel.blockStylesGroupView.gridView, 'focus' );

					panel.focus();

					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'focusLast()', () => {
				it( 'should focus the last grid', () => {
					const spy = sinon.spy( panel.inlineStylesGroupView.gridView, 'focus' );

					panel.focusLast();

					sinon.assert.calledOnce( spy );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			panel.render();
			document.body.appendChild( panel.element );
		} );

		afterEach( () => {
			panel.element.remove();
		} );

		it( 'should register styleGroupView grids in #_focusables', () => {
			expect( panel._focusables.map( f => f ) ).to.have.members( [
				panel.blockStylesGroupView.gridView,
				panel.inlineStylesGroupView.gridView
			] );
		} );

		it( 'should register styleGroupView grid elements in #focusTracker', () => {
			const panel = new StylePanelView( locale, {
				block: [
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
					}
				],
				inline: [
					{
						name: 'Deleted text',
						element: 'span',
						classes: [ 'deleted' ],
						previewTemplate: {
							tag: 'span',
							attributes: {
								class: 'deleted'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					}
				]
			} );

			const spyView = sinon.spy( panel.focusTracker, 'add' );

			panel.render();

			sinon.assert.calledWithExactly( spyView.getCall( 0 ), panel.blockStylesGroupView.gridView.element );
			sinon.assert.calledWithExactly( spyView.getCall( 1 ), panel.inlineStylesGroupView.gridView.element );

			panel.destroy();
		} );
	} );
} );
