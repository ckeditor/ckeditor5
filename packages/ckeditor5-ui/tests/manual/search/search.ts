/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { Locale } from '@ckeditor/ckeditor5-utils';
import {
	ButtonView,
	ListItemGroupView,
	ListItemView,
	ListView,
	SearchInfoView,
	SearchView,
	ToolbarView,
	type SearchViewSearchEvent
} from '../../../src';

const locale = new Locale();
const t = locale.t;

function createSearchableList() {
	class FilteredTestListView extends ListView {
		public filter( query ): number {
			let visibleItemsCount = 0;

			function updateListItemVisibility( listItemView: ListItemView ) {
				const buttonView = listItemView.children.first! as ButtonView;

				listItemView.isVisible = query ? !!buttonView.label!.match( query ) : true;

				if ( listItemView.isVisible ) {
					visibleItemsCount++;
				}
			}

			for ( const listItemOrGroupView of this.items ) {
				if ( listItemOrGroupView instanceof ListItemView ) {
					updateListItemVisibility( listItemOrGroupView );
				} else {
					const groupView = listItemOrGroupView as ListItemGroupView;

					for ( const item of groupView.items ) {
						updateListItemVisibility( item );
					}

					groupView.isVisible = !!groupView.items.filter( listItemView => listItemView.isVisible ).length;
				}
			}

			return visibleItemsCount;
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
		'hasAttribute()', 'hasAttributeNS()', 'hasAttributes()', 'hasPointerCapture()', 'insertAdjacentElement()', 'insertAdjacentHTML()',
		'insertAdjacentText()', 'matches()', 'prepend()', 'querySelector()', 'querySelectorAll()', 'releasePointerCapture()', 'remove()',
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

	const searchView = new SearchView( locale, {
		searchFieldLabel: 'Search list items',
		filteredView: listView
	} );

	createSearchInfoView( searchView );

	searchView.render();

	document.querySelector( '.playground' )!.appendChild( searchView.element! );
}

function createSearchableToolbar() {
	class FilteredTestToolbarView extends ToolbarView {
		public filter( query ): number {
			let visibleItemsCount = 0;

			for ( const item of this.items ) {
				const buttonView = ( item as ButtonView );

				buttonView.isVisible = query ? !!buttonView.label!.match( query ) : true;

				if ( buttonView.isVisible ) {
					visibleItemsCount++;
				}
			}

			return visibleItemsCount;
		}
	}

	const toolbarView = new FilteredTestToolbarView( locale );

	[
		'AddEventListenerOptions', 'AesCbcParams', 'AesCtrParams', 'AesDerivedKeyParams', 'AesGcmParams', 'AesKeyAlgorithm',
		'AesKeyGenParams', 'Algorithm', 'AnalyserOptions', 'AnimationEventInit', 'AnimationPlaybackEventInit', 'AssignedNodesOptions',
		'AudioBufferOptions', 'AudioBufferSourceOptions', 'AudioConfiguration', 'AudioContextOptions', 'AudioNodeOptions',
		'AudioProcessingEventInit', 'AudioTimestamp', 'AudioWorkletNodeOptions', 'AuthenticationExtensionsClientInputs',
		'AuthenticationExtensionsClientOutputs', 'AuthenticatorSelectionCriteria', 'AvcEncoderConfig', 'BiquadFilterOptions',
		'BlobEventInit', 'BlobPropertyBag', 'CSSMatrixComponentOptions', 'CSSNumericType', 'CSSStyleSheetInit', 'CacheQueryOptions',
		'CanvasRenderingContext2DSettings', 'KeyboardEventInit', 'Keyframe', 'KeyframeAnimationOptions', 'KeyframeEffectOptions',
		'LockInfo', 'MediaStreamTrackEventInit', 'MediaTrackCapabilities', 'MediaTrackConstraintSet', 'MediaTrackConstraints',
		'MediaTrackSettings', 'MediaTrackSupportedConstraints', 'MessageEventInit', 'MouseEventInit', 'MultiCacheQueryOptions',
		'MutationObserverInit', 'NavigationPreloadState'
	].forEach( item => {
		const buttonView = new ButtonView();

		buttonView.withText = true;
		buttonView.label = item;
		toolbarView.items.add( buttonView );
	} );

	const searchView = new SearchView( locale, {
		searchFieldLabel: 'Search toolbar buttons',
		filteredView: toolbarView
	} );

	createSearchInfoView( searchView );

	searchView.render();

	document.querySelector( '.playground' )!.appendChild( searchView.element! );
}

function createSearchInfoView( searchView: SearchView ) {
	const infoView = new SearchInfoView();

	searchView.resultsView.children.add( infoView, 0 );

	searchView.on<SearchViewSearchEvent>( 'search', ( evt, { numberOfResults, query } ) => {
		if ( !numberOfResults ) {
			infoView.set( {
				primaryText: t( 'Nothing found that matches "%0".', query ),
				secondaryText: t( 'Please try a different phrase or check the spelling.' ),
				isVisible: true
			} );
		} else {
			infoView.set( {
				isVisible: false
			} );
		}
	} );
}

createSearchableList();
createSearchableToolbar();
