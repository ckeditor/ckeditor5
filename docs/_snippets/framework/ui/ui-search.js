/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import { ListView, SearchTextView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

const locale = new Locale();

const filteredView = new ListView();
filteredView.filter = () => {
	return {
		resultsCount: 1,
		totalItemsCount: 5
	};
};

const searchView = new SearchTextView( locale, {
	filteredView,
	queryView: {
		label: 'Label'
	}
} );

searchView.render();

document.querySelector( '.ui-search' ).append( searchView.element );
