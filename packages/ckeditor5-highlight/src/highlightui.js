/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HighlightEditing from './highlightediting';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import markerIcon from './../theme/icons/marker.svg';
import penIcon from './../theme/icons/pen.svg';
import eraserIcon from './../theme/icons/eraser.svg';

import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import bindOneToMany from '@ckeditor/ckeditor5-ui/src/bindings/bindonetomany';
import { createSplitButtonDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import './../theme/highlight.css';

/**
 * The default Highlight UI plugin.
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
	 * * `'Marker'`,
	 * * `'Green marker'`,
	 * * `'Pink marker'`,
	 * * `'Blue pen'`.
	 * * `'Red pen'`.
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedOptionTitles() {
		const t = this.editor.t;

		return {
			'Marker': t( 'Marker' ),
			'Green marker': t( 'Green marker' ),
			'Pink marker': t( 'Pink marker' ),
			'Red pen': t( 'Red pen' ),
			'Blue pen': t( 'Blue pen' )
		};
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HighlightEditing ];
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
	 * Creates remove highlight button.
	 *
	 * @private
	 */
	_addRemoveHighlightButton() {
		const t = this.editor.t;

		this._addButton( 'removeHighlight', t( 'Remove highlighting' ), eraserIcon );
	}

	/**
	 * Creates toolbar button from provided highlight option.
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

			button.extendTemplate( {
				attributes: {
					style: `color: ${ option.color }`,
					class: 'ck-highlight-button'
				}
			} );
		}
	}

	/**
	 * Internal method for creating highlight buttons.
	 *
	 * @param {String} name Name of a button.
	 * @param {String} label Label for button.
	 * @param {String} icon Button's icon.
	 * @param {Function} [decorateButton=()=>{}] Additional method for extending button.
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
	 * Creates split button dropdown UI from provided highlight options.
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

		componentFactory.add( 'highlightDropdown', locale => {
			const command = editor.commands.get( 'highlight' );

			const dropdownView = createSplitButtonDropdown( locale );

			dropdownView.set( {
				tooltip: t( 'Highlight' ),
				withText: false,
				isVertical: false,
				// Holds last executed highlighter.
				lastExecuted: startingHighlighter.model,
				// Holds current highlighter to execute (might be different then last used).
				commandValue: startingHighlighter.model
			} );

			// Dropdown button changes to selection (command.value):
			// - If selection is in highlight it get active highlight appearance (icon, color) and is activated.
			// - Otherwise it gets appearance (icon, color) of last executed highlight.
			dropdownView.bind( 'icon' ).to( command, 'value', value => getIconForType( getActiveOption( value, 'type' ) ) );
			dropdownView.bind( 'color' ).to( command, 'value', value => getActiveOption( value, 'color' ) );
			dropdownView.bind( 'commandValue' ).to( command, 'value', value => getActiveOption( value, 'model' ) );
			dropdownView.bind( 'isOn' ).to( command, 'value', value => !!value );

			dropdownView.buttonView.extendTemplate( {
				attributes: {
					class: 'ck-highlight-button'
				}
			} );

			// Create buttons array.
			const buttons = options.map( option => {
				// Get existing highlighter button.
				const buttonView = componentFactory.create( 'highlight:' + option.model );

				// Update lastExecutedHighlight on execute.
				this.listenTo( buttonView, 'execute', () => dropdownView.set( { lastExecuted: option.model } ) );

				return buttonView;
			} );

			// Make toolbar button enabled when any button in dropdown is enabled before adding separator and eraser.
			bindOneToMany( dropdownView, 'isEnabled', buttons, 'isEnabled',
				( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
			);

			// Add separator and eraser buttons to dropdown.
			buttons.push( new ToolbarSeparatorView() );
			buttons.push( componentFactory.create( 'removeHighlight' ) );

			// TODO: Extend template to hide arrow from dropdown. Remove me after changes in theme-lark.
			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-splitbutton-dropdown'
				}
			} );

			addToolbarToDropdown( dropdownView, buttons );

			bindIconStyleToColor( dropdownView );

			dropdownView.extendTemplate( {
				attributes: {
					class: [ 'ck-highlight-dropdown' ]
				}
			} );

			// Execute current action from dropdown's split button action button.
			dropdownView.on( 'execute', () => {
				editor.execute( 'highlight', { value: dropdownView.commandValue } );
				editor.editing.view.focus();
			} );

			// Returns active highlighter option depending on current command value.
			// If current is not set or it is the same as last execute this method will return the option key (like icon or color)
			// of last executed highlighter. Otherwise it will return option key for current one.
			function getActiveOption( current, key ) {
				const whichHighlighter = !current || current === dropdownView.lastExecuted ? dropdownView.lastExecuted : current;

				return optionsMap[ whichHighlighter ][ key ];
			}

			return dropdownView;
		} );
	}
}

// Extends split button icon style to reflect last used button style.
function bindIconStyleToColor( dropdownView ) {
	const actionView = dropdownView.buttonView.actionView;

	const bind = actionView.bindTemplate;

	// Color will propagate to iconView.
	actionView.extendTemplate( {
		attributes: {
			style: bind.to( 'color', color => `color:${ color }` )
		}
	} );

	actionView.bind( 'color' ).to( dropdownView, 'color' );
}

// Returns icon for given highlighter type.
function getIconForType( type ) {
	return type === 'marker' ? markerIcon : penIcon;
}
