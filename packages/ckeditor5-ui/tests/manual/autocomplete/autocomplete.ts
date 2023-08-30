/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView, ListItemView, ListView, AutocompleteView, SearchInfoView, type SearchViewSearchEvent } from '../../../src';

const locale = new Locale();
const t = locale.t;

class FilteredTestListView extends ListView {
	public filter( query ): number {
		let visibleItems = 0;

		for ( const item of this.items ) {
			const listItemView = ( item as ListItemView );
			const buttonView = listItemView.children.first! as ButtonView;

			listItemView.isVisible = query ? !!buttonView.label!.match( query ) : true;

			if ( listItemView.isVisible ) {
				visibleItems++;
			}
		}

		return visibleItems;
	}
}

const listView = new FilteredTestListView();

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
	listView.items.add( listItemView );
} );

const view = new AutocompleteView( locale, {
	searchFieldLabel: 'Search field label',
	filteredView: listView
} );

const infoView = new SearchInfoView();

view.resultsView.children.add( infoView, 0 );

view.on<SearchViewSearchEvent>( 'search', ( evt, { numberOfResults, query } ) => {
	if ( !numberOfResults ) {
		infoView.set( {
			primaryText: t( 'Nothing found that matches "%0".', query ),
			isVisible: true
		} );
	} else {
		infoView.set( {
			isVisible: false
		} );
	}
} );

view.render();

document.querySelector( '.playground' )!.appendChild( view.element! );
