/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import {
	ButtonView,
	ListItemGroupView,
	ListItemView,
	ListView,
	SearchTextView,
	ToolbarView,
	type FilteredView,
	createLabeledTextarea
} from '../../../src/index.js';

const locale = new Locale();

function createSearchableList() {
	class FilteredTestListView extends ListView implements FilteredView {
		public filter( query ) {
			let totalItemsCount = 0;
			let visibleItemsCount = 0;

			function updateListItemVisibility( listItemView: ListItemView ) {
				const buttonView = listItemView.children.first! as ButtonView;

				listItemView.isVisible = query ? !!buttonView.label!.match( query ) : true;

				if ( listItemView.isVisible ) {
					visibleItemsCount++;
				}

				totalItemsCount++;
			}

			for ( const listItemOrGroupView of this.items ) {
				if ( listItemOrGroupView instanceof ListItemView ) {
					updateListItemVisibility( listItemOrGroupView );
				} else {
					const groupView = listItemOrGroupView as ListItemGroupView;

					for ( const item of groupView.items ) {
						updateListItemVisibility( item as ListItemView );
					}

					groupView.isVisible = !!groupView.items.filter( listItemView => listItemView.isVisible ).length;
				}
			}

			return {
				resultsCount: visibleItemsCount,
				totalItemsCount
			};
		}
	}

	const listView = new FilteredTestListView();
	const hasGroupView = new ListItemGroupView();
	const getGroupView = new ListItemGroupView();

	hasGroupView.label = 'Starting with "has"...';
	getGroupView.label = 'Starting with "get"...';

	[
		'getAttribute()', 'getAttributeNames()', 'getAttributeNode()', 'getAttributeNodeNS()', 'getAttributeNS()',
		'getBoundingClientRect()', 'getClientRects()', 'getElementsByClassName()', 'getElementsByTagName()', 'getElementsByTagNameNS()',
		'hasAttribute()', 'hasAttributeNS()', 'hasAttributes()', 'hasPointerCapture()', 'releasePointerCapture()', 'remove()',
		'removeAttribute()', 'removeAttributeNode()', 'removeAttributeNS()'
	].forEach( item => {
		const listItemView = new ListItemView();
		const buttonView = new ButtonView();

		buttonView.withText = true;
		buttonView.label = item;
		listItemView.children.add( buttonView );

		if ( item.startsWith( 'has' ) ) {
			hasGroupView.items.add( listItemView );
		} else if ( item.startsWith( 'get' ) ) {
			getGroupView.items.add( listItemView );
		} else {
			listView.items.add( listItemView );
		}
	} );

	listView.items.add( getGroupView );
	listView.items.add( hasGroupView );

	const searchView = new SearchTextView( locale, {
		queryView: {
			label: 'Search list items'
		},
		filteredView: listView
	} );

	addToPlayground( 'Filtering a list with grouped items', searchView );
}

function createSearchableToolbar() {
	class FilteredTestToolbarView extends ToolbarView implements FilteredView {
		public filter( query ) {
			let visibleItemsCount = 0;

			for ( const item of this.items ) {
				const buttonView = ( item as ButtonView );

				buttonView.isVisible = query ? !!buttonView.label!.match( query ) : true;

				if ( buttonView.isVisible ) {
					visibleItemsCount++;
				}
			}

			return {
				resultsCount: visibleItemsCount,
				totalItemsCount: this.items.length
			};
		}
	}

	const toolbarView = new FilteredTestToolbarView( locale );

	[
		'AddEventListenerOptions', 'AesCbcParams', 'AesCtrParams', 'AesDerivedKeyParams', 'AesGcmParams', 'AesKeyAlgorithm',
		'AesKeyGenParams', 'Algorithm', 'AnalyserOptions', 'AnimationEventInit', 'AnimationPlaybackEventInit', 'AssignedNodesOptions',
		'AudioBufferOptions', 'AudioBufferSourceOptions', 'AudioConfiguration', 'AudioContextOptions', 'AudioNodeOptions',
		'AudioProcessingEventInit', 'AudioTimestamp', 'MediaTrackConstraints',
		'MediaTrackSettings', 'MediaTrackSupportedConstraints', 'MessageEventInit', 'MouseEventInit', 'MultiCacheQueryOptions',
		'MutationObserverInit', 'NavigationPreloadState'
	].forEach( item => {
		const buttonView = new ButtonView();

		buttonView.withText = true;
		buttonView.label = item;
		toolbarView.items.add( buttonView );
	} );

	const searchView = new SearchTextView( locale, {
		queryView: {
			label: 'Search toolbar buttons'
		},
		filteredView: toolbarView
	} );

	addToPlayground( 'Filtering a toolbar', searchView );
}

function createSearchWithCustomInput() {
	class FilteredTestToolbarView extends ToolbarView implements FilteredView {
		public filter( query ) {
			let visibleItemsCount = 0;

			for ( const item of this.items ) {
				const buttonView = ( item as ButtonView );

				buttonView.isVisible = query ? !!buttonView.label!.match( query ) : true;

				if ( buttonView.isVisible ) {
					visibleItemsCount++;
				}
			}

			return {
				resultsCount: visibleItemsCount,
				totalItemsCount: this.items.length
			};
		}
	}

	const toolbarView = new FilteredTestToolbarView( locale );

	Array.from( Array( 30 ).keys() )
		.forEach( item => {
			const buttonView = new ButtonView( locale );

			buttonView.withText = true;
			buttonView.label = String( item );
			toolbarView.items.add( buttonView );
		} );

	const searchView = new SearchTextView( locale, {
		queryView: {
			label: 'Search toolbar buttons',
			creator: createLabeledTextarea
		},
		filteredView: toolbarView
	} );

	addToPlayground( 'Custom input (textarea)', searchView );
}

function addToPlayground( name, view ) {
	view.render();

	const container = document.createElement( 'div' );
	const heading = document.createElement( 'h2' );
	heading.textContent = name;

	container.appendChild( heading );
	container.appendChild( view.element! );
	document.querySelector( '.playground' )!.appendChild( container );
}

createSearchableList();
createSearchableToolbar();
createSearchWithCustomInput();
