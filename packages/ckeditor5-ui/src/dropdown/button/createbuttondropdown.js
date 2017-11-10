/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/button/createbuttondropdown
 */

import createDropdown from '../createdropdown';

import ButtonGroupView from '../../buttongroup/buttongroupview';
import { closeDropdownOnBlur, closeDropdownOnExecute, openDropdownOnArrows } from '../utils';

/**
 * Creates an instance of {@link module:ui/dropdown/button/buttondropdownview~ButtonDropdownView} class using
 * a provided {@link module:ui/dropdown/button/buttondropdownmodel~ButtonDropdownModel}.
 *
 *		const buttons = [];
 *
 * 		buttons.push( new ButtonView() );
 *		buttons.push( editor.ui.componentFactory.get( 'someButton' ) );
 *
 *		const model = new Model( {
 *			label: 'A button dropdown',
 *			isVertical: true
 *		} );
 *
 *		const dropdown = createButtonDropdown( model, buttons, locale );
 *
 *		// Will render a vertucak button dropdown labeled "A button dropdown"
 *		// with a button group in the panel containing two buttons.
 *		dropdown.render()
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * See {@link module:ui/dropdown/createdropdown~createDropdown} and {@link module:ui/buttongroup/buttongroup~ButtonGroup}.
 *
 * @param {module:ui/dropdown/button/buttondropdownmodel~ButtonDropdownModel} model Model of the list dropdown.
 * @param {Array.<module:ui/button/buttonview~ButtonView>} buttonViews List of buttons to be included in dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/button/buttondropdownview~ButtonDropdownView} The button dropdown view instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView}
 */
export default function createButtonDropdown( model, buttonViews, locale ) {
	// Make disabled when all buttons are disabled
	model.bind( 'isEnabled' ).to(
		// Bind to #isEnabled of each command...
		...getBindingTargets( buttonViews, 'isEnabled' ),
		// ...and set it true if any command #isEnabled is true.
		( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
	);

	// Make dropdown icon as any active button.
	model.bind( 'icon' ).to(
		// Bind to #isOn of each button...
		...getBindingTargets( buttonViews, 'isOn' ),
		// ...and chose the title of the first one which #isOn is true.
		( ...areActive ) => {
			const index = areActive.findIndex( value => value );

			// If none of the commands is active, display first icon.
			// TODO: make this configurable (defaultIcon)
			return buttonViews[ index < 0 ? 0 : index ].icon;
		}
	);

	const dropdownView = createDropdown( model, locale );

	const buttonGroupView = dropdownView.buttonGroupView = new ButtonGroupView(
		buttonViews,
		{
			isVertical: model.isVertical
		}
	);

	dropdownView.panelView.children.add( buttonGroupView );

	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView, buttonGroupView.items );
	openDropdownOnArrows( dropdownView, buttonGroupView );

	return dropdownView;
}

function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
