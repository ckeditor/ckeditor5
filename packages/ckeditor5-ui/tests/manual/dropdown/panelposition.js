/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model.js';
import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import testUtils from '../../_utils/utils.js';
import { createDropdown, addListToDropdown } from '../../../src/dropdown/utils.js';

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
