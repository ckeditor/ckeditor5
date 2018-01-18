/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/button/createbuttondropdown
 */

import ToolbarView from '../../toolbar/toolbarview';
import {
	closeDropdownOnBlur,
	closeDropdownOnExecute,
	createButtonForDropdown,
	createDropdownView,
	focusDropdownContentsOnArrows
} from '../utils';

import '../../../theme/components/dropdown/buttondropdown.css';

/**
 * Creates an instance of {@link module:ui/dropdown/button/buttondropdownview~ButtonDropdownView} class using
 * a provided {@link module:ui/dropdown/button/buttondropdownmodel~ButtonDropdownModel}.
 *
 *		const buttons = [];
 *
 *		buttons.push( new ButtonView() );
 *		buttons.push( editor.ui.componentFactory.get( 'someButton' ) );
 *
 *		const model = new Model( {
 *			label: 'A button dropdown',
 *			isVertical: true,
 *			buttons
 *		} );
 *
 *		const dropdown = createButtonDropdown( model, locale );
 *
 *		// Will render a vertical button dropdown labeled "A button dropdown"
 *		// with a button group in the panel containing two buttons.
 *		dropdown.render()
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * See {@link module:ui/dropdown/createdropdown~createDropdown}.
 *
 * @param {module:ui/dropdown/button/buttondropdownmodel~ButtonDropdownModel} model Model of the list dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/button/buttondropdownview~ButtonDropdownView} The button dropdown view instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView}
 */
export default function createButtonDropdown( model, locale ) {
	// Make disabled when all buttons are disabled
	model.bind( 'isEnabled' ).to(
		// Bind to #isEnabled of each command...
		...getBindingTargets( model.buttons, 'isEnabled' ),
		// ...and set it true if any command #isEnabled is true.
		( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
	);

	// If defined `staticIcon` use the `defaultIcon` without binding it to active a button.
	if ( model.staticIcon ) {
		model.bind( 'icon' ).to( model, 'defaultIcon' );
	} else {
		// TODO: move to alignment
		// Make dropdown icon as any active button.
		model.bind( 'icon' ).to(
			// Bind to #isOn of each button...
			...getBindingTargets( model.buttons, 'isOn' ),
			// ...and chose the title of the first one which #isOn is true.
			( ...areActive ) => {
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display either defaultIcon or first button icon.
				if ( index < 0 && model.defaultIcon ) {
					return model.defaultIcon;
				}

				return model.buttons[ index < 0 ? 0 : index ].icon;
			}
		);
	}
	const buttonView = createButtonForDropdown( model, locale );
	const dropdownView = createDropdownView( model, buttonView, locale );

	const toolbarView = dropdownView.toolbarView = new ToolbarView();

	toolbarView.bind( 'isVertical', 'className' ).to( model, 'isVertical', 'toolbarClassName' );

	model.buttons.map( view => toolbarView.items.add( view ) );

	// TODO: better:
	dropdownView.buttonView.delegate( 'execute' ).to( dropdownView.buttonView, 'select' );

	dropdownView.extendTemplate( {
		attributes: {
			class: [ 'ck-buttondropdown' ]
		}
	} );

	dropdownView.panelView.children.add( toolbarView );

	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView, toolbarView.items );
	focusDropdownContentsOnArrows( dropdownView, toolbarView );

	return dropdownView;
}

// Returns an array of binding components for
// {@link module:utils/observablemixin~Observable#bind} from a set of iterable
// buttons.
//
// @private
// @param {Iterable.<module:ui/button/buttonview~ButtonView>} buttons
// @param {String} attribute
// @returns {Array.<String>}
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
