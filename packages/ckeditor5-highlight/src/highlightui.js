/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module highlight/highlightui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import markerIcon from './../theme/icons/marker.svg';
import penIcon from './../theme/icons/pen.svg';
import eraserIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';

import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

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
 * See the {@link module:highlight/highlight~HighlightConfig#options configuration} to learn more
 * about the defaults.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HighlightUI extends Plugin {
	/**
	 * Returns the localized option titles provided by the plugin.
	 *
	 * The following localized titles corresponding with default
	 * {@link module:highlight/highlight~HighlightConfig#options} are available:
	 *
	 * * `'Yellow marker'`,
	 * * `'Green marker'`,
	 * * `'Pink marker'`,
	 * * `'Blue marker'`,
	 * * `'Red pen'`,
	 * * `'Green pen'`.
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedOptionTitles() {
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
	static get pluginName() {
		return 'HighlightUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const options = this.editor.config.get( 'highlight.options' );

		for ( const option of options ) {
			this._addHighlighterButton( option );
		}

		this._addRemoveHighlightButton();

		this._addDropdown( options );
	}

	/**
	 * Creates the "Remove highlight" button.
	 *
	 * @private
	 */
	_addRemoveHighlightButton() {
		const t = this.editor.t;

		this._addButton( 'removeHighlight', t( 'Remove highlight' ), eraserIcon );
	}

	/**
	 * Creates a toolbar button from the provided highlight option.
	 *
	 * @param {module:highlight/highlight~HighlightOption} option
	 * @private
	 */
	_addHighlighterButton( option ) {
		const command = this.editor.commands.get( 'highlight' );

		// TODO: change naming
		this._addButton( 'highlight:' + option.model, option.title, getIconForType( option.type ), option.model, decorateHighlightButton );

		function decorateHighlightButton( button ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.bind( 'isOn' ).to( command, 'value', value => value === option.model );
			button.iconView.fillColor = option.color;
			button.isToggleable = true;
		}
	}

	/**
	 * Internal method for creating highlight buttons.
	 *
	 * @param {String} name The name of the button.
	 * @param {String} label The label for the button.
	 * @param {String} icon The button icon.
	 * @param {Function} [decorateButton=()=>{}] Additional method for extending the button.
	 * @private
	 */
	_addButton( name, label, icon, value, decorateButton = () => {} ) {
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
	 *
	 * @param {Array.<module:highlight/highlight~HighlightOption>} options
	 * @private
	 */
	_addDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const startingHighlighter = options[ 0 ];

		const optionsMap = options.reduce( ( retVal, option ) => {
			retVal[ option.model ] = option;

			return retVal;
		}, {} );

		componentFactory.add( 'highlight', locale => {
			const command = editor.commands.get( 'highlight' );
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;

			splitButtonView.set( {
				tooltip: t( 'Highlight' ),
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
			const buttons = options.map( option => {
				// Get existing highlighter button.
				const buttonView = componentFactory.create( 'highlight:' + option.model );

				// Update lastExecutedHighlight on execute.
				this.listenTo( buttonView, 'execute', () => dropdownView.buttonView.set( { lastExecuted: option.model } ) );

				return buttonView;
			} );

			// Make toolbar button enabled when any button in dropdown is enabled before adding separator and eraser.
			dropdownView.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

			// Add separator and eraser buttons to dropdown.
			buttons.push( new ToolbarSeparatorView() );
			buttons.push( componentFactory.create( 'removeHighlight' ) );

			addToolbarToDropdown( dropdownView, buttons );
			bindToolbarIconStyleToActiveColor( dropdownView );

			dropdownView.toolbarView.ariaLabel = t( 'Text highlight toolbar' );

			// Execute current action from dropdown's split button action button.
			splitButtonView.on( 'execute', () => {
				editor.execute( 'highlight', { value: splitButtonView.commandValue } );
				editor.editing.view.focus();
			} );

			// Returns active highlighter option depending on current command value.
			// If current is not set or it is the same as last execute this method will return the option key (like icon or color)
			// of last executed highlighter. Otherwise it will return option key for current one.
			function getActiveOption( current, key ) {
				const whichHighlighter = !current ||
				current === splitButtonView.lastExecuted ? splitButtonView.lastExecuted : current;

				return optionsMap[ whichHighlighter ][ key ];
			}

			return dropdownView;
		} );
	}
}

// Extends split button icon style to reflect last used button style.
function bindToolbarIconStyleToActiveColor( dropdownView ) {
	const actionView = dropdownView.buttonView.actionView;

	actionView.iconView.bind( 'fillColor' ).to( dropdownView.buttonView, 'color' );
}

// Returns icon for given highlighter type.
function getIconForType( type ) {
	return type === 'marker' ? markerIcon : penIcon;
}
