/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale, global } from '@ckeditor/ckeditor5-utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	ButtonLabelWithHighlightView,
	ButtonView,
	LabelWithHighlightView,
	ListItemGroupView,
	ListItemView,
	ListView,
	SearchTextView,
	filterGroupAndItemNames
} from '../../src/index.js';

describe( 'filterGroupAndItemNames()', () => {
	testUtils.createSinonSandbox();

	let listView, searchView, element;

	const listDefinitions = [ {
		groupId: 'Client',
		groupLabel: 'Client data',
		itemDefinitions: [
			{
				id: 'clientName',
				label: 'Client name'
			},
			{
				id: 'clientAddress',
				label: 'Client address'
			},
			{
				id: 'clientPhone',
				label: 'Client phone'
			}
		]
	}, {
		groupId: 'Order',
		itemDefinitions: [
			{
				id: 'orderDate',
				label: 'Order date'
			},
			{
				id: 'orderNumber',
				label: 'Order number'
			}
		]
	}, {
		id: 'today',
		label: 'Today\'s date'
	},
	{
		id: 'authorsName',
		label: 'Author\'s name'
	} ];

	beforeEach( async () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		listView = createListView( new Locale(), listDefinitions );
		searchView = createSearchTextView( new Locale(), listView );
	} );

	afterEach( async () => {
		element.remove();
	} );

	describe( 'used as the list filter() method', () => {
		it( 'should filter items by their texts and hide those that do not match the query', () => {
			searchView.search( 'Client' );

			expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
				[
					{
						isVisible: true,
						title: 'Client name'
					},
					{
						isVisible: true,
						title: 'Client address'
					},
					{
						isVisible: true,
						title: 'Client phone'
					}
				],
				[
					{
						isVisible: false,
						title: 'Order date'
					},
					{
						isVisible: false,
						title: 'Order number'
					}
				],
				[
					{
						isVisible: false,
						title: 'Today\'s date'
					},
					{
						isVisible: false,
						title: 'Author\'s name'
					}
				]
			] );

			expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
				{
					isVisible: true,
					title: 'Client data'
				},
				{
					isVisible: false,
					title: 'Order'
				},
				{
					isVisible: false,
					title: 'Other'
				}
			] );

			expect( searchView.resultsCount ).to.equal( 3 );
			expect( searchView.totalItemsCount ).to.equal( 7 );
		} );

		it( 'should display a message using #infoView when no items were found', () => {
			searchView.search( 'something that will not be found' );

			expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
				[
					{
						isVisible: false,
						title: 'Client name'
					},
					{
						isVisible: false,
						title: 'Client address'
					},
					{
						isVisible: false,
						title: 'Client phone'
					}
				],
				[
					{
						isVisible: false,
						title: 'Order date'
					},
					{
						isVisible: false,
						title: 'Order number'
					}
				],
				[
					{
						isVisible: false,
						title: 'Today\'s date'
					},
					{
						isVisible: false,
						title: 'Author\'s name'
					}
				]
			] );

			expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
				{
					isVisible: false,
					title: 'Client data'
				},
				{
					isVisible: false,
					title: 'Order'
				},
				{
					isVisible: false,
					title: 'Other'
				}
			] );

			expect( searchView.resultsCount ).to.equal( 0 );
			expect( searchView.totalItemsCount ).to.equal( 7 );
		} );

		it( 'should reset filtering when no query was specified', () => {
			searchView.search( 'address' );

			expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
				[
					{
						isVisible: false,
						title: 'Client name'
					},
					{
						isVisible: true,
						title: 'Client address'
					},
					{
						isVisible: false,
						title: 'Client phone'
					}
				],
				[
					{
						isVisible: false,
						title: 'Order date'
					},
					{
						isVisible: false,
						title: 'Order number'
					}
				],
				[
					{
						isVisible: false,
						title: 'Today\'s date'
					},
					{
						isVisible: false,
						title: 'Author\'s name'
					}
				]
			] );

			expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
				{
					isVisible: true,
					title: 'Client data'
				},
				{
					isVisible: false,
					title: 'Order'
				},
				{
					isVisible: false,
					title: 'Other'
				}
			] );

			expect( searchView.resultsCount ).to.equal( 1 );
			expect( searchView.totalItemsCount ).to.equal( 7 );

			searchView.search();

			expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
				[
					{
						isVisible: true,
						title: 'Client name'
					},
					{
						isVisible: true,
						title: 'Client address'
					},
					{
						isVisible: true,
						title: 'Client phone'
					}
				],
				[
					{
						isVisible: true,
						title: 'Order date'
					},
					{
						isVisible: true,
						title: 'Order number'
					}
				],
				[
					{
						isVisible: true,
						title: 'Today\'s date'
					},
					{
						isVisible: true,
						title: 'Author\'s name'
					}
				]
			] );

			expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
				{
					isVisible: true,
					title: 'Client data'
				},
				{
					isVisible: true,
					title: 'Order'
				},
				{
					isVisible: true,
					title: 'Other'
				}
			] );

			expect( searchView.resultsCount ).to.equal( 7 );
			expect( searchView.totalItemsCount ).to.equal( 7 );
		} );

		it( 'should be case insensitive', () => {
			searchView.search( 'DATE' );

			expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
				[
					{
						isVisible: false,
						title: 'Client name'
					},
					{
						isVisible: false,
						title: 'Client address'
					},
					{
						isVisible: false,
						title: 'Client phone'
					}
				],
				[
					{
						isVisible: true,
						title: 'Order date'
					},
					{
						isVisible: false,
						title: 'Order number'
					}
				],
				[
					{
						isVisible: true,
						title: 'Today\'s date'
					},
					{
						isVisible: false,
						title: 'Author\'s name'
					}
				]
			] );

			expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
				{
					isVisible: false,
					title: 'Client data'
				},
				{
					isVisible: true,
					title: 'Order'
				},
				{
					isVisible: true,
					title: 'Other'
				}
			] );

			expect( searchView.resultsCount ).to.equal( 2 );
			expect( searchView.totalItemsCount ).to.equal( 7 );
		} );

		describe( 'filtering by group name', () => {
			it( 'should show all group items if the group name matches the pattern', () => {
				searchView.search( 'data' );

				expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
					[
						{
							isVisible: true,
							title: 'Client name'
						},
						{
							isVisible: true,
							title: 'Client address'
						},
						{
							isVisible: true,
							title: 'Client phone'
						}
					],
					[
						{
							isVisible: false,
							title: 'Order date'
						},
						{
							isVisible: false,
							title: 'Order number'
						}
					],
					[
						{
							isVisible: false,
							title: 'Today\'s date'
						},
						{
							isVisible: false,
							title: 'Author\'s name'
						}
					]
				] );

				expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
					{
						isVisible: true,
						title: 'Client data'
					},
					{
						isVisible: false,
						title: 'Order'
					},
					{
						isVisible: false,
						title: 'Other'
					}
				] );

				expect( searchView.resultsCount ).to.equal( 3 );
				expect( searchView.totalItemsCount ).to.equal( 7 );
			} );

			it( 'should show items that match the pattern despite the group name not matching the pattern', () => {
				searchView.search( 'phone' );

				expect( getListItemsData( searchView.filteredView.items ) ).to.deep.equal( [
					[
						{
							isVisible: false,
							title: 'Client name'
						},
						{
							isVisible: false,
							title: 'Client address'
						},
						{
							isVisible: true,
							title: 'Client phone'
						}
					],
					[
						{
							isVisible: false,
							title: 'Order date'
						},
						{
							isVisible: false,
							title: 'Order number'
						}
					],
					[
						{
							isVisible: false,
							title: 'Today\'s date'
						},
						{
							isVisible: false,
							title: 'Author\'s name'
						}
					]
				] );

				expect( getGroupsData( searchView.filteredView.items ) ).to.deep.equal( [
					{
						isVisible: true,
						title: 'Client data'
					},
					{
						isVisible: false,
						title: 'Order'
					},
					{
						isVisible: false,
						title: 'Other'
					}
				] );

				expect( searchView.resultsCount ).to.equal( 1 );
				expect( searchView.totalItemsCount ).to.equal( 7 );
			} );
		} );

		describe( 'highlighting query text in results', () => {
			let highlightTextSpies;

			beforeEach( () => {
				highlightTextSpies = getHighlightTextSpies( searchView.filteredView.items );
			} );

			it( 'should highlight the search query of each matching item in the same group', () => {
				searchView.search( 'lie' );

				assertHighlightTextSpies( highlightTextSpies, [
					{
						group: [ 1, /lie/gi ],
						items: [
							[ 1, /lie/gi ],
							[ 1, /lie/gi ],
							[ 1, /lie/gi ]
						]
					},
					{
						group: [ 1, null ],
						items: [
							[ 1, null ],
							[ 1, null ]
						]
					},
					{
						group: [ 1, null ],
						items: [
							[ 1, null ],
							[ 1, null ]
						]
					}
				] );

				expect( searchView.resultsCount ).to.equal( 3 );
				expect( searchView.totalItemsCount ).to.equal( 7 );
			} );

			it( 'should highlight the search query of each matching item from different groups', () => {
				searchView.search( 'dat' );

				assertHighlightTextSpies( highlightTextSpies, [
					{
						group: [ 1, /dat/gi ],
						items: [
							[ 1, null ],
							[ 1, null ],
							[ 1, null ]
						]
					},
					{
						group: [ 1, null ],
						items: [
							[ 1, /dat/gi ],
							[ 1, null ]
						]
					},
					{
						group: [ 1, null ],
						items: [
							[ 1, /dat/gi ],
							[ 1, null ]
						]
					}
				] );

				expect( searchView.resultsCount ).to.equal( 5 );
				expect( searchView.totalItemsCount ).to.equal( 7 );
			} );

			it( 'should not highlight the search query in the items if the query was not specified', () => {
				searchView.search();

				assertHighlightTextSpies( highlightTextSpies, [
					{
						group: [ 1, null ],
						items: [
							[ 1, null ],
							[ 1, null ],
							[ 1, null ]
						]
					},
					{
						group: [ 1, null ],
						items: [
							[ 1, null ],
							[ 1, null ]
						]
					},
					{
						group: [ 1, null ],
						items: [
							[ 1, null ],
							[ 1, null ]
						]
					}
				] );

				expect( searchView.resultsCount ).to.equal( 7 );
				expect( searchView.totalItemsCount ).to.equal( 7 );
			} );

			function getHighlightTextSpies( groups ) {
				return groups.map( group => {
					return {
						group: sinon.spy( group.labelView, 'highlightText' ),
						items: group.items.map( listItemView => {
							const buttonView = listItemView.children.first;
							const labelView = buttonView.labelView;

							return sinon.spy( labelView, 'highlightText' );
						} )
					};
				} );
			}

			function assertHighlightTextSpies( groupSpies, expected ) {
				const strucure = [];

				for ( const { group, items } of groupSpies ) {
					strucure.push( {
						group: [ group.callCount, group.firstCall && group.firstCall.args[ 0 ] ],
						items: items.map( spy => [ spy.callCount, spy.firstCall && spy.firstCall.args[ 0 ] ] )
					} );
				}

				return expect( strucure ).to.deep.equal( expected );
			}
		} );
	} );

	function getListItemsData( groups ) {
		return groups.map( group => {
			return group.items.map( listItemView => {
				const buttonView = listItemView.children.first;
				const labelView = buttonView.labelView;

				return {
					title: labelView.text,
					isVisible: listItemView.isVisible
				};
			} );
		} );
	}

	function getGroupsData( groups ) {
		return groups.map( group => {
			return {
				title: group.label,
				isVisible: group.isVisible
			};
		} );
	}

	class FilteredListView extends ListView {
		/**
		 * @inheritDoc
		 */
		filter( regExp ) {
			return filterGroupAndItemNames( regExp, this.items );
		}
	}

	function createListView( locale, definitions ) {
		const listView = new FilteredListView( locale );
		const ungroupedItems = [];
		const groups = [];

		for ( const definition of definitions ) {
			if ( 'groupId' in definition ) {
				const label = definition.groupLabel || definition.groupId;

				groups.push( createGroupView( locale, label, definition.itemDefinitions ) );
			} else {
				ungroupedItems.push( definition );
			}
		}

		if ( ungroupedItems.length ) {
			groups.push( createGroupView( locale, 'Other', ungroupedItems ) );
		}

		listView.items.addMany( groups );

		return listView;
	}

	function createGroupView( locale, label, definitions ) {
		const groupView = new ListItemGroupView( locale, new LabelWithHighlightView() );

		groupView.label = label;

		for ( const definition of definitions ) {
			groupView.items.add( createListItemView( locale, definition ) );
		}

		return groupView;
	}

	function createListItemView( locale, definition ) {
		const item = new ListItemView( locale );
		const labelView = new ButtonLabelWithHighlightView();
		const button = new ButtonView( locale, labelView );

		item.children.add( button );

		button.set( {
			label: definition.label,
			withText: true
		} );

		return item;
	}

	function createSearchTextView( locale, listView ) {
		return new SearchTextView( locale, {
			filteredView: listView,
			queryView: {
				label: 'Search'
			},
			infoView: {
				text: {
					notFound: {
						primary: 'No results found'
					},
					noSearchableItems: {
						primary: 'No items available'
					}
				}
			}
		} );
	}
} );
