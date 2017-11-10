/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/list/createlistdropdown
 */

import ListView from '../../list/listview';
import ListItemView from '../../list/listitemview';
import createDropdown from '../createdropdown';
import { closeDropdownOnBlur, closeDropdownOnExecute, openDropdownOnArrows } from '../utils';

/**
 * Creates an instance of {@link module:ui/dropdown/list/listdropdownview~ListDropdownView} class using
 * a provided {@link module:ui/dropdown/list/listdropdownmodel~ListDropdownModel}.
 *
 *		const items = new Collection();
 *
 *		items.add( new Model( { label: 'First item', style: 'color: red' } ) );
 *		items.add( new Model( { label: 'Second item', style: 'color: green', class: 'foo' } ) );
 *
 *		const model = new Model( {
 *			isEnabled: true,
 *			items,
 *			isOn: false,
 *			label: 'A dropdown'
 *		} );
 *
 *		const dropdown = createListDropdown( model, locale );
 *
 *		// Will render a dropdown labeled "A dropdown" with a list in the panel
 *		// containing two items.
 *		dropdown.render()
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * The
 * {@link module:ui/dropdown/list/listdropdownmodel~ListDropdownModel#items items collection}
 * of the {@link module:ui/dropdown/list/listdropdownmodel~ListDropdownModel model} also controls the
 * presence and attributes of respective {@link module:ui/list/listitemview~ListItemView list items}.
 *
 * See {@link module:ui/dropdown/createdropdown~createDropdown} and {@link module:list/list~List}.
 *
 * @param {module:ui/dropdown/list/listdropdownmodel~ListDropdownModel} model Model of the list dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/list/listdropdownview~ListDropdownView} The list dropdown view instance.
 */
export default function createListDropdown( model, locale ) {
	const dropdownView = createDropdown( model, locale );
	const listView = dropdownView.listView = new ListView( locale );

	listView.items.bindTo( model.items ).using( itemModel => {
		const item = new ListItemView( locale );

		// Bind all attributes of the model to the item view.
		item.bind( ...Object.keys( itemModel ) ).to( itemModel );

		return item;
	} );

	dropdownView.panelView.children.add( listView );

	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView, listView.items );
	openDropdownOnArrows( dropdownView, listView );

	return dropdownView;
}
