/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/utils
 */

import clickOutsideHandler from '../bindings/clickoutsidehandler';
import SplitButtonView from '../button/splitbuttonview';
import ButtonView from '../button/buttonview';
import DropdownPanelView from './dropdownpanelview';
import DropdownView from './dropdownview';
import ToolbarView from '../toolbar/toolbarview';
import ListView from '../list/listview';
import ListItemView from '../list/listitemview';

// TODO: This should be per-component import AFAIK. It will result in smaller builds that don't use dropdown with toolbar.
import '../../theme/components/dropdown/toolbardropdown.css';

/**
 * Adds a behavior to a dropdownView that focuses dropdown panel view contents on keystrokes.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export function focusDropdownContentsOnArrows( dropdownView ) {
	// If the dropdown panel is already open, the arrow down key should
	// focus the first element in list.
	dropdownView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focus();
			cancel();
		}
	} );

	// If the dropdown panel is already open, the arrow up key should
	// focus the last element in the list.
	dropdownView.keystrokes.set( 'arrowup', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focusLast();
			cancel();
		}
	} );
}

/**
 * Adds a behavior to a dropdownView that closes dropdown view on any view collection item's "execute" event.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export function closeDropdownOnExecute( dropdownView ) {
	// Close the dropdown when one of the list items has been executed.
	dropdownView.on( 'execute', () => {
		dropdownView.isOpen = false;
	} );
}

/**
 * Adds a behavior to a dropdownView that closes opened dropdown on user click outside the dropdown.
 *
 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
 */
export function closeDropdownOnBlur( dropdownView ) {
	dropdownView.on( 'render', () => {
		clickOutsideHandler( {
			emitter: dropdownView,
			activator: () => dropdownView.isOpen,
			callback: () => {
				dropdownView.isOpen = false;
			},
			contextElements: [ dropdownView.element ]
		} );
	} );
}

/** TODO: new methods below - refactor to own files later */

export function createButtonForDropdown( model, locale ) {
	const buttonView = new ButtonView( locale );

	// Dropdown expects "select" event to show contents.
	buttonView.delegate( 'execute' ).to( buttonView, 'select' );

	return buttonView;
}

export function createSplitButtonForDropdown( model, locale ) {
	const splitButtonView = new SplitButtonView( locale );

	// TODO: something wierd with binding
	splitButtonView.actionView.bind( 'isOn' ).to( splitButtonView );
	splitButtonView.actionView.bind( 'tooltip' ).to( splitButtonView );

	return splitButtonView;
}

export function createDropdownView( model, buttonView, locale ) {
	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	dropdownView.bind( 'isEnabled' ).to( model );

	// TODO: check 'isOn' binding.
	buttonView.bind( 'label', 'isEnabled', 'withText', 'keystroke', 'tooltip', 'icon' ).to( model );
	buttonView.bind( 'isOn' ).to( model, 'isOn', dropdownView, 'isOpen', ( isOn, isOpen ) => {
		return isOn || isOpen;
	} );

	return dropdownView;
}

export function createSplitButtonDropdown( model, locale ) {
	const splitButtonView = createSplitButtonForDropdown( model, locale );
	const dropdownView = createDropdownView( model, splitButtonView, locale );

	// Extend template to hide arrow from dropdown.
	// TODO: enable this on normal button instead of hiding it
	dropdownView.extendTemplate( {
		attributes: {
			class: 'ck-splitbutton-dropdown'
		}
	} );

	return dropdownView;
}

export function createSingleButtonDropdown( model, locale ) {
	const buttonView = createButtonForDropdown( model, locale );

	return createDropdownView( model, buttonView, locale );
}

export function enableModelIfOneIsEnabled( model, observables ) {
	model.bind( 'isEnabled' ).to(
		// Bind to #isEnabled of each observable...
		...getBindingTargets( observables, 'isEnabled' ),
		// ...and set it true if any observable #isEnabled is true.
		( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
	);
}

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
export function addListViewToDropdown( dropdownView, model, locale ) {
	const listView = dropdownView.listView = new ListView( locale );

	// TODO: make this param of method instead of model property
	listView.items.bindTo( model.items ).using( itemModel => {
		const item = new ListItemView( locale );

		// Bind all attributes of the model to the item view.
		item.bind( ...Object.keys( itemModel ) ).to( itemModel );

		return item;
	} );

	dropdownView.panelView.children.add( listView );

	// TODO: make this also on toolbar????
	listView.items.delegate( 'execute' ).to( dropdownView );

	return listView;
}

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
export function addToolbarToDropdown( dropdownView, model ) {
	const toolbarView = dropdownView.toolbarView = new ToolbarView();

	toolbarView.bind( 'isVertical' ).to( model, 'isVertical' );

	dropdownView.extendTemplate( {
		attributes: {
			class: [ 'ck-toolbar-dropdown' ]
		}
	} );

	dropdownView.panelView.children.add( toolbarView );

	// TODO: make it as 'items', 'views' or pass them as parameter???
	model.buttons.map( view => toolbarView.items.add( view ) );

	return toolbarView;
}

export function addDefaultBehavior( dropdownView ) {
	closeDropdownOnBlur( dropdownView );
	closeDropdownOnExecute( dropdownView );
	focusDropdownContentsOnArrows( dropdownView );
}

// Returns an array of binding components for
// {@link module:utils/observablemixin~Observable#bind} from a set of iterable
// buttons.
//
// @private
// @param {Iterable.<module:ui/button/buttonview~ButtonView>} buttons
// @param {String} attribute
// @returns {Array.<String>}
export function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}

/**
 * A helper which creates an instance of {@link module:ui/dropdown/dropdownview~DropdownView} class using
 * a provided {@link module:ui/dropdown/dropdownmodel~DropdownModel}.
 *
 *		const model = new Model( {
 *			label: 'A dropdown',
 *			isEnabled: true,
 *			isOn: false,
 *			withText: true
 *		} );
 *
 *		const dropdown = createDropdown( model );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown labeled "A dropdown" with an empty panel.
 *		document.body.appendChild( dropdown.element );
 *
 * The model instance remains in control of the dropdown after it has been created. E.g. changes to the
 * {@link module:ui/dropdown/dropdownmodel~DropdownModel#label `model.label`} will be reflected in the
 * dropdown button's {@link module:ui/button/buttonview~ButtonView#label} attribute and in DOM.
 *
 * Also see {@link module:ui/dropdown/list/createlistdropdown~createListDropdown}.
 *
 * @param {module:ui/dropdown/dropdownmodel~DropdownModel} model Model of this dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/dropdownview~DropdownView} The dropdown view instance.
 */
