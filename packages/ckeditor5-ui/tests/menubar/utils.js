/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	Locale,
	keyCodes,
	wait
} from '@ckeditor/ckeditor5-utils';
import {
	ComponentFactory,
	MenuBarMenuView,
	MenuBarView
} from '../../src/index.js';
import {
	barDump,
	getButtonCreator,
	getItemByLabel,
	getMenuByLabel
} from './_utils/utils.js';
import { MenuBarMenuViewPanelPositioningFunctions } from '../../src/menubar/utils.js';

describe( 'MenuBarView utils', () => {
	const locale = new Locale();
	let factory;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		factory = new ComponentFactory( {} );
		factory.add( 'A#1', getButtonCreator( 'A#1', locale ) );
		factory.add( 'AA#1', getButtonCreator( 'AA#1', locale ) );
		factory.add( 'AB#1', getButtonCreator( 'AB#1', locale ) );
		factory.add( 'AAA (from-factory)', () => {
			const menuView = new MenuBarMenuView( locale );
			menuView.buttonView.label = 'AAA (from-factory)';
			return menuView;
		} );
		factory.add( 'B#1', getButtonCreator( 'B#1', locale ) );
		factory.add( 'C#1', getButtonCreator( 'C#1', locale ) );
	} );

	describe( 'MenuBarBehaviors', () => {
		let menuBarView;

		beforeEach( () => {
			menuBarView = new MenuBarView( locale );
			menuBarView.render();

			document.body.appendChild( menuBarView.element );

			menuBarView.fillFromConfig( [
				{
					menuId: 'A',
					label: 'A',
					groups: [
						{
							groupId: 'A1',
							items: [
								'A#1',
								{
									menuId: 'AA',
									label: 'AA',
									groups: [
										{
											groupId: 'AA1',
											items: [
												'AA#1',
												'AAA (from-factory)'
											]
										}
									]
								},
								{
									menuId: 'AB',
									label: 'AB',
									groups: [
										{
											groupId: 'AB1',
											items: [
												'AB#1'
											]
										}
									]
								}
							]
						}
					]
				},
				{
					menuId: 'B',
					label: 'B',
					groups: [
						{
							groupId: 'B1',
							items: [
								'B#1'
							]
						}
					]
				},
				{
					menuId: 'C',
					label: 'C',
					groups: [
						{
							groupId: 'C1',
							items: [
								'C#1'
							]
						}
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'B#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'B#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [
										{ label: 'AA#1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: true, isFocused: true, items: [
										{ label: 'AB#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: true, isFocused: true, items: [
										{ label: 'AA#1', isFocused: false },
										{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
									] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [
										{ label: 'AB#1', isFocused: false }
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
					const menuAItem1 = getItemByLabel( menuBarView, 'A#1' );

					menuAA.buttonView.fire( 'mouseenter' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: true, isFocused: true, items: [
										{ label: 'AA#1', isFocused: false },
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
									{ label: 'A#1', isFocused: true },
									{ label: 'AA', isOpen: false, isFocused: false, items: [
										{ label: 'AA#1', isFocused: false },
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
								{ label: 'A#1', isFocused: false },
								{ label: 'AA', isOpen: true, isFocused: false, items: [
									{ label: 'AA#1', isFocused: false },
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
								{ label: 'A#1', isFocused: false },
								{ label: 'AA', isOpen: false, isFocused: false, items: [
									{ label: 'AA#1', isFocused: false },
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
								{ label: 'A#1', isFocused: false },
								{ label: 'AA', isOpen: false, isFocused: false, items: [
									{ label: 'AA#1', isFocused: false },
									{ label: 'AAA (from-factory)', isOpen: false, isFocused: false, items: [] }
								] },
								{ label: 'AB', isOpen: true, isFocused: false, items: [
									{ label: 'AB#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'B#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'B#1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: true, isFocused: true,
								items: [
									{ label: 'C#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: false, isFocused: false,
								items: [
									{ label: 'B#1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: [
									{ label: 'C#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
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
									{ label: 'C#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isOpen: false, isFocused: false, items: [] },
									{ label: 'AB', isOpen: false, isFocused: false, items: [] }
								]
							},
							{
								label: 'B', isOpen: true, isFocused: true,
								items: [
									{ label: 'B#1', isFocused: false }
								]
							},
							{
								label: 'C', isOpen: false, isFocused: false,
								items: [
									{ label: 'C#1', isFocused: false }
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
			let menuBarView;

			beforeEach( () => {
				menuBarView = new MenuBarView( locale );
				menuBarView.render();

				document.body.appendChild( menuBarView.element );

				menuBarView.fillFromConfig( [
					{
						menuId: 'A',
						label: 'A',
						groups: [
							{
								groupId: 'A1',
								items: [
									'A#1'
								]
							}
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
									{ label: 'A#1', isFocused: true }
								]
							}

						]
					);
				} );
			} );

			describe( 'toggleOnButtonClick()', () => {
				it( 'should toggle the visibility of the menu upon clicking', async () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );

					menuA.buttonView.fire( 'execute' );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'A#1', isFocused: true }
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
									{ label: 'A#1', isFocused: false }
								]
							}

						]
					);
				} );
			} );
		} );

		describe( 'for sub-menu', () => {
			let menuBarView;

			beforeEach( () => {
				menuBarView = new MenuBarView( locale );
				menuBarView.render();

				document.body.appendChild( menuBarView.element );

				menuBarView.fillFromConfig( [
					{
						menuId: 'A',
						label: 'A',
						groups: [
							{
								groupId: 'A1',
								items: [
									'A#1',
									{
										menuId: 'AA',
										label: 'AA',
										groups: [
											{
												groupId: 'AA1',
												items: [
													'AA#1'
												]
											}
										]
									}
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'AA#1', isFocused: true }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'AA#1', isFocused: true }
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
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );

					menuAA.buttonView.focus();
					menuAA.keystrokes.press( keyEvtData );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'AA#1', isFocused: true }
									] }
								]
							}
						]
					);

					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
				} );

				it( 'should focus the already open menu\'s panel upon arrow right key press', () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );

					menuAA.isOpen = true;

					menuAA.buttonView.focus();
					menuAA.keystrokes.press( keyEvtData );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'AA#1', isFocused: true }
									] }
								]
							}
						]
					);

					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
				} );

				it( 'should work only when the menu\'s button is focused', async () => {
					const menuA = getMenuByLabel( menuBarView, 'A' );
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					menuA.isOpen = true;

					const menuAA = getMenuByLabel( menuBarView, 'AA' );

					menuAA.isOpen = true;
					menuAA.panelView.focus();
					menuAA.keystrokes.press( keyEvtData );

					expect( barDump( menuBarView ) ).to.deep.equal(
						[
							{
								label: 'A', isOpen: true, isFocused: false,
								items: [
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: true, items: [
										{ label: 'AA#1', isFocused: true }
									] }
								]
							}
						]
					);

					sinon.assert.notCalled( keyEvtData.preventDefault );
					sinon.assert.notCalled( keyEvtData.stopPropagation );
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: true, isOpen: false, items: [
										{ label: 'AA#1', isFocused: false }
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
									{ label: 'A#1', isFocused: false },
									{ label: 'AA', isFocused: false, isOpen: false, items: [
										{ label: 'AA#1', isFocused: false }
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
			document.body.appendChild( menuBarView.element );

			menuBarView.fillFromConfig( [
				{
					menuId: 'A',
					label: 'A',
					groups: [
						{
							groupId: 'A1',
							items: [
								'A#1',
								{
									menuId: 'AA',
									label: 'AA',
									groups: [
										{
											groupId: 'AA1',
											items: [
												'AA#1'
											]
										}
									]
								}
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
							{ label: 'A#1', isFocused: false },
							{ label: 'AA', isFocused: true, isOpen: false, items: [
								{ label: 'AA#1', isFocused: false }
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
							{ label: 'A#1', isFocused: false },
							{ label: 'AA', isFocused: false, isOpen: false, items: [
								{ label: 'AA#1', isFocused: false }
							] }
						]
					}
				]
			);

			menuBarView.element.remove();
		} );
	} );

	describe( 'MenuBarMenuViewPanelPositioningFunctions', () => {
		let buttonRect, panelRect;

		beforeEach( () => {
			buttonRect = {
				top: 100,
				bottom: 200,
				left: 500,
				right: 200,
				width: 100,
				height: 100
			};

			panelRect = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 400,
				height: 50
			};
		} );

		it( 'should bring the "southEast" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.southEast( buttonRect ) ).to.deep.equal( {
				name: 'se',
				left: 500,
				top: 200
			} );
		} );

		it( 'should bring the "southWest" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.southWest( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'sw',
				left: 200,
				top: 200
			} );
		} );

		it( 'should bring the "northEast" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.northEast( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'ne',
				left: 500,
				top: 50
			} );
		} );

		it( 'should bring the "northWest" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.northWest( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'nw',
				left: 200,
				top: 50
			} );
		} );

		it( 'should bring the "eastSouth" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.eastSouth( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'es',
				left: 195,
				top: 100
			} );
		} );

		it( 'should bring the "eastNorth" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.eastNorth( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'en',
				left: 195,
				top: 50
			} );
		} );

		it( 'should bring the "westSouth" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.westSouth( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'ws',
				left: 105,
				top: 100
			} );
		} );

		it( 'should bring the "westNorth" positioning fuction', () => {
			expect( MenuBarMenuViewPanelPositioningFunctions.westNorth( buttonRect, panelRect ) ).to.deep.equal( {
				name: 'wn',
				left: 105,
				top: 50
			} );
		} );
	} );
} );
