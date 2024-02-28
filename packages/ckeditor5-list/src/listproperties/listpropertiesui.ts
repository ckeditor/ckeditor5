/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/listpropertiesui
 */

import { icons, Plugin, type Editor } from 'ckeditor5/src/core.js';

import {
	ButtonView,
	SplitButtonView,
	createDropdown,
	focusChildOnDropdownOpen,
	type DropdownView,
	MenuBarMenuView,
	MenuBarMenuListView,
	MenuBarMenuListItemView,
	MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';

import type { Locale } from 'ckeditor5/src/utils.js';

import ListPropertiesView from './ui/listpropertiesview.js';

import type LegacyListStyleCommand from '../legacylistproperties/legacyliststylecommand.js';
import type ListStyleCommand from '../listproperties/liststylecommand.js';
import type LegacyListStartCommand from '../legacylistproperties/legacyliststartcommand.js';
import type ListStartCommand from '../listproperties/liststartcommand.js';
import type LegacyListReversedCommand from '../legacylistproperties/legacylistreversedcommand.js';
import type ListReversedCommand from '../listproperties/listreversedcommand.js';

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
 */
export default class ListPropertiesUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListPropertiesUI' as const;
	}

	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const enabledProperties = editor.config.get( 'list.properties' )!;

		// Note: When this plugin does not register the "bulletedList" dropdown due to properties configuration,
		// a simple button will be still registered under the same name by ListUI as a fallback. This should happen
		// in most editor configuration because the List plugin automatically requires ListUI.
		if ( enabledProperties.styles ) {
			const styleDefinitions = [
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
			];
			const buttonLabel = t( 'Bulleted list' );
			const commandName = 'bulletedList';

			editor.ui.componentFactory.add( commandName, getDropdownViewCreator( {
				editor,
				parentCommandName: commandName,
				buttonLabel,
				buttonIcon: icons.bulletedList,
				styleGridAriaLabel: t( 'Bulleted list styles toolbar' ),
				styleDefinitions
			} ) );

			// Add menu item for bulleted list.
			createMenuItem( editor, commandName, buttonLabel, t( 'Bulleted' ), styleDefinitions );
		}

		// Note: When this plugin does not register the "numberedList" dropdown due to properties configuration,
		// a simple button will be still registered under the same name by ListUI as a fallback. This should happen
		// in most editor configuration because the List plugin automatically requires ListUI.
		if ( enabledProperties.styles || enabledProperties.startIndex || enabledProperties.reversed ) {
			const styleDefinitions = [
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
			];
			const buttonLabel = t( 'Numbered list' );
			const commandName = 'numberedList';

			editor.ui.componentFactory.add( commandName, getDropdownViewCreator( {
				editor,
				parentCommandName: commandName,
				buttonLabel,
				buttonIcon: icons.numberedList,
				styleGridAriaLabel: t( 'Numbered list styles toolbar' ),
				styleDefinitions
			} ) );

			// Add menu item for numbered list.
			createMenuItem( editor, commandName, buttonLabel, t( 'Numbered' ), styleDefinitions );
		}
	}
}

/**
 * A helper that returns a function that creates a split button with a toolbar in the dropdown,
 * which in turn contains buttons allowing users to change list styles in the context of the current selection.
 *
 * @param options.editor
 * @param options.parentCommandName The name of the higher-order editor command associated with
 * the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
 * @param options.buttonLabel Label of the main part of the split button.
 * @param options.buttonIcon The SVG string of an icon for the main part of the split button.
 * @param options.styleGridAriaLabel The ARIA label for the styles grid in the split button dropdown.
 * @param options.styleDefinitions Definitions of the style buttons.
 * @returns A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
 */
function getDropdownViewCreator( {
	editor,
	parentCommandName,
	buttonLabel,
	buttonIcon,
	styleGridAriaLabel,
	styleDefinitions
}: {
	editor: Editor;
	parentCommandName: string;
	buttonLabel: string;
	buttonIcon: string;
	styleGridAriaLabel: string;
	styleDefinitions: Array<StyleDefinition>;
} ) {
	const parentCommand = editor.commands.get( parentCommandName )!;

	return ( locale: Locale ) => {
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

		dropdownView.once( 'change:isOpen', () => {
			const listPropertiesView = createListPropertiesView( {
				editor,
				dropdownView,
				parentCommandName,
				styleGridAriaLabel,
				styleDefinitions
			} );

			dropdownView.panelView.children.add( listPropertiesView );
		} );

		// Focus the editable after executing the command.
		// Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
		dropdownView.on( 'execute', () => {
			editor.editing.view.focus();
		} );

		return dropdownView;
	};
}

/**
 * A helper that returns a function (factory) that creates individual buttons used by users to change styles
 * of lists.
 *
 * @param options.editor
 * @param options.listStyleCommand The instance of the `ListStylesCommand` class.
 * @param options.parentCommandName The name of the higher-order command associated with a
 * particular list style (e.g. "bulletedList" is associated with "square" and "numberedList" is associated with "roman").
 * @returns A function that can be passed straight into {@link module:ui/componentfactory~ComponentFactory#add}.
 */
function getStyleButtonCreator( {
	editor,
	listStyleCommand,
	parentCommandName
}: {
	editor: Editor;
	listStyleCommand: LegacyListStyleCommand | ListStyleCommand;
	parentCommandName: string;
} ) {
	const locale = editor.locale;
	const parentCommand = editor.commands.get( parentCommandName )!;

	return ( { label, type, icon, tooltip }: StyleDefinition ) => {
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
					editor.execute( 'listStyle', { type: listStyleCommand.defaultType } );
				}
			}
			// Otherwise, leave the creation of the styled list to the `ListStyleCommand`.
			else {
				editor.model.change( () => {
					editor.execute( 'listStyle', { type } );
				} );
			}
		} );

		return button;
	};
}

/**
 * A helper that creates the properties view for the individual style dropdown.
 *
 * @param options.editor Editor instance.
 * @param options.dropdownView Styles dropdown view that hosts the properties view.
 * @param options.parentCommandName The name of the higher-order editor command associated with
 * the set of particular list styles (e.g. "bulletedList" for "disc", "circle", and "square" styles).
 * @param options.styleDefinitions Definitions of the style buttons.
 * @param options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
 */
function createListPropertiesView( {
	editor,
	dropdownView,
	parentCommandName,
	styleDefinitions,
	styleGridAriaLabel
}: {
	editor: Editor;
	dropdownView: DropdownView;
	parentCommandName: string;
	styleDefinitions: Array<StyleDefinition>;
	styleGridAriaLabel: string;
} ) {
	const locale = editor.locale;
	const enabledProperties = editor.config.get( 'list.properties' )!;
	let styleButtonViews = null;

	if ( parentCommandName != 'numberedList' ) {
		enabledProperties.startIndex = false;
		enabledProperties.reversed = false;
	}

	if ( enabledProperties.styles ) {
		const listStyleCommand: LegacyListStyleCommand | ListStyleCommand = editor.commands.get( 'listStyle' )!;

		const styleButtonCreator = getStyleButtonCreator( {
			editor,
			parentCommandName,
			listStyleCommand
		} );

		// The command can be ListStyleCommand or DocumentListStyleCommand.
		const isStyleTypeSupported = typeof listStyleCommand.isStyleTypeSupported == 'function' ?
			( styleDefinition: StyleDefinition ) => listStyleCommand.isStyleTypeSupported( styleDefinition.type ) :
			() => true;

		styleButtonViews = styleDefinitions.filter( isStyleTypeSupported ).map( styleButtonCreator );
	}

	const listPropertiesView = new ListPropertiesView( locale, {
		styleGridAriaLabel,
		enabledProperties,
		styleButtonViews
	} );

	if ( enabledProperties.styles ) {
		// Accessibility: focus the first active style when opening the dropdown.
		focusChildOnDropdownOpen( dropdownView, () => {
			return listPropertiesView.stylesView!.children.find( ( child: any ) => child.isOn );
		} );
	}

	if ( enabledProperties.startIndex ) {
		const listStartCommand: LegacyListStartCommand | ListStartCommand = editor.commands.get( 'listStart' )!;

		listPropertiesView.startIndexFieldView!.bind( 'isEnabled' ).to( listStartCommand );
		listPropertiesView.startIndexFieldView!.fieldView.bind( 'value' ).to( listStartCommand as any );
		listPropertiesView.on( 'listStart', ( evt, data ) => editor.execute( 'listStart', data ) );
	}

	if ( enabledProperties.reversed ) {
		const listReversedCommand: LegacyListReversedCommand | ListReversedCommand = editor.commands.get( 'listReversed' )!;

		listPropertiesView.reversedSwitchButtonView!.bind( 'isEnabled' ).to( listReversedCommand );
		listPropertiesView.reversedSwitchButtonView!.bind( 'isOn' ).to( listReversedCommand, 'value', value => !!value );
		listPropertiesView.on( 'listReversed', () => {
			const isReversed = listReversedCommand.value;

			editor.execute( 'listReversed', { reversed: !isReversed } );
		} );
	}

	// Make sure applying styles closes the dropdown.
	listPropertiesView.delegate( 'execute' ).to( dropdownView );

	return listPropertiesView;
}

/**
 * A helper that creates the list style submenu for menu bar.
 *
 * @param editor Editor instance.
 * @param commandName Name of the list command.
 * @param mainItemLabel Short list type name.
 * @param defaultStyleLabel Label for `default` list style.
 * @param styleDefinitions Array of avaialble styles for processed list type.
 */
function createMenuItem(
	editor: Editor,
	commandName: 'bulletedList' | 'numberedList',
	mainItemLabel: string,
	defaultStyleLabel: string,
	styleDefinitions: Array<StyleDefinition>
) {
	editor.ui.componentFactory.add( `menuBar:${ commandName }`, locale => {
		const menuView = new MenuBarMenuView( locale );
		const listCommand = editor.commands.get( commandName )!;
		const listStyleCommand = editor.commands.get( 'listStyle' )!;
		const listView = new MenuBarMenuListView( locale );

		menuView.buttonView.set( {
			label: mainItemLabel,
			icon: icons[ commandName ]
		} );

		menuView.panelView.children.add( listView );

		const options = [
			{
				tooltip: defaultStyleLabel,
				type: 'default',
				icon: icons[ commandName ]
			},
			...styleDefinitions
		];

		for ( const option of options ) {
			const listItemView = new MenuBarMenuListItemView( locale, menuView );
			const buttonView = new MenuBarMenuListItemButtonView( locale );

			listItemView.children.add( buttonView );
			listView.items.add( listItemView );

			buttonView.set( {
				label: option.tooltip,
				// role: 'menuitemradio',
				icon: option.icon
			} );

			buttonView.delegate( 'execute' ).to( menuView );

			// Keep current list option highlighted.
			listStyleCommand.on( 'change:value', () => {
				buttonView.isOn = listStyleCommand.value === option.type &&
					listCommand.value === true;
			} );
			listCommand.on( 'change:value', () => {
				buttonView.isOn = listStyleCommand.value === option.type &&
					listCommand.value === true;
			} );

			buttonView.on( 'execute', () => {
				// If current list style is selected, execute main list command to remove list format.
				if ( listStyleCommand.value == option.type ) {
					editor.execute( commandName );
				}
				// For unique styles, just call `listStyle` command.
				else if ( option.type != 'default' ) {
					editor.execute( 'listStyle', { type: option.type } );
				}
				// For 'default' style we need to call main list command if slected element is not a list.
				else if ( !listCommand.value ) {
					editor.execute( commandName );
				}
				// Or change list style to 'default' if selected element is a list of custom style.
				else {
					editor.execute( 'listStyle', { type: option.type } );
				}

				editor.editing.view.focus();
			} );
		}

		menuView.bind( 'isEnabled' ).to( listCommand, 'isEnabled' );

		return menuView;
	} );
}

interface StyleDefinition {

	/**
	 * The label of the style button.
	 */
	label: string;

	/**
	 * The type of the style button (e.g. "roman" or "circle").
	 */
	type: string;

	/**
	 * The SVG string of an icon of the style button.
	 */
	icon: string;

	/**
	 * The tooltip text of the button (shorter than verbose label).
	 */
	tooltip: string;
}
