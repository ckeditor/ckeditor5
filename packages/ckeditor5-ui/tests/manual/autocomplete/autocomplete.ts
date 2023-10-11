/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import { Locale } from '@ckeditor/ckeditor5-utils';
import {
	ButtonView,
	ListItemView,
	ListView,
	AutocompleteView,
	type FilteredView,
	type FilteredViewExecuteEvent,
	ListItemGroupView
} from '../../../src';
import type { ListViewSelectEvent } from '../../../src/list/listview';
import type { FilteredViewSelectEvent } from '../../../src/search/filteredview';

const locale = new Locale();

class FilteredTestListView extends ListView implements FilteredView {
	constructor( locale: Locale ) {
		super( locale );

		this.on<ListViewSelectEvent>( 'select', ( evt, data ) => {
			data.selectedValue = ( data.listItemView.children.first! as ButtonView ).label;
		} );
	}

	public filter( query ) {
		let visibleItems = 0;

		for ( const groupView of this.items ) {
			for ( const listItemView of ( groupView as ListItemGroupView ).items ) {
				const buttonView = listItemView.children.first! as ButtonView;

				listItemView.isVisible = query ? !!buttonView.label!.match( query ) : true;

				if ( listItemView.isVisible ) {
					visibleItems++;
				}
			}

			groupView.isVisible = !!( groupView as ListItemGroupView ).items.filter( listItemView => listItemView.isVisible ).length;
		}

		return {
			resultsCount: visibleItems,
			totalItemsCount: this.items.length
		};
	}
}

const listView = new FilteredTestListView( locale );

/* eslint-disable max-len */
const groupedCountries = [ 'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic (Czechia)', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Holy See', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom' ]
	.reduce( ( acc, current ) => {
		const firstLetter = current[ 0 ].toUpperCase();

		if ( !acc[ firstLetter ] ) {
			acc[ firstLetter ] = [];
		}

		acc[ firstLetter ].push( current );

		return acc;
	}, {} );

for ( const groupName in groupedCountries ) {
	const countryViews = groupedCountries[ groupName ].map( countryName => {
		const listItemView = createItem( countryName );

		listItemView.children.first!.on( 'execute', () => {
			listView.fire<FilteredViewExecuteEvent>( 'execute', {
				value: countryName
			} );
		} );

		return listItemView;
	} );

	listView.items.add( createGroup( groupName, countryViews ) );
}

function createItem( label: string ): ListItemView {
	const item = new ListItemView();
	const button = new ButtonView();

	item.children.add( button );

	button.set( { label, withText: true } );

	return item;
}

function createGroup( label: string, items: Array<ListItemView> ): ListItemGroupView {
	const groupView = new ListItemGroupView();

	groupView.label = label;
	groupView.items.addMany( items );

	return groupView;
}

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
