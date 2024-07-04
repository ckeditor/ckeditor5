/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import {
	View,
	ButtonView,
	ViewCollection,
	ComponentFactory,

	MenuBarMenuListItemButtonView,
	MenuBarMenuListItemView,
	MenuBarMenuListView,
	MenuBarMenuView,
	MenuBarView
} from '../../src/index.js';
import { MenuBarBehaviors, normalizeMenuBarConfig } from '../../src/menubar/utils.js';
import {
	Locale,
	wait
} from '@ckeditor/ckeditor5-utils';
import {
	add as addTranslations,
	_clear as clearTranslations
} from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import ListSeparatorView from '../../src/list/listseparatorview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	barDump,
	getButtonCreator,
	getMenuCreator,
	getItemByLabel,
	getMenuByLabel
} from './_utils/utils.js';

describe( 'MenuBarView', () => {
	let menuBarView, locale, factory;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'MENU_BAR_MENU_EDIT': 'Edit',
			'MENU_BAR_MENU_FORMAT': 'Format',
			'MENU_BAR_MENU_VIEW': 'View'
		} );

		addTranslations( 'pl', {
			'MENU_BAR_MENU_EDIT': 'Edycja',
			'MENU_BAR_MENU_FORMAT': 'Formatowanie',
			'MENU_BAR_MENU_VIEW': 'Widok',
			'MENU_BAR_MENU_SUB_MENU': 'Pod-menu'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		locale = new Locale();
		menuBarView = new MenuBarView( locale );
		factory = new ComponentFactory( {} );

		factory.add( 'item1', getButtonCreator( 'item1', locale ) );
		factory.add( 'item2', getButtonCreator( 'item2', locale ) );
	} );

	afterEach( () => {
		menuBarView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have collection of #children connected to the main element', () => {
			expect( menuBarView.children ).to.be.instanceOf( ViewCollection );

			const view = new View();

			view.setTemplate( { tag: 'div' } );
			view.render();

			menuBarView.render();
			menuBarView.children.add( view );

			expect( menuBarView.element.firstChild ).to.equal( view.element );
		} );

		it( 'should an array of #menus', () => {
			expect( menuBarView.menus ).to.be.instanceOf( Array );
			expect( menuBarView.menus ).to.be.empty;
		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {
				expect( menuBarView.template.attributes.class ).to.include.members( [ 'ck', 'ck-menu-bar' ] );
			} );

			it( 'should have an ARIA role attribute', () => {
				expect( menuBarView.template.attributes.role ).to.include.members( [ 'menubar' ] );
			} );

			it( 'should have an aria-label attribute', () => {
				expect( menuBarView.template.attributes[ 'aria-label' ] ).to.include.members( [ 'Editor menu bar' ] );
			} );

			it( 'has `isFocusBorderEnabled` bound to proper class name', () => {
				menuBarView.isFocusBorderEnabled = true;
				menuBarView.render();

				expect( menuBarView.element.classList.contains( 'ck-menu-bar_focus-border-enabled' ) ).to.be.true;
			} );
		} );

		describe( '#isOpen', () => {
			it( 'should be false by default', () => {
				expect( menuBarView.isOpen ).to.be.false;
			} );

			it( 'should be a sum of #isOpen of top-level sub-menus and never go false when going ' +
				'from one sub-menu to another', async () => {
				menuBarView.fillFromConfig( normalizeMenuBarConfig( {
					items: [
						{
							menuId: 'top2',
							label: 'Top 2',
							groups: [
								{
									groupId: '1',
									items: [ 'item1' ]
								}
							]
						},
						{
							menuId: 'top2',
							label: 'Top 2',
							groups: [
								{
									groupId: '2',
									items: [ 'item2' ]
								}
							]
						}
					]
				} ), factory );

				const changeSpy = sinon.spy();

				menuBarView.on( 'change:isOpen', changeSpy );

				expect( menuBarView.isOpen ).to.be.false;

				// Change #1 ---------------------------------------
				menuBarView.menus[ 0 ].isOpen = true;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #2 ---------------------------------------
				menuBarView.menus[ 1 ].isOpen = true;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #3 ---------------------------------------
				menuBarView.menus[ 0 ].isOpen = false;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #4 ---------------------------------------
				// This one is the most important: the state should not change even though one of the menus is closed **first**
				// before the other opened. Failing here would mean the menu bar closed, the focus moved somewhere else and
				// the user's flow was disrupted.
				menuBarView.menus[ 1 ].isOpen = false;
				menuBarView.menus[ 0 ].isOpen = true;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.true;
				sinon.assert.callCount( changeSpy, 1 );

				// Change #5 ---------------------------------------
				menuBarView.menus[ 1 ].isOpen = false;
				menuBarView.menus[ 0 ].isOpen = false;
				await wait( 10 );

				expect( menuBarView.isOpen ).to.be.false;
				sinon.assert.callCount( changeSpy, 2 );
			} );
		} );
	} );

	describe( 'fillFromConfig()', () => {
		it( 'should use the default config if none was provided', () => {
			const locale = new Locale();
			const menuBarView = new MenuBarView( locale );

			// Fake components in top-level categories so they don't get purged.
			factory.add( 'menuBar:undo', getButtonCreator( 'menuBar:undo', locale ) );
			factory.add( 'menuBar:sourceEditing', getButtonCreator( 'menuBar:sourceEditing', locale ) );
			factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );
			factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );

			menuBarView.fillFromConfig( normalizeMenuBarConfig( {} ), factory );

			expect( menuBarView.menus.map( menuView => menuView.buttonView.label ) ).to.have.members( [
				'Edit', 'View', 'Insert', 'Format'
			] );

			menuBarView.destroy();
		} );

		it( 'should use a default items config if the configuration was specified as an object', () => {
			const locale = new Locale();
			const menuBarView = new MenuBarView( locale );

			// Fake components in top-level categories so they don't get purged.
			factory.add( 'menuBar:undo', getButtonCreator( 'menuBar:undo', locale ) );
			factory.add( 'menuBar:sourceEditing', getButtonCreator( 'menuBar:sourceEditing', locale ) );
			factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );
			factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );

			menuBarView.fillFromConfig( normalizeMenuBarConfig( {
				addItems: [
					{
						item: 'menuBar:undo',
						position: 'end:basicStyles'
					}
				],
				removeItems: [
					'menuBar:bold'
				]
			} ), factory );

			expect( menuBarView.menus.map( menuView => menuView.buttonView.label ) ).to.have.members( [
				'Edit', 'View', 'Insert', 'Format'
			] );

			menuBarView.destroy();
		} );

		it( 'should support config specified as an object with user items', () => {
			const locale = new Locale();
			const menuBarView = new MenuBarView( locale );

			factory.add( 'menuBar:undo', getButtonCreator( 'menuBar:undo', locale ) );

			menuBarView.fillFromConfig( normalizeMenuBarConfig( {
				items: [
					{
						menuId: 'M1',
						label: 'My menu 1',
						groups: [
							{
								groupId: 'G1',
								items: [
									'menuBar:undo'
								]
							}
						]
					}
				]
			} ), factory );

			expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal(
				[
					{
						label: 'My menu 1', isOpen: true, isFocused: false,
						items: [
							{
								label: 'menuBar:undo',
								isFocused: false
							}
						]
					}
				]
			);

			menuBarView.destroy();
		} );

		describe( 'config normalization and clean-up', () => {
			describe( 'user config', () => {
				beforeEach( () => {
					testUtils.sinon.stub( console, 'warn' );
				} );

				it( 'should localize top-level category labels from the config', () => {
					const locale = new Locale( { uiLanguage: 'pl' } );
					const menuBarView = new MenuBarView( locale );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						addItems: [],
						removeItems: [],
						items: [
							{
								menuId: 'edit',
								label: 'Edit',
								groups: [
									{
										groupId: '1',
										items: [ 'item1' ]
									}
								]
							},
							{
								menuId: 'format',
								label: 'Format',
								groups: [
									{
										groupId: '1',
										items: [ 'item1' ]
									}
								]
							}
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Edycja', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						},
						{
							label: 'Formatowanie', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should localize sub-menu labels from the config', () => {
					const locale = new Locale( { uiLanguage: 'pl' } );
					const menuBarView = new MenuBarView( locale );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						addItems: [],
						removeItems: [],
						items: [
							{
								menuId: 'edit',
								label: 'Edit',
								groups: [
									{
										groupId: '1',
										items: [ 'item1' ]
									}
								]
							},
							{
								menuId: 'format',
								label: 'Format',
								groups: [
									{
										groupId: '1',
										items: [
											{
												menuId: '1.1',
												label: 'Pod-menu',
												groups: [
													{
														groupId: '1.1.1',
														items: [ 'item1' ]
													}
												]
											}
										]
									}
								]
							}
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Edycja', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						},
						{
							label: 'Formatowanie', isOpen: true, isFocused: false,
							items: [
								{
									label: 'Pod-menu', isOpen: true, isFocused: false,
									items: [
										{ label: 'item1', isFocused: false }
									]
								}
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should warn about unavailable components', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );
					const config = normalizeMenuBarConfig( {
						items: [
							{
								menuId: 'A',
								label: 'A',
								groups: [
									{
										groupId: '1',
										items: [
											'item1',
											'unavailable'
										]
									}
								]
							}
						]
					} );

					menuBarView.fillFromConfig( config, factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						}
					] );

					sinon.assert.callCount( console.warn, 1 );

					sinon.assert.calledWith( console.warn.getCall( 0 ), 'menu-bar-item-unavailable', {
						menuBarConfig: config,
						parentMenuConfig: config.items[ 0 ],
						componentName: 'unavailable'
					}, sinon.match.string );

					menuBarView.destroy();
				} );

				it( 'should get rid of empty menus and warn about them', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );
					const config = normalizeMenuBarConfig( {
						items: [
							{
								menuId: 'A',
								label: 'A',
								groups: [
									{
										groupId: 'A1',
										items: [
											'item1'
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
											'item1',
											{
												menuId: 'BA (empty)',
												label: 'BA (empty)',
												groups: [
													{
														groupId: 'BA1',
														items: [
															{
																menuId: 'BAA (empty)',
																label: 'BAA (empty)',
																groups: []
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					} );

					menuBarView.fillFromConfig( config, factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						},
						{
							label: 'B', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						}
					] );

					sinon.assert.callCount( console.warn, 2 );

					sinon.assert.calledWithExactly( console.warn.firstCall, 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: { menuId: 'BAA (empty)', label: 'BAA (empty)', groups: [] }
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.secondCall, 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: { menuId: 'BA (empty)', label: 'BA (empty)', groups: [] }
					}, sinon.match.string );

					menuBarView.destroy();
				} );

				it( 'should warn if there were no menus left because components were not registered in the factory', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					const config = normalizeMenuBarConfig( {
						items: [
							{
								menuId: 'A',
								label: 'A',
								groups: [
									{
										groupId: 'A1',
										items: [
											'invalid'
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
											'invalid',
											{
												menuId: 'BA (empty)',
												label: 'BA (empty)',
												groups: [
													{
														groupId: 'BA1',
														items: [
															{
																menuId: 'BAA (empty)',
																label: 'BAA (empty)',
																groups: []
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					} );

					menuBarView.fillFromConfig( config, factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [] );

					sinon.assert.callCount( console.warn, 7 );

					sinon.assert.calledWithExactly( console.warn.getCall( 0 ), 'menu-bar-item-unavailable', {
						menuBarConfig: config,
						parentMenuConfig: config.items[ 0 ],
						componentName: 'invalid'
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.getCall( 1 ), 'menu-bar-item-unavailable', {
						menuBarConfig: config,
						parentMenuConfig: config.items[ 1 ],
						componentName: 'invalid'
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.getCall( 2 ), 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: { menuId: 'BAA (empty)', label: 'BAA (empty)', groups: [] }
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.getCall( 3 ), 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: { menuId: 'A', label: 'A', groups: [] }
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.getCall( 4 ), 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: { menuId: 'BA (empty)', label: 'BA (empty)', groups: [] }
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.getCall( 5 ), 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: { menuId: 'B', label: 'B', groups: [] }
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.getCall( 6 ), 'menu-bar-menu-empty', {
						menuBarConfig: config,
						emptyMenuConfig: config
					}, sinon.match.string );

					menuBarView.destroy();
				} );

				it( 'should get rid of trailing and leading separators and consider that while purging empty menus', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						items: [
							{
								menuId: 'A',
								label: 'A',
								groups: [
									{
										groupId: 'A1',
										items: [
											'item1'
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
											'item2',
											{
												menuId: 'BA (empty)',
												label: 'BA (empty)',
												groups: [
													{
														groupId: 'BA1',
														items: [
															{
																menuId: 'BAA (empty)',
																label: 'BAA (empty)',
																groups: []
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'item1', isFocused: false }
							]
						},
						{
							label: 'B', isOpen: true, isFocused: false,
							items: [
								{ label: 'item2', isFocused: false }
							]
						}
					] );

					menuBarView.destroy();
				} );
			} );

			describe( 'default config', () => {
				it( 'should normalize the config as if it was a user config but without warnings', () => {
					const locale = new Locale( { uiLanguage: 'pl' } );
					const menuBarView = new MenuBarView( locale );

					// Adding just two components to the factory, the rest should be purged.
					factory.add( 'menuBar:undo', getButtonCreator( 'menuBar:undo', locale ) );
					factory.add( 'menuBar:sourceEditing', getButtonCreator( 'menuBar:sourceEditing', locale ) );

					// Pass undefined to force the default config.
					menuBarView.fillFromConfig( normalizeMenuBarConfig( {} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Edycja', isOpen: true, isFocused: false,
							items: [
								{ label: 'menuBar:undo', isFocused: false }
							]
						},
						{
							label: 'Widok', isOpen: true, isFocused: false,
							items: [
								{ label: 'menuBar:sourceEditing', isFocused: false }
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should not warn if the bar became empty because there were no components in the factory', () => {
					const locale = new Locale( { uiLanguage: 'pl' } );
					const menuBarView = new MenuBarView( locale );
					const spy = sinon.spy( console, 'warn' );

					// Pass undefined to force the default config.
					menuBarView.fillFromConfig( normalizeMenuBarConfig( {} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [] );

					sinon.assert.notCalled( spy );

					menuBarView.destroy();
				} );
			} );

			describe( 'removing items via config.menuBar.removeItems', () => {
				it( 'should remove items', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
					factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

					// Pass undefined to force the default config.
					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						removeItems: [
							'menuBar:bold'
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Format', isOpen: true, isFocused: false,
							items: [
								{
									label: 'Text',
									isFocused: false,
									isOpen: true,
									items: [ {
										label: 'menuBar:italic',
										isFocused: false
									} ]
								}
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should remove groups', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
					factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );
					factory.add( 'menuBar:bulletedList', getButtonCreator( 'menuBar:bulletedList', locale ) );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						removeItems: [
							'basicStyles'
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Format', isOpen: true, isFocused: false,
							items: [
								{ label: 'menuBar:bulletedList', isFocused: false }
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should remove sub-menus', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
					factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );
					factory.add( 'menuBar:bulletedList', getButtonCreator( 'menuBar:bulletedList', locale ) );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						items: [
							{
								menuId: 'A',
								label: 'A',
								groups: [
									{
										groupId: 'AA',
										items: [
											'menuBar:bold',
											{
												menuId: 'AAA',
												items: [
													{
														groupId: 'AAA1',
														items: [
															'menuBar:bulletedList'
														]
													}
												]
											},
											'menuBar:italic'
										]
									}
								]
							}
						],
						removeItems: [
							'AAA'
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'menuBar:bold', isFocused: false },
								{ label: 'menuBar:italic', isFocused: false }
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should remove top-level menus', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
					factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );
					factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						removeItems: [
							'format'
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Insert', isOpen: true, isFocused: false,
							items: [
								{ label: 'menuBar:blockQuote', isFocused: false }
							]
						}
					] );

					menuBarView.destroy();
				} );

				it( 'should warn if an object to be removed has not been found (user config)', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					testUtils.sinon.stub( console, 'warn' );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
					factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

					const config = normalizeMenuBarConfig( {
						items: [
							{
								menuId: 'A',
								label: 'A',
								groups: [
									{
										groupId: 'AA',
										items: [
											'menuBar:bold'
										]
									}
								]
							}
						],
						addItems: [],
						removeItems: [
							'doesNotExist'
						]
					} );

					menuBarView.fillFromConfig( config, factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'A', isOpen: true, isFocused: false,
							items: [
								{ label: 'menuBar:bold', isFocused: false }
							]
						}
					] );

					sinon.assert.calledOnceWithExactly( console.warn, 'menu-bar-item-could-not-be-removed', {
						menuBarConfig: config,
						itemName: 'doesNotExist'
					}, sinon.match.string );

					menuBarView.destroy();
				} );

				it( 'should warn if an object to be removed has not been found (default config)', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					testUtils.sinon.stub( console, 'warn' );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );

					const config = normalizeMenuBarConfig( {
						removeItems: [
							'doesNotExist'
						]
					} );

					menuBarView.fillFromConfig( config, factory );

					sinon.assert.calledOnceWithExactly( console.warn, 'menu-bar-item-could-not-be-removed', {
						menuBarConfig: sinon.match.object,
						itemName: 'doesNotExist'
					}, sinon.match.string );

					menuBarView.destroy();
				} );
			} );

			describe( 'adding items via config.menuBar.addItems', () => {
				describe( 'adding a top-level menu', () => {
					it( 'should be possible at the beginning of the bar', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'start'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'My menu', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:italic', isFocused: false }
								]
							},
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}

								]
							}
						] );

						menuBarView.destroy();
					} );

					it( 'should be possible at the end of the bar', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'end'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							},
							{
								label: 'My menu', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:italic', isFocused: false }
								]
							}
						] );

						menuBarView.destroy();
					} );

					it( 'should be possible before another top-level menu', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );
						factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'beofre:format'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Insert', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:blockQuote', isFocused: false }
								]
							},
							{
								label: 'My menu', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:italic', isFocused: false }
								]
							},
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible after another top-level menu', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );
						factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'after:insert'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Insert', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:blockQuote', isFocused: false }
								]
							},
							{
								label: 'My menu', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:italic', isFocused: false }
								]
							},
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );
				} );

				describe( 'adding a sub-menu', () => {
					it( 'should be possible at the beginning of the group', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'start:basicStyles'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [ {
									label: 'Text', isOpen: true, isFocused: false,
									items: [
										{
											label: 'My menu', isOpen: true, isFocused: false,
											items: [
												{ label: 'menuBar:italic', isFocused: false }
											]
										},
										{ label: 'menuBar:bold', isFocused: false },
										{ label: 'menuBar:italic', isFocused: false }
									]
								} ]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible at the beginning end the group', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'end:basicStyles'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false },
											{
												label: 'My menu', isOpen: true, isFocused: false,
												items: [
													{ label: 'menuBar:italic', isFocused: false }
												]
											}
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible before another item', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'after:menuBar:bold'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [ {
									label: 'Text', isOpen: true, isFocused: false,
									items: [
										{ label: 'menuBar:bold', isFocused: false },
										{
											label: 'My menu', isOpen: true, isFocused: false,
											items: [
												{ label: 'menuBar:italic', isFocused: false }
											]
										},
										{ label: 'menuBar:italic', isFocused: false }
									]
								} ]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible after another item', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									menu: {
										menuId: 'MY',
										label: 'My menu',
										groups: [
											{
												groupId: 'MY1',
												items: [ 'menuBar:italic' ]
											}
										]
									},
									position: 'before:menuBar:italic'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{
												label: 'My menu', isOpen: true, isFocused: false,
												items: [
													{ label: 'menuBar:italic', isFocused: false }
												]
											},
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );
				} );

				describe( 'adding a group', () => {
					it( 'should be possible at the beginning of the menu', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									group: {
										groupId: 'MY',
										items: [
											'menuBar:italic'
										]
									},
									position: 'start:format'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:italic', isFocused: false },
									'-',
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible at the beginning end the menu', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									group: {
										groupId: 'MY',
										items: [
											'menuBar:italic'
										]
									},
									position: 'end:format'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isFocused: false, isOpen: true,
										items: [
											{
												isFocused: false,
												label: 'menuBar:bold'
											},
											{
												isFocused: false,
												label: 'menuBar:italic'
											}
										]
									},
									'-',
									{ label: 'menuBar:italic', isFocused: false }
								]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible before another group', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									group: {
										groupId: 'MY',
										items: [
											'menuBar:italic'
										]
									},
									position: 'before:basicStyles'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:italic', isFocused: false },
											'-',
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible after another group', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									group: {
										groupId: 'MY',
										items: [
											'menuBar:italic'
										]
									},
									position: 'after:basicStyles'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false },
											'-',
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );
				} );

				describe( 'adding an item', () => {
					it( 'should be possible at the beginning of the group', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									item: 'menuBar:italic',
									position: 'start:basicStyles'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:italic', isFocused: false },
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}

						] );

						menuBarView.destroy();
					} );

					it( 'should be possible at the beginning end the group', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									item: 'menuBar:italic',
									position: 'end:basicStyles'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false },
											{ label: 'menuBar:italic', isFocused: false }
										]
									}
								]
							}
						] );

						menuBarView.destroy();
					} );

					it( 'should be possible before another item', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									item: 'menuBar:bold',
									position: 'before:menuBar:blockQuote'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Insert', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:bold', isFocused: false },
									{ label: 'menuBar:blockQuote', isFocused: false }
								]
							},
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text', isOpen: true, isFocused: false,
										items: [
											{ label: 'menuBar:bold', isFocused: false }
										]
									}
								]
							}
						] );

						menuBarView.destroy();
					} );

					it( 'should be possible after another item', () => {
						const locale = new Locale();
						const menuBarView = new MenuBarView( locale );

						factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
						factory.add( 'menuBar:blockQuote', getButtonCreator( 'menuBar:blockQuote', locale ) );

						menuBarView.fillFromConfig( normalizeMenuBarConfig( {
							addItems: [
								{
									item: 'menuBar:bold',
									position: 'after:menuBar:blockQuote'
								}
							]
						} ), factory );

						expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
							{
								label: 'Insert', isOpen: true, isFocused: false,
								items: [
									{ label: 'menuBar:blockQuote', isFocused: false },
									{ label: 'menuBar:bold', isFocused: false }

								]
							},
							{
								label: 'Format', isOpen: true, isFocused: false,
								items: [
									{
										label: 'Text',
										isFocused: false,
										isOpen: true,
										items: [
											{ label: 'menuBar:bold', isFocused: false }
										]
									}
								]
							}
						] );

						menuBarView.destroy();
					} );
				} );

				it( 'should warn if some objects could not be added', () => {
					const locale = new Locale();
					const menuBarView = new MenuBarView( locale );

					testUtils.sinon.stub( console, 'warn' );

					factory.add( 'menuBar:bold', getButtonCreator( 'menuBar:bold', locale ) );
					factory.add( 'menuBar:italic', getButtonCreator( 'menuBar:italic', locale ) );

					menuBarView.fillFromConfig( normalizeMenuBarConfig( {
						addItems: [
							{
								item: 'menuBar:italic',
								position: 'doesNotExist'
							},
							{
								group: {
									groupId: 'MY',
									items: [
										'menuBar:italic'
									]
								},
								position: 'doesNotExistEither'
							}
						]
					} ), factory );

					expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
						{
							label: 'Format', isOpen: true, isFocused: false,
							items: [
								{
									label: 'Text', isOpen: true, isFocused: false,
									items: [
										{ label: 'menuBar:bold', isFocused: false },
										{ label: 'menuBar:italic', isFocused: false }
									]
								}
							]
						}
					] );

					sinon.assert.callCount( console.warn, 2 );

					sinon.assert.calledWithExactly( console.warn.firstCall, 'menu-bar-item-could-not-be-added', {
						menuBarConfig: sinon.match.object,
						addedItemConfig: {
							item: 'menuBar:italic',
							position: 'doesNotExist'
						}
					}, sinon.match.string );

					sinon.assert.calledWithExactly( console.warn.secondCall, 'menu-bar-item-could-not-be-added', {
						menuBarConfig: sinon.match.object,
						addedItemConfig: {
							group: {
								groupId: 'MY',
								items: [
									'menuBar:italic'
								]
							},
							position: 'doesNotExistEither'
						}
					}, sinon.match.string );

					menuBarView.destroy();
				} );
			} );
		} );

		describe( 'menu creation', () => {
			beforeEach( () => {
				testUtils.sinon.stub( console, 'warn' );

				factory.add( 'A#1', getButtonCreator( 'A#1', locale ) );
				factory.add( 'A#2', getButtonCreator( 'A#2', locale ) );
				factory.add( 'AA#1', getButtonCreator( 'AA#1', locale ) );
				factory.add( 'AAA (from-factory)', () => {
					const menuView = new MenuBarMenuView( locale );
					menuView.buttonView.label = 'AAA (from-factory)';
					return menuView;
				} );
				factory.add( 'AAA#2 (custom multi-level menu)', getMenuCreator( {
					label: 'AAA#2 (first sub-menu)',
					items: [
						getMenuCreator( {
							label: 'AAA#2 (second sub-menu)',
							items: [
								getButtonCreator( 'AAA#2', locale )
							]
						}, locale )
					]
				},
				locale
				) );
				factory.add( 'B#1', getButtonCreator( 'B#1', locale ) );
				factory.add( 'B#2', getButtonCreator( 'B#2', locale ) );
				factory.add( 'B#3 (incorrect)', () => {
					const buttonView = new ButtonView( locale );
					buttonView.label = 'incorrect';
					return buttonView;
				} );

				menuBarView.fillFromConfig( normalizeMenuBarConfig( {
					items: [
						{
							id: 'A',
							label: 'A',
							groups: [
								{
									groupId: 'A1',
									items: [
										'A#1',
										'A#2'
									]
								},
								{
									groupId: 'A2',
									items: [
										{
											id: 'AA',
											label: 'AA',
											groups: [
												{
													groupId: 'AA1',
													items: [
														'AA#1',
														'AAA (from-factory)',
														'AAA#2 (custom multi-level menu)'
													]
												}
											]
										}
									]
								}
							]
						},
						{
							id: 'B',
							label: 'B',
							groups: [
								{
									groupId: 'B1',
									items: [
										'B#1',
										'B#2',
										'B#3 (incorrect)'
									]
								}
							]
						}
					]
				} ), factory );

				menuBarView.render();

				document.body.appendChild( menuBarView.element );
			} );

			afterEach( () => {
				menuBarView.element.remove();
			} );

			it( 'should deliver MenuBarMenuView instances', () => {
				expect( Array.from( menuBarView.children ).every( childMenuView => childMenuView instanceof MenuBarMenuView ) ).to.be.true;
			} );

			it( 'should set the menu button\'s label', () => {
				expect( menuBarView.children.map( childMenuView => childMenuView.buttonView.label ) ).to.deep.equal( [ 'A', 'B' ] );
			} );

			it( 'should defer menu view\'s initialization until first open (performance)', () => {
				expect( Array.from( menuBarView.children ).every(
					childMenuView => childMenuView.panelView.children.length === 0 )
				).to.be.true;

				getMenuByLabel( menuBarView, 'A' ).isOpen = true;

				expect( getMenuByLabel( menuBarView, 'A' ).panelView.children.length ).to.equal( 1 );
				expect( getMenuByLabel( menuBarView, 'B' ).panelView.children.length ).to.equal( 0 );
			} );

			it( 'should use MenuBarMenuListView instances in MenuBarMenuView panels', () => {
				menuBarView.children.forEach( childMenuView => {
					childMenuView.isOpen = true;
				} );

				expect( Array.from( menuBarView.children ).every(
					childMenuView => childMenuView.panelView.children.first instanceof MenuBarMenuListView
				) ).to.be.true;
			} );

			it( 'should populate recursively in the correct structure and order', () => {
				expect( barDump( menuBarView, { fullDump: true } ) ).to.deep.equal( [
					{
						label: 'A', isOpen: true, isFocused: false,
						items: [
							{ label: 'A#1', isFocused: false },
							{ label: 'A#2', isFocused: false },
							'-',
							{
								label: 'AA', isOpen: true, isFocused: false,
								items: [
									{ label: 'AA#1', isFocused: false },
									{
										label: 'AAA (from-factory)', isOpen: true, isFocused: false,
										items: []
									},
									{
										label: 'AAA#2 (first sub-menu)', isOpen: true, isFocused: false,
										items: [
											{
												label: 'AAA#2 (second sub-menu)', isOpen: true, isFocused: false,
												items: [
													{ label: 'AAA#2', isFocused: false }
												]
											}
										]
									}

								]
							}
						]
					},
					{
						label: 'B', isOpen: true, isFocused: false, items: [
							{ label: 'B#1', isFocused: false },
							{ label: 'B#2', isFocused: false }
						]
					}
				] );

				expect( menuBarView.menus.map( menuView => menuView.buttonView.label ) ).to.have.members( [
					'A', 'B', 'AA', 'AAA (from-factory)', 'AAA#2 (first sub-menu)', 'AAA#2 (second sub-menu)'
				] );
			} );

			describe( 'menu item creation', () => {
				beforeEach( () => {
					getMenuByLabel( menuBarView, 'A' ).isOpen = true;
				} );

				it( 'should create separators in place of "-"', () => {
					expect(
						getMenuByLabel( menuBarView, 'A' ).panelView.children.first.items.get( 2 )
					).to.be.instanceOf( ListSeparatorView );
				} );

				it( 'should use MenuBarMenuListItemView for list items', () => {
					expect(
						getMenuByLabel( menuBarView, 'A' ).panelView.children.first.items.get( 0 )
					).to.be.instanceOf( MenuBarMenuListItemView );
				} );

				it( 'should create sub-menus with MenuBarMenuView recursively and put them in MenuBarMenuListItemView', () => {
					expect(
						getMenuByLabel( menuBarView, 'A' ).panelView.children.first.items.get( 3 ).children.first
					).to.be.instanceOf( MenuBarMenuView );
				} );

				describe( 'feature component creation using component factory', () => {
					it( 'should produce a component and put in MenuBarMenuListItemView', () => {
						expect(
							getMenuByLabel( menuBarView, 'A' ).panelView.children.first.items.get( 0 ).children.first
						).to.be.instanceOf( MenuBarMenuListItemButtonView );
					} );

					it( 'should warn if the compoent is not MenuBarMenuView or MenuBarMenuListItemButtonView', () => {
						getMenuByLabel( menuBarView, 'B' ).isOpen = true;

						sinon.assert.calledOnceWithExactly( console.warn, 'menu-bar-component-unsupported', {
							componentView: sinon.match.object,
							componentName: 'B#3 (incorrect)'
						}, sinon.match.string );
					} );

					it( 'should register nested MenuBarMenuView produced by the factory', () => {
						getMenuByLabel( menuBarView, 'AA' ).isOpen = true;

						const menuViewAAAFromFactory = getMenuByLabel( menuBarView, 'AAA (from-factory)' );

						expect( menuViewAAAFromFactory ).to.be.instanceOf( MenuBarMenuView );
						expect( menuBarView.menus ).to.include( menuViewAAAFromFactory );
					} );

					it( 'should delegate #mouseenter from feature list items to the parent menu', () => {
						const buttonView = getItemByLabel( menuBarView, 'A#1' );
						const spy = sinon.spy();

						menuBarView.children.first.on( 'mouseenter', spy );
						buttonView.fire( 'mouseenter' );
						sinon.assert.calledOnce( spy );
					} );

					it( 'should close parent menu when feature component fires #execute', () => {
						const buttonView = getItemByLabel( menuBarView, 'A#1' ).children.first;

						expect( getMenuByLabel( menuBarView, 'A' ).isOpen ).to.be.true;

						buttonView.fire( 'execute' );

						expect( getMenuByLabel( menuBarView, 'A' ).isOpen ).to.be.false;
					} );

					it( 'should set the correct parent element of custom multi-level sub-menu', () => {
						getMenuByLabel( menuBarView, 'AA' ).isOpen = true;

						const firstSubMenuViewAAA = getMenuByLabel( menuBarView, 'AAA#2 (first sub-menu)' );

						firstSubMenuViewAAA.isOpen = true;

						const secondSubMenuViewAAA = getMenuByLabel( menuBarView, 'AAA#2 (second sub-menu)' );

						expect( firstSubMenuViewAAA.parentMenuView.buttonView.label ).to.equal( 'AA' );
						expect( secondSubMenuViewAAA.parentMenuView.buttonView.label ).to.equal( 'AAA#2 (first sub-menu)' );
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add a behavior that makes the menus open and close while hovering using mouse by the user if ' +
			'the bar is already open', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'toggleMenusAndFocusItemsOnHover' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that closes all menus (and sub-menus) when the bar closes', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'closeMenusWhenTheBarCloses' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that closes a sub-menu when another one opens on the same level', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'closeMenuWhenAnotherOnTheSameLevelOpens' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that allows for moving horizontally across menus using arrow keys', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'focusCycleMenusOnArrows' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that closes the bar when the user clicked somewhere outside of it', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'closeOnClickOutside' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );

		it( 'should add a behavior that tracks if user performed keyboard focus interaction', () => {
			const spy = sinon.spy( MenuBarBehaviors, 'enableFocusHighlightOnInteraction' );

			menuBarView.render();

			sinon.assert.calledOnceWithExactly( spy, menuBarView );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first top-level sub-menu', () => {
			menuBarView.fillFromConfig( normalizeMenuBarConfig( {
				items: [
					{
						menuId: 'edit',
						label: 'Edit',
						groups: [
							{
								groupId: '1',
								items: [
									'item1'
								]
							}
						]
					},
					{
						menuId: 'format',
						label: 'Format',
						groups: [
							{
								groupId: '1',
								items: [
									'item1'
								]
							}
						]
					}
				]
			} ), factory );

			const spy = sinon.spy( getMenuByLabel( menuBarView, 'Edit' ), 'focus' );

			menuBarView.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should not focus anything unless there are some menus', () => {
			testUtils.sinon.stub( console, 'warn' );

			menuBarView.fillFromConfig( normalizeMenuBarConfig( {
				items: []
			} ), factory );

			expect( () => {
				menuBarView.focus();
			} ).to.not.throw();
		} );
	} );

	describe( 'close()', () => {
		it( 'should close all top-level sub-menus', () => {
			menuBarView.fillFromConfig( normalizeMenuBarConfig( {
				items: [
					{
						menuId: 'edit',
						label: 'Edit',
						groups: [
							{
								groupId: '1',
								items: [
									'item1'
								]
							}
						]
					},
					{
						menuId: 'format',
						label: 'Format',
						groups: [
							{
								groupId: '1',
								items: [
									'item1'
								]
							}
						]
					}
				]
			} ), factory );

			menuBarView.render();

			getMenuByLabel( menuBarView, 'Edit' ).isOpen = true;

			menuBarView.close();

			expect( getMenuByLabel( menuBarView, 'Edit' ).isOpen ).to.be.false;
			expect( getMenuByLabel( menuBarView, 'Format' ).isOpen ).to.be.false;
		} );
	} );

	describe( 'registerMenu()', () => {
		it( 'should set all properties and add the menu to the list of known menus', () => {
			const menuViewA = new MenuBarMenuView( locale );
			const menuViewAA = new MenuBarMenuView( locale );

			expect( menuViewA.parentMenuView ).to.be.null;
			expect( menuBarView.menus ).to.be.empty;

			menuBarView.registerMenu( menuViewA );

			expect( menuViewA.parentMenuView ).to.be.null;
			expect( menuBarView.menus[ 0 ] ).to.equal( menuViewA );

			menuBarView.registerMenu( menuViewAA, menuViewA );

			expect( menuViewAA.parentMenuView ).to.equal( menuViewA );
			expect( menuBarView.menus[ 1 ] ).to.equal( menuViewAA );
		} );

		it( 'should delegate specific events to the parent menu (sub-menu)', () => {
			const menuViewA = new MenuBarMenuView( locale );
			const menuViewAA = new MenuBarMenuView( locale );

			menuBarView.registerMenu( menuViewAA, menuViewA );

			[ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ].forEach( eventName => {
				const spy = sinon.spy();

				menuViewA.on( eventName, spy );
				menuViewAA.fire( eventName );
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should delegate specific events to the menu bar with a prefix (top-level menu)', () => {
			const menuViewA = new MenuBarMenuView( locale );

			menuBarView.registerMenu( menuViewA );

			[ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ].forEach( eventName => {
				const spy = sinon.spy();

				menuBarView.on( 'menu:' + eventName, spy );
				menuViewA.fire( eventName );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
