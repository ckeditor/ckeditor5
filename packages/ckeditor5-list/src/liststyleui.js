/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import {
	createDropdown,
	addToolbarToDropdown
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import bulletedListIcon from '../theme/icons/bulletedlist.svg';
import numberedListIcon from '../theme/icons/numberedlist.svg';

import listStyleDiscIcon from '../theme/icons/liststyledisc.svg';
import listStyleCircleIcon from '../theme/icons/liststylecircle.svg';
import listStyleSquareIcon from '../theme/icons/liststylesquare.svg';
import listStyleDecimalIcon from '../theme/icons/liststyledecimal.svg';
import listStyleDecimalWithLeadingZeroIcon from '../theme/icons/liststyledecimalleadingzero.svg';
import listStyleLowerRomanIcon from '../theme/icons/liststylelowerroman.svg';
import listStyleUpperRomanIcon from '../theme/icons/liststyleupperroman.svg';
import listStyleLowerLatinIcon from '../theme/icons/liststylelowerlatin.svg';
import listStyleUpperLatinIcon from '../theme/icons/liststyleupperlatin.svg';

import '../theme/liststyles.css';

/**
 * The list style UI plugin. It introduces the extended `'bulletedList'` and `'numberedList'` toolbar
 * buttons that allow users to change styles of individual lists in the content.
 *
 * **Note**: Buttons introduced by this plugin override implementations from the {@link module:list/listui~ListUI}
 * (because they share the same names).
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListStyleUI';
	}

	init() {
		const editor = this.editor;
		const t = editor.locale.t;

		editor.ui.componentFactory.add( 'bulletedList', getSplitButtonCreator( {
			editor,
			parentCommandName: 'bulletedList',
			buttonLabel: t( 'Bulleted List' ),
			buttonIcon: bulletedListIcon,
			toolbarAriaLabel: t( 'Bulleted list styles toolbar' ),
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

		editor.ui.componentFactory.add( 'numberedList', getSplitButtonCreator( {
			editor,
			parentCommandName: 'numberedList',
			buttonLabel: t( 'Numbered List' ),
			buttonIcon: numberedListIcon,
			toolbarAriaLabel: t( 'Numbered list styles toolbar' ),
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

// A helper that returns a function that creates a split button with a toolbar in the dropdown,
// which in turn contains buttons allowing users to change list styles in the context of the current selection.
//
// @param {Object} options
// @param {module:core/editor/editor~Editor} options.editor
// @param {'bulletedList'|'numberedList'} options.parentCommandName The name of the higher-order editor command associated with
// the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
// @param {String} options.buttonLabel Label of the main part of the split button.
// @param {String} options.buttonIcon The SVG string of an icon for the main part of the split button.
// @param {String} options.toolbarAriaLabel The ARIA label for the toolbar in the split button dropdown.
// @param {Object} options.styleDefinitions Definitions of the style buttons.
// @returns {Function} A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
function getSplitButtonCreator( { editor, parentCommandName, buttonLabel, buttonIcon, toolbarAriaLabel, styleDefinitions } ) {
	const parentCommand = editor.commands.get( parentCommandName );
	const listStyleCommand = editor.commands.get( 'listStyle' );

	// @param {module:utils/locale~Locale} locale
	// @returns {module:ui/dropdown/dropdownview~DropdownView}
	return locale => {
		const dropdownView = createDropdown( locale, SplitButtonView );
		const splitButtonView = dropdownView.buttonView;
		const styleButtonCreator = getStyleButtonCreator( { editor, parentCommandName, listStyleCommand } );

		addToolbarToDropdown( dropdownView, styleDefinitions.map( styleButtonCreator ) );

		dropdownView.bind( 'isEnabled' ).to( parentCommand );
		dropdownView.toolbarView.ariaLabel = toolbarAriaLabel;
		dropdownView.class = 'ck-list-styles-dropdown';

		splitButtonView.on( 'execute', () => {
			editor.execute( parentCommandName );
			editor.editing.view.focus();
		} );

		splitButtonView.set( {
			label: buttonLabel,
			icon: buttonIcon,
			tooltip: true,
			isToggleable: true
		} );

		splitButtonView.bind( 'isOn' ).to( parentCommand, 'value', value => !!value );

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
			// If the content the selection is anchored to is not a list, let's create a list of a desired style.
			else {
				editor.model.change( () => {
					editor.execute( parentCommandName );
					editor.execute( 'listStyle', { type } );
				} );
			}

			editor.editing.view.focus();
		} );

		return button;
	};
}
