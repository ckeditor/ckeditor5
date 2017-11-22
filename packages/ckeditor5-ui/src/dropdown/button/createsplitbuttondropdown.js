/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/button/createsplitbuttondropdown
 */

// TODO: import createDropdown from '../createdropdown';
import SplitButtonView from '../../button/splitbuttonview';
import DropdownView from '../dropdownview';
import DropdownPanelView from '../dropdownpanelview';

import ButtonGroupView from '../../buttongroup/buttongroupview';
import { closeDropdownOnBlur, closeDropdownOnExecute, openDropdownOnArrows } from '../utils';

/**
 * TODO
 */
export default function createSplitButtonDropdown( model, buttonViews, locale, startButton ) {
	// // Make disabled when all buttons are disabled
	model.bind( 'isEnabled' ).to(
		// Bind to #isEnabled of each command...
		...getBindingTargets( buttonViews, 'isEnabled' ),
		// ...and set it true if any command #isEnabled is true.
		( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
	);

	const splitButtonView = new SplitButtonView( locale, startButton );

	splitButtonView.bind( 'label', 'isOn', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );

	const panelView = new DropdownPanelView( locale );

	const dropdownView = new DropdownView( locale, splitButtonView, panelView );
	// END of TODO

	const buttonGroupView = dropdownView.buttonGroupView = new ButtonGroupView( { isVertical: model.isVertical } );

	buttonGroupView.bind( 'isVertical' ).to( model, 'isVertical' );

	buttonViews.map( view => buttonGroupView.items.add( view ) );

	dropdownView.extendTemplate( {
		attributes: {
			class: [
				'ck-splitbutton-dropdown'
			]
		}
	} );

	dropdownView.buttonView.extendTemplate( {
		attributes: {
			class: [ 'ck-button-dropdown' ]
		}
	} );

	dropdownView.panelView.children.add( buttonGroupView );

	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView, buttonGroupView.items );
	openDropdownOnArrows( dropdownView, buttonGroupView );

	return dropdownView;
}

function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
