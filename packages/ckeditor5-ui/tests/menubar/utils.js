/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Locale, keyCodes, wait } from '@ckeditor/ckeditor5-utils';
import { ComponentFactory, MenuBarMenuListItemButtonView, MenuBarMenuView, MenuBarView } from '../../src/index.js';
import { barDump, getItemByLabel, getMenuByLabel } from './_utils/utils.js';

describe( 'MenuBarView utils', () => {
	testUtils.createSinonSandbox();

	const locale = new Locale();

	describe( 'MenuBarBehaviors', () => {
		let menuBarView, factory;

		beforeEach( () => {
			menuBarView = new MenuBarView( locale );
			factory = new ComponentFactory( {} );
			menuBarView.render();

			document.body.appendChild( menuBarView.element );

			factory.add( 'menu-A-item1', getButtonCreator( 'menu-A-item1' ) );
			factory.add( 'menu-AA-item1', getButtonCreator( 'menu-AA-item1' ) );
			factory.add( 'menu-AB-item1', getButtonCreator( 'menu-AB-item1' ) );
			factory.add( 'AAA (from-factory)', () => {
				const menuView = new MenuBarMenuView( locale );
				menuView.buttonView.label = 'AAA (from-factory)';
				return menuView;
			} );
			factory.add( 'menu-B-item1', getButtonCreator( 'menu-B-item1' ) );
			factory.add( 'menu-C-item1', getButtonCreator( 'menu-C-item1' ) );

			menuBarView.fillFromConfig( [
				{
					id: 'A',
					label: 'A',
					items: [
						'menu-A-item1',
						{
							id: 'AA',
							label: 'AA',
							items: [
								'menu-AA-item1',
								'AAA (from-factory)'
							]
						},
						{
							id: 'AB',
							label: 'AB',
							items: [
								'menu-AB-item1'
							]
						}
					]
				},
				{
					id: 'B',
					label: 'B',
					items: [
						'menu-B-item1'
					]
				},
				{
					id: 'C',
					label: 'C',
					items: [
						'menu-C-item1'
					]
				}
			], factory );
		} );

		afterEach( () => {
			menuBarView.element.remove();
		} );

		describe( 'toggleMenusAndFocusItemsOnHover()', () => {
			it( 'should not engage if the bar is closed', () => {
				const menuA = getMenuByLabel( menuBarView, 'A' );

				menuA.buttonView.fire( 'mouseenter' );

				expect( barDump( menuBarView ) ).to.deep.equal(
					[
						{
							label: 'A', isOpen: false, isFocused: false,
							items: []
						},
						{
							label: 'B', isOpen: false, isFocused: false,
							items: []
						},
						{
							label: 'C', isOpen: false, isFocused: false,
							items: []
						}
					]
				);
			} );

			describe( 'if the bar is already open', () => {
				it( 'should toggle menus and move focus while moving the mouse (top-level menu -> top-level menu)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const menuB = getMenuByLabel( menuBarView, 'B' );

					menuA.isOpen = true;
					menuB.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );

				it( 'should toggle menus and move focus while moving the mouse (sub-menu -> sub-menu)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );
					const menuAB = getMenuByLabel( menuBarView, 'AB' );

					menuAA.isOpen = true;
					menuAB.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: true, isFocused: true, items: [
										{ label: 'menu-AB-item1', isFocused: false }
									] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuAA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: true, isFocused: true, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [
										{ label: 'menu-AB-item1', isFocused: false }
									] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );

				it( 'should toggle menus and move focus while moving the mouse (sub-menu -> item)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );
					const menuAItem1 = getItemByLabel( menuBarView, 'menu-A-item1' );

					menuAA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: true, isFocused: true, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuAItem1.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: true },
									{ label: 'AA', isOpen: false, isFocused: false, items: [
										{ label: 'menu-AA-item1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );
			} );
		} );

		describe( 'closeMenusWhenTheBarCloses()', () => {
			it( 'should close all menus (and sub-menus) when the bar closes', () => {
				const menuA = getMenuByLabel( menuBarView, 'A' );
				menuA.isOpen = true;

				const menuAA = getMenuByLabel( menuBarView, 'AA' );
				menuAA.isOpen = true;

				const menuAAA = getMenuByLabel( menuBarView, 'AAA (from-factory)' );
				menuAAA.isOpen = true;

				expect( barDump( menuBarView ) ).to.deep.equal(
					[
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'menu-A-item1', isFocused: false },
								{ label: 'AA', isOpen: true, isFocused: false, items: [
									{ label: 'menu-AA-item1', isFocused: false },
									{ label: 'AAA (from-factory)', isOpen: true, isFocused: false, items: [

									] }
								] },
								{ label: 'AB', isOpen: false, isFocused: false, items: [] }
							]
						},
						{
							label: 'B', isOpen: false, isFocused: false,
							items: []
						},
						{
							label: 'C', isOpen: false, isFocused: false,
							items: []
						}
					]
				);

				menuBarView.isOpen = false;

				expect( barDump( menuBarView ) ).to.deep.equal(
					[
						{
							label: 'A', isOpen: false, isFocused: false,
							items: [
								{ label: 'menu-A-item1', isFocused: false },
								{ label: 'AA', isOpen: false, isFocused: false, items: [
									{ label: 'menu-AA-item1', isFocused: false },
									{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [

									] }
								] },
								{ label: 'AB', isOpen: false, isFocused: false, items: [] }
							]
						},
						{
							label: 'B', isOpen: false, isFocused: false,
							items: []
						},
						{
							label: 'C', isOpen: false, isFocused: false,
							items: []
						}
					]
				);
			} );
		} );

		describe( 'closeMenuWhenAnotherOnTheSameLevelOpens()', () => {
			it( 'should closea a sub-menu when another one opens on the same level (same parent menu)', () => {
				const menuA = getMenuByLabel( menuBarView, 'A' );

				menuA.isOpen = true;

				const menuAA = getMenuByLabel( menuBarView, 'AA' );
				const menuAB = getMenuByLabel( menuBarView, 'AB' );

				menuAA.isOpen = true;
				menuAB.isOpen = true;

				expect( barDump( menuBarView ) ).to.deep.equal(
					[
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'menu-A-item1', isFocused: false },
								{ label: 'AA', isOpen: false, isFocused: false, items: [
									{ label: 'menu-AA-item1', isFocused: false },
									{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
								] },
								{ label: 'AB', isOpen: true, isFocused: false, items: [
									{ label: 'menu-AB-item1', isFocused: false }
								] }
							]
						},
						{
							label: 'B', isOpen: false, isFocused: false,
							items: []
						},
						{
							label: 'C', isOpen: false, isFocused: false,
							items: []
						}
					]
				);
			} );
		} );

		describe( 'focusCycleMenusOnArrows()', () => {
			describe( 'when the menu bar is closed and a top-level menu button focused', () => {
				it( 'should move focus horizontally across top-level menu buttons using the arrow right key', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const menuB = getMenuByLabel( menuBarView, 'B' );
					const menuC = getMenuByLabel( menuBarView, 'C' );

					menuA.buttonView.focus();
					menuA.fire( 'arrowright' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'B', isOpen: false, isFocused: true,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuB.fire( 'arrowright' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: true,
								items: []
							}
						]
					);

					menuC.fire( 'arrowright' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: true,
								items: []
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );

				it( 'should move focus horizontally across top-level menu buttons using the arrow left key', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const menuC = getMenuByLabel( menuBarView, 'C' );

					menuA.buttonView.focus();
					menuA.fire( 'arrowleft' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: true,
								items: []
							}
						]
					);

					menuC.fire( 'arrowleft' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'B', isOpen: false, isFocused: true,
								items: []
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);
				} );
			} );

			describe( 'when the menu bar is open', () => {
				it( 'should move focus horizontally across top-level menu buttons and open menus using the arrow right key', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const menuB = getMenuByLabel( menuBarView, 'B' );
					const menuC = getMenuByLabel( menuBarView, 'C' );

					menuA.buttonView.focus();
					menuA.isOpen = true;
					menuA.fire( 'arrowright' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: []
							}
						]
					);

					menuB.fire( 'arrowright' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-C-item1', isFocused: false }
								]
							}
						]
					);

					menuC.fire( 'arrowright' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-C-item1', isFocused: false }
								]
							}
						]
					);
				} );

				it( 'should move focus horizontally across top-level menu buttons and open menus using the arrow left key', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const menuC = getMenuByLabel( menuBarView, 'C' );

					menuA.buttonView.focus();
					menuA.isOpen = true;
					menuA.fire( 'arrowleft' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: []
							},
							{
								label: 'C', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-C-item1', isFocused: false }
								]
							}
						]
					);

					menuC.fire( 'arrowleft' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'menu-B-item1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-C-item1', isFocused: false }
								]
							}
						]
					);
				} );
			} );
		} );

		describe( 'closeOnClickOutside()', () => {
			it( 'should closes the bar when the user clicked  somewhere outside of it', () => {
				const closeSpy = sinon.spy( menuBarView, 'close' );
				const menuA = getMenuByLabel( menuBarView, 'A' );

				menuA.isOpen = true;

				// Check if context elements are correct.
				menuA.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				sinon.assert.notCalled( closeSpy );

				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				sinon.assert.calledOnce( closeSpy );
			} );
		} );
	} );

	describe( 'MenuBarMenuBehaviors', () => {
		describe( 'for top-level menus', () => {
			let menuBarView, factory;

			beforeEach( () => {
				menuBarView = new MenuBarView( locale );
				menuBarView.render();

				factory = new ComponentFactory( {} );
				factory.add( 'menu-A-item1', getButtonCreator( 'menu-A-item1' ) );

				document.body.appendChild( menuBarView.element );

				menuBarView.fillFromConfig( [
					{
						id: 'A',
						label: 'A',
						items: [
							'menu-A-item1'
						]
					}
				], factory );
			} );

			afterEach( () => {
				menuBarView.element.remove();
			} );

			describe( 'openAndFocusPanelOnArrowDownKey()', () => {
				it( 'should open and focus the panel on arrow down key', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					menuA.buttonView.focus();
					menuA.keystrokes.press( keyEvtData );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: true }
								]
							}

						]
					);
				} );
			} );

			describe( 'toggleOnButtonClick()', () => {
				it( 'should toggles the visibility of the menu upon clicking', async () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.buttonView.fire( 'execute' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: true }
								]
							}

						]
					);

					menuA.buttonView.fire( 'execute' );

					// Wait for the bar to close.
					await wait( 10 );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false }
								]
							}

						]
					);
				} );
			} );
		} );

		describe( 'for sub-menu', () => {
			let menuBarView, factory;

			beforeEach( () => {
				menuBarView = new MenuBarView( locale );
				menuBarView.render();

				factory = new ComponentFactory( {} );
				factory.add( 'menu-A-item1', getButtonCreator( 'menu-A-item1' ) );
				factory.add( 'menu-AA-item1', getButtonCreator( 'menu-AA-item1' ) );

				document.body.appendChild( menuBarView.element );

				menuBarView.fillFromConfig( [
					{
						id: 'A',
						label: 'A',
						items: [
							'menu-A-item1',
							{
								id: 'AA',
								label: 'AA',
								items: [
									'menu-AA-item1'
								]
							}
						]
					}
				], factory );
			} );

			afterEach( () => {
				menuBarView.element.remove();
			} );

			describe( 'openOnButtonClick()', () => {
				it( 'should open the menu upon clicking (but does not close it)', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );

					menuAA.buttonView.fire( 'execute' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'menu-AA-item1', isFocused: true }
									] }
								]
							}

						]
					);

					menuAA.buttonView.fire( 'execute' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'menu-AA-item1', isFocused: true }
									] }
								]
							}

						]
					);
				} );
			} );

			describe( 'openOnArrowRightKey()', () => {
				it( 'should open the menu upon arrow right key press', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					menuAA.buttonView.focus();
					menuAA.keystrokes.press( keyEvtData );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'menu-AA-item1', isFocused: true }
									] }
								]
							}
						]
					);
				} );
			} );

			describe( 'closeOnArrowLeftKey()', () => {
				it( 'should close the menu upon arrow left key press', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );
					const keyEvtData = {
						keyCode: keyCodes.arrowleft,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					menuAA.isOpen = true;
					menuAA.keystrokes.press( keyEvtData );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isFocused: true, isOpen: false, items: [
										{ label: 'menu-AA-item1', isFocused: false }
									] }
								]
							}
						]
					);
				} );
			} );

			describe( 'closeOnParentClose()', () => {
				it( 'should close the menu when its parent closes', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );

					menuAA.isOpen = true;
					menuA.isOpen = false;

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: false, isFocused: false,
								items: [
									{ label: 'menu-A-item1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: false, items: [
										{ label: 'menu-AA-item1', isFocused: false }
									] }
								]
							}
						]
					);
				} );
			} );
		} );

		it( 'should bring closeOnEscKey() that closes the menu on Esc key press', () => {
			const menuBarView = new MenuBarView( locale );
			menuBarView.render();

			const factory = new ComponentFactory( {} );
			factory.add( 'menu-A-item1', getButtonCreator( 'menu-A-item1' ) );
			factory.add( 'menu-AA-item1', getButtonCreator( 'menu-AA-item1' ) );

			document.body.appendChild( menuBarView.element );

			menuBarView.fillFromConfig( [
				{
					id: 'A',
					label: 'A',
					items: [
						'menu-A-item1',
						{
							id: 'AA',
							label: 'AA',
							items: [
								'menu-AA-item1'
							]
						}
					]
				}
			], factory );

			const menuA = getMenuByLabel( menuBarView, 'A' );

			menuA.isOpen = true;

			const menuAA = getMenuByLabel( menuBarView, 'AA' );
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			menuAA.isOpen = true;
			menuAA.keystrokes.press( keyEvtData );

			expect( barDump( menuBarView ) ).to.deep.equal(
				[
					{
						label: 'A', isOpen: true, isFocused: false,
						items: [
							{ label: 'menu-A-item1', isFocused: false },
							{ label: 'AA', isFocused: true, isOpen: false, items: [
								{ label: 'menu-AA-item1', isFocused: false }
							] }
						]
					}
				]
			);

			menuA.keystrokes.press( keyEvtData );

			expect( barDump( menuBarView ) ).to.deep.equal(
				[
					{
						label: 'A', isOpen: false, isFocused: true,
						items: [
							{ label: 'menu-A-item1', isFocused: false },
							{ label: 'AA', isFocused: false, isOpen: false, items: [
								{ label: 'menu-AA-item1', isFocused: false }
							] }
						]
					}
				]
			);

			menuBarView.element.remove();
		} );
	} );

	describe( 'MenuBarMenuViewPanelPositioningFunctions', () => {
		it( 'should bring the "southEast" positioning fuction', () => {

		} );

		it( 'should bring the "southWest" positioning fuction', () => {

		} );

		it( 'should bring the "northEast" positioning fuction', () => {

		} );

		it( 'should bring the "northWest" positioning fuction', () => {

		} );

		it( 'should bring the "eastSouth" positioning fuction', () => {

		} );

		it( 'should bring the "eastNorth" positioning fuction', () => {

		} );

		it( 'should bring the "westSouth" positioning fuction', () => {

		} );

		it( 'should bring the "westNorth" positioning fuction', () => {

		} );
	} );

	function getButtonCreator( label ) {
		return () => {
			const buttonView = new MenuBarMenuListItemButtonView( locale );
			buttonView.label = label;
			return buttonView;
		};
	}
} );
