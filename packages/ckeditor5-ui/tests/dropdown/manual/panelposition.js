/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import testUtils from '../../_utils/utils';
import { createDropdown, addListToDropdown } from '../../../src/dropdown/utils';

const ui = testUtils.createTestUIView( {
	dropdownNW: '#dropdown-nw',
	dropdownNE: '#dropdown-ne',
	dropdownSE: '#dropdown-se',
	dropdownSW: '#dropdown-sw'
} );

function createPositionedDropdown( position ) {
	const collection = new Collection( { idProperty: 'label' } );

	[
		'long label of a first item of the list',
		'long label of a second item of the list',
		'long label of a third item of the list'
	].forEach( label => {
		collection.add( {
			type: 'button',
			model: new Model( { label, withText: true } )
		} );
	} );

	const dropdownView = createDropdown( {} );

	dropdownView.buttonView.set( {
		label: `Dropdown ${ position }`,
		isEnabled: true,
		isOn: false,
		withText: true
	} );

	addListToDropdown( dropdownView, collection );

	ui[ `dropdown${ position }` ].add( dropdownView );
}

createPositionedDropdown( 'NW' );
createPositionedDropdown( 'NE' );
createPositionedDropdown( 'SW' );
createPositionedDropdown( 'SE' );
