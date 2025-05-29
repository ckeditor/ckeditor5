/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import {
	ButtonView,
	ListItemView,
	ListView,
	AutocompleteView,
	type FilteredView,
	type FilteredViewExecuteEvent
} from '../../../src/index.js';

const locale = new Locale();

class FilteredTestListView extends ListView implements FilteredView {
	public filter( query ) {
		let visibleItems = 0;

		for ( const item of this.items ) {
			const listItemView = ( item as ListItemView );
			const buttonView = listItemView.children.first! as ButtonView;

			listItemView.isVisible = query ? !!buttonView.label!.match( query ) : true;

			if ( listItemView.isVisible ) {
				visibleItems++;
			}
		}

		return {
			resultsCount: visibleItems,
			totalItemsCount: this.items.length
		};
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

	buttonView.on( 'execute', () => {
		listView.fire<FilteredViewExecuteEvent>( 'execute', {
			value: buttonView.label!
		} );
	} );

	buttonView.withText = true;
	buttonView.label = item;
	listItemView.children.add( buttonView );
	listView.items.add( listItemView );
} );

const view = new AutocompleteView( locale, {
	queryView: {
		label: 'Search field label',
		showIcon: false,
		showResetButton: false
	},
	filteredView: listView
} );

view.render();

document.querySelector( '.playground' )!.appendChild( view.element! );
