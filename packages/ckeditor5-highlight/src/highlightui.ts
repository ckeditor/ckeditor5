/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module highlight/highlightui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import {
	addToolbarToDropdown,
	createDropdown,
	ButtonView,
	ListSeparatorView,
	MenuBarMenuView,
	MenuBarMenuListView,
	MenuBarMenuListItemView,
	MenuBarMenuListItemButtonView,
	SplitButtonView,
	ToolbarSeparatorView,
	type DropdownView
} from 'ckeditor5/src/ui.js';

import markerIcon from './../theme/icons/marker.svg';
import penIcon from './../theme/icons/pen.svg';
import type { HighlightOption } from './highlightconfig.js';
import type HighlightCommand from './highlightcommand.js';

import './../theme/highlight.css';

/**
 * The default highlight UI plugin. It introduces:
 *
 * * The `'highlight'` dropdown,
 * * The `'removeHighlight'` and `'highlight:*'` buttons.
 *
 * The default configuration includes the following buttons:
 *
 * * `'highlight:yellowMarker'`
 * * `'highlight:greenMarker'`
 * * `'highlight:pinkMarker'`
 * * `'highlight:blueMarker'`
 * * `'highlight:redPen'`
 * * `'highlight:greenPen'`
 *
 * See the {@link module:highlight/highlightconfig~HighlightConfig#options configuration} to learn more
 * about the defaults.
 */
export default class HighlightUI extends Plugin {
	/**
	 * Returns the localized option titles provided by the plugin.
	 *
	 * The following localized titles corresponding with default
	 * {@link module:highlight/highlightconfig~HighlightConfig#options} are available:
	 *
	 * * `'Yellow marker'`,
	 * * `'Green marker'`,
	 * * `'Pink marker'`,
	 * * `'Blue marker'`,
	 * * `'Red pen'`,
	 * * `'Green pen'`.
	 */
	public get localizedOptionTitles(): Record<string, string> {
		const t = this.editor.t;

		return {
			'Yellow marker': t( 'Yellow marker' ),
			'Green marker': t( 'Green marker' ),
			'Pink marker': t( 'Pink marker' ),
			'Blue marker': t( 'Blue marker' ),
			'Red pen': t( 'Red pen' ),
			'Green pen': t( 'Green pen' )
		};
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HighlightUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const options = this.editor.config.get( 'highlight.options' )!;

		for ( const option of options ) {
			this._addHighlighterButton( option );
		}

		this._addRemoveHighlightButton();

		this._addDropdown( options );

		this._addMenuBarButton( options );
	}

	/**
	 * Creates the "Remove highlight" button.
	 */
	private _addRemoveHighlightButton(): void {
		const t = this.editor.t;
		const command: HighlightCommand = this.editor.commands.get( 'highlight' )!;

		this._addButton( 'removeHighlight', t( 'Remove highlight' ), icons.eraser, null, button => {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
		} );
	}

	/**
	 * Creates a toolbar button from the provided highlight option.
	 */
	private _addHighlighterButton( option: HighlightOption ) {
		const command: HighlightCommand = this.editor.commands.get( 'highlight' )!;

		// TODO: change naming
		this._addButton( 'highlight:' + option.model, option.title, getIconForType( option.type ), option.model, decorateHighlightButton );

		function decorateHighlightButton( button: ButtonView ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.bind( 'isOn' ).to( command, 'value', value => value === option.model );
			button.iconView.fillColor = option.color;
			button.isToggleable = true;
		}
	}

	/**
	 * Internal method for creating highlight buttons.
	 *
	 * @param name The name of the button.
	 * @param label The label for the button.
	 * @param icon The button icon.
	 * @param value The `value` property passed to the executed command.
	 * @param decorateButton A callback getting ButtonView instance so that it can be further customized.
	 */
	private _addButton( name: string, label: string, icon: string, value: string | null, decorateButton: ( button: ButtonView ) => void ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, locale => {
			const buttonView = new ButtonView( locale );

			const localized = this.localizedOptionTitles[ label ] ? this.localizedOptionTitles[ label ] : label;

			buttonView.set( {
				label: localized,
				icon,
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'highlight', { value } );
				editor.editing.view.focus();
			} );

			// Add additional behavior for buttonView.
			decorateButton( buttonView );

			return buttonView;
		} );
	}

	/**
	 * Creates the split button dropdown UI from the provided highlight options.
	 */
	private _addDropdown( options: Array<HighlightOption> ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const startingHighlighter = options[ 0 ];

		const optionsMap = options.reduce( ( retVal, option ) => {
			retVal[ option.model ] = option;

			return retVal;
		}, {} as Record<string, HighlightOption> );

		componentFactory.add( 'highlight', locale => {
			const command: HighlightCommand = editor.commands.get( 'highlight' )!;
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView as HighlightSplitButtonView;

			splitButtonView.set( {
				label: t( 'Highlight' ),
				tooltip: true,
				// Holds last executed highlighter.
				lastExecuted: startingHighlighter.model,
				// Holds current highlighter to execute (might be different then last used).
				commandValue: startingHighlighter.model,
				isToggleable: true
			} );

			// Dropdown button changes to selection (command.value):
			// - If selection is in highlight it get active highlight appearance (icon, color) and is activated.
			// - Otherwise it gets appearance (icon, color) of last executed highlight.
			splitButtonView.bind( 'icon' ).to( command, 'value', value => getIconForType( getActiveOption( value, 'type' ) ) );
			splitButtonView.bind( 'color' ).to( command, 'value', value => getActiveOption( value, 'color' ) );
			splitButtonView.bind( 'commandValue' ).to( command, 'value', value => getActiveOption( value, 'model' ) );
			splitButtonView.bind( 'isOn' ).to( command, 'value', value => !!value );

			splitButtonView.delegate( 'execute' ).to( dropdownView );

			// Create buttons array.
			const buttonsCreator = () => {
				const buttons = options.map( option => {
					// Get existing highlighter button.
					const buttonView = componentFactory.create( 'highlight:' + option.model );

					// Update lastExecutedHighlight on execute.
					this.listenTo( buttonView, 'execute', () => {
						( dropdownView.buttonView as HighlightSplitButtonView ).set( { lastExecuted: option.model } );
					} );

					return buttonView;
				} );

				// Add separator and eraser buttons to dropdown.
				buttons.push( new ToolbarSeparatorView() );
				buttons.push( componentFactory.create( 'removeHighlight' ) );

				return buttons;
			};

			// Make toolbar button enabled when any button in dropdown is enabled before adding separator and eraser.
			dropdownView.bind( 'isEnabled' ).to( command, 'isEnabled' );

			addToolbarToDropdown( dropdownView, buttonsCreator, {
				enableActiveItemFocusOnDropdownOpen: true,
				ariaLabel: t( 'Text highlight toolbar' )
			} );
			bindToolbarIconStyleToActiveColor( dropdownView );

			// Execute current action from dropdown's split button action button.
			splitButtonView.on( 'execute', () => {
				editor.execute( 'highlight', { value: splitButtonView.commandValue } );
			} );

			// Focus the editable after executing the command.
			// It overrides a default behaviour where the focus is moved to the dropdown button (#12125).
			this.listenTo( dropdownView, 'execute', () => {
				editor.editing.view.focus();
			} );

			/**
			 * Returns active highlighter option depending on current command value.
			 * If current is not set or it is the same as last execute this method will return the option key (like icon or color)
			 * of last executed highlighter. Otherwise it will return option key for current one.
			 */
			function getActiveOption<Key extends keyof HighlightOption>( current: string | undefined, key: Key ): HighlightOption[ Key ] {
				const whichHighlighter = !current ||
				current === splitButtonView.lastExecuted ? splitButtonView.lastExecuted : current;

				return optionsMap[ whichHighlighter! ][ key ];
			}

			return dropdownView;
		} );
	}

	/**
	 * Creates the menu bar button for highlight including submenu with available options.
	 */
	private _addMenuBarButton( options: Array<HighlightOption> ) {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'menuBar:highlight', locale => {
			const command: HighlightCommand = editor.commands.get( 'highlight' )!;
			const menuView = new MenuBarMenuView( locale );

			menuView.buttonView.set( {
				label: t( 'Highlight' ),
				icon: getIconForType( 'marker' )
			} );
			menuView.bind( 'isEnabled' ).to( command );
			menuView.buttonView.iconView.fillColor = 'transparent';

			const listView = new MenuBarMenuListView( locale );

			for ( const option of options ) {
				const listItemView = new MenuBarMenuListItemView( locale, menuView );
				const buttonView = new MenuBarMenuListItemButtonView( locale );

				buttonView.set( {
					label: option.title,
					icon: getIconForType( option.type ),
					role: 'menuitemradio',
					isToggleable: true
				} );

				buttonView.iconView.fillColor = option.color;

				buttonView.delegate( 'execute' ).to( menuView );
				buttonView.bind( 'isOn' ).to( command, 'value', value => value === option.model );

				buttonView.on( 'execute', () => {
					editor.execute( 'highlight', { value: option.model } );

					editor.editing.view.focus();
				} );

				listItemView.children.add( buttonView );
				listView.items.add( listItemView );
			}

			// Add remove highlight button
			listView.items.add( new ListSeparatorView( locale ) );
			const listItemView = new MenuBarMenuListItemView( locale, menuView );
			const buttonView = new MenuBarMenuListItemButtonView( locale );

			buttonView.set( {
				label: t( 'Remove highlight' ),
				icon: icons.eraser
			} );

			buttonView.delegate( 'execute' ).to( menuView );

			buttonView.on( 'execute', () => {
				editor.execute( 'highlight', { value: null } );

				editor.editing.view.focus();
			} );

			listItemView.children.add( buttonView );
			listView.items.add( listItemView );

			menuView.panelView.children.add( listView );

			return menuView;
		} );
	}
}

/**
 * Extends split button icon style to reflect last used button style.
 */
function bindToolbarIconStyleToActiveColor( dropdownView: DropdownView ): void {
	const actionView = ( dropdownView.buttonView as HighlightSplitButtonView ).actionView;

	actionView.iconView.bind( 'fillColor' ).to( ( dropdownView.buttonView! as HighlightSplitButtonView ), 'color' );
}

/**
 * Returns icon for given highlighter type.
 */
function getIconForType( type: 'marker' | 'pen' ) {
	return type === 'marker' ? markerIcon : penIcon;
}

type HighlightSplitButtonView = SplitButtonView & {
	lastExecuted: string;
	commandValue: string;
	color: string;
};
