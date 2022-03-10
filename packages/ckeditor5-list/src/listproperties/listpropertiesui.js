/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/listpropertiesui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, SplitButtonView, createDropdown } from 'ckeditor5/src/ui';

import ListPropertiesView from './ui/listpropertiesview';

import bulletedListIcon from '../../theme/icons/bulletedlist.svg';
import numberedListIcon from '../../theme/icons/numberedlist.svg';

import listStyleDiscIcon from '../../theme/icons/liststyledisc.svg';
import listStyleCircleIcon from '../../theme/icons/liststylecircle.svg';
import listStyleSquareIcon from '../../theme/icons/liststylesquare.svg';
import listStyleDecimalIcon from '../../theme/icons/liststyledecimal.svg';
import listStyleDecimalWithLeadingZeroIcon from '../../theme/icons/liststyledecimalleadingzero.svg';
import listStyleLowerRomanIcon from '../../theme/icons/liststylelowerroman.svg';
import listStyleUpperRomanIcon from '../../theme/icons/liststyleupperroman.svg';
import listStyleLowerLatinIcon from '../../theme/icons/liststylelowerlatin.svg';
import listStyleUpperLatinIcon from '../../theme/icons/liststyleupperlatin.svg';

import '../../theme/liststyles.css';

/**
 * The list properties UI plugin. It introduces the extended `'bulletedList'` and `'numberedList'` toolbar
 * buttons that allow users to control such aspects of list as the marker, start index or order.
 *
 * **Note**: Buttons introduced by this plugin override implementations from the {@link module:list/list/listui~ListUI}
 * (because they share the same names).
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListPropertiesUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListPropertiesUI';
	}

	init() {
		const editor = this.editor;
		const t = editor.locale.t;
		const enabledProperties = editor.config.get( 'list.properties' );

		// Note: When this plugin does not register the "bulletedList" dropdown due to properties configuration,
		// a simple button will be still registered under the same name by ListUI as a fallback. This should happen
		// in most editor configuration because the List plugin automatically requires ListUI.
		if ( enabledProperties.styles ) {
			editor.ui.componentFactory.add( 'bulletedList', getDropdownViewCreator( {
				editor,
				parentCommandName: 'bulletedList',
				buttonLabel: t( 'Bulleted List' ),
				buttonIcon: bulletedListIcon,
				styleGridAriaLabel: t( 'Bulleted list styles toolbar' ),
				styleDefinitions: [
					{
						label: t( 'Toggle the disc list style' ),
						tooltip: t( 'Disc' ),
						type: 'disc',
						icon: listStyleDiscIcon
					},
					{
						label: t( 'Toggle the circle list style' ),
						tooltip: t( 'Circle' ),
						type: 'circle',
						icon: listStyleCircleIcon
					},
					{
						label: t( 'Toggle the square list style' ),
						tooltip: t( 'Square' ),
						type: 'square',
						icon: listStyleSquareIcon
					}
				]
			} ) );
		}

		// Note: When this plugin does not register the "numberedList" dropdown due to properties configuration,
		// a simple button will be still registered under the same name by ListUI as a fallback. This should happen
		// in most editor configuration because the List plugin automatically requires ListUI.
		if ( enabledProperties.styles || enabledProperties.startIndex || enabledProperties.reversed ) {
			editor.ui.componentFactory.add( 'numberedList', getDropdownViewCreator( {
				editor,
				parentCommandName: 'numberedList',
				buttonLabel: t( 'Numbered List' ),
				buttonIcon: numberedListIcon,
				styleGridAriaLabel: t( 'Numbered list styles toolbar' ),
				styleDefinitions: [
					{
						label: t( 'Toggle the decimal list style' ),
						tooltip: t( 'Decimal' ),
						type: 'decimal',
						icon: listStyleDecimalIcon
					},
					{
						label: t( 'Toggle the decimal with leading zero list style' ),
						tooltip: t( 'Decimal with leading zero' ),
						type: 'decimal-leading-zero',
						icon: listStyleDecimalWithLeadingZeroIcon
					},
					{
						label: t( 'Toggle the lower–roman list style' ),
						tooltip: t( 'Lower–roman' ),
						type: 'lower-roman',
						icon: listStyleLowerRomanIcon
					},
					{
						label: t( 'Toggle the upper–roman list style' ),
						tooltip: t( 'Upper-roman' ),
						type: 'upper-roman',
						icon: listStyleUpperRomanIcon
					},
					{
						label: t( 'Toggle the lower–latin list style' ),
						tooltip: t( 'Lower-latin' ),
						type: 'lower-latin',
						icon: listStyleLowerLatinIcon
					},
					{
						label: t( 'Toggle the upper–latin list style' ),
						tooltip: t( 'Upper-latin' ),
						type: 'upper-latin',
						icon: listStyleUpperLatinIcon
					}
				]
			} ) );
		}
	}
}

// A helper that returns a function that creates a split button with a toolbar in the dropdown,
// which in turn contains buttons allowing users to change list styles in the context of the current selection.
//
// @param {Object} options
// @param {module:core/editor/editor~Editor} options.editor
// @param {'bulletedList'|'numberedList'} options.parentCommandName The name of the higher-order editor command associated with
// the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
// @param {String} options.buttonLabel Label of the main part of the split button.
// @param {String} options.buttonIcon The SVG string of an icon for the main part of the split button.
// @param {String} options.styleGridAriaLabel The ARIA label for the styles grid in the split button dropdown.
// @param {Object} options.styleDefinitions Definitions of the style buttons.
// @returns {Function} A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
function getDropdownViewCreator( { editor, parentCommandName, buttonLabel, buttonIcon, styleGridAriaLabel, styleDefinitions } ) {
	const parentCommand = editor.commands.get( parentCommandName );

	// @param {module:utils/locale~Locale} locale
	// @returns {module:ui/dropdown/dropdownview~DropdownView}
	return locale => {
		const dropdownView = createDropdown( locale, SplitButtonView );
		const mainButtonView = dropdownView.buttonView;

		dropdownView.bind( 'isEnabled' ).to( parentCommand );
		dropdownView.class = 'ck-list-styles-dropdown';

		// Main button was clicked.
		mainButtonView.on( 'execute', () => {
			editor.execute( parentCommandName );
			editor.editing.view.focus();
		} );

		mainButtonView.set( {
			label: buttonLabel,
			icon: buttonIcon,
			tooltip: true,
			isToggleable: true
		} );

		mainButtonView.bind( 'isOn' ).to( parentCommand, 'value', value => !!value );

		const listPropertiesView = createListPropertiesView( {
			editor,
			dropdownView,
			parentCommandName,
			styleGridAriaLabel,
			styleDefinitions
		} );

		dropdownView.panelView.children.add( listPropertiesView );

		return dropdownView;
	};
}

// A helper that returns a function (factory) that creates individual buttons used by users to change styles
// of lists.
//
// @param {Object} options
// @param {module:core/editor/editor~Editor} options.editor
// @param {module:list/liststylecommand~ListStylesCommand} options.listStyleCommand The instance of the `ListStylesCommand` class.
// @param {'bulletedList'|'numberedList'} options.parentCommandName The name of the higher-order command associated with a
// particular list style (e.g. "bulletedList" is associated with "square" and "numberedList" is associated with "roman").
// @returns {Function} A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
function getStyleButtonCreator( { editor, listStyleCommand, parentCommandName } ) {
	const locale = editor.locale;
	const parentCommand = editor.commands.get( parentCommandName );

	// @param {String} label The label of the style button.
	// @param {String} type The type of the style button (e.g. "roman" or "circle").
	// @param {String} icon The SVG string of an icon of the style button.
	// @param {String} tooltip The tooltip text of the button (shorter than verbose label).
	// @returns {module:ui/button/buttonview~ButtonView}
	return ( { label, type, icon, tooltip } ) => {
		const button = new ButtonView( locale );

		button.set( { label, icon, tooltip } );

		listStyleCommand.on( 'change:value', () => {
			button.isOn = listStyleCommand.value === type;
		} );

		button.on( 'execute', () => {
			// If the content the selection is anchored to is a list, let's change its style.
			if ( parentCommand.value ) {
				// If the current list style is not set in the model or the style is different than the
				// one to be applied, simply apply the new style.
				if ( listStyleCommand.value !== type ) {
					editor.execute( 'listStyle', { type } );
				}
				// If the style was the same, remove it (the button works as an off toggle).
				else {
					editor.execute( 'listStyle', { type: listStyleCommand._defaultType } );
				}
			}
			// Otherwise, leave the creation of the styled list to the `ListStyleCommand`.
			else {
				editor.model.change( () => {
					editor.execute( 'listStyle', { type } );
				} );
			}

			editor.editing.view.focus();
		} );

		return button;
	};
}

// A helper that creates the properties view for the individual style dropdown.
//
// @param {Object} options
// @param {module:core/editor/editor~Editor} options.editor Editor instance.
// @param {module:ui/dropdown/dropdownview~DropdownView} options.dropdownView Styles dropdown view that hosts the properties view.
// @param {'bulletedList'|'numberedList'} options.parentCommandName The name of the higher-order editor command associated with
// the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
// @param {Object} options.styleDefinitions Definitions of the style buttons.
// @param {String} options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
// @returns {module:list/ui/listpropertiesview~ListPropertiesView}
function createListPropertiesView( {
	editor,
	dropdownView,
	parentCommandName,
	styleDefinitions,
	styleGridAriaLabel
} ) {
	const locale = editor.locale;
	const enabledProperties = editor.config.get( 'list.properties' );
	let styleButtonViews;

	if ( parentCommandName != 'numberedList' ) {
		enabledProperties.startIndex = false;
		enabledProperties.reversed = false;
	}

	if ( enabledProperties.styles ) {
		const listStyleCommand = editor.commands.get( 'listStyle' );

		const styleButtonCreator = getStyleButtonCreator( {
			editor,
			parentCommandName,
			listStyleCommand
		} );

		styleButtonViews = styleDefinitions.map( styleButtonCreator );
	}

	const listPropertiesView = new ListPropertiesView( locale, {
		styleGridAriaLabel,
		enabledProperties,
		styleButtonViews
	} );

	if ( enabledProperties.startIndex ) {
		const listStartCommand = editor.commands.get( 'listStart' );

		listPropertiesView.startIndexFieldView.bind( 'isEnabled' ).to( listStartCommand );
		listPropertiesView.startIndexFieldView.fieldView.bind( 'value' ).to( listStartCommand );
		listPropertiesView.on( 'listStart', ( evt, data ) => editor.execute( 'listStart', data ) );
	}

	if ( enabledProperties.reversed ) {
		const listReversedCommand = editor.commands.get( 'listReversed' );

		listPropertiesView.reversedSwitchButtonView.bind( 'isEnabled' ).to( listReversedCommand );
		listPropertiesView.reversedSwitchButtonView.bind( 'isOn' ).to( listReversedCommand, 'value' );
		listPropertiesView.on( 'listReversed', () => {
			const isReversed = listReversedCommand.value;

			editor.execute( 'listReversed', { reversed: !isReversed } );
		} );
	}

	// Make sure applying styles closes the dropdown.
	listPropertiesView.delegate( 'execute' ).to( dropdownView );

	return listPropertiesView;
}
