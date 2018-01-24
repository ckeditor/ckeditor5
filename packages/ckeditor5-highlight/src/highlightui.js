/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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

import Model from '@ckeditor/ckeditor5-ui/src/model';
import addToolbarToDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/addtoolbartodropdown';
import closeDropdownOnBlur from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/closedropdownonblur';
import closeDropdownOnExecute from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/closedropdownonexecute';
import createDropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/createdropdownview';
import createSplitButtonForDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/createsplitbuttonfordropdown';
import enableModelIfOneIsEnabled from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/enablemodelifoneisenabled';
import focusDropdownContentsOnArrows from '@ckeditor/ckeditor5-ui/src/dropdown/helpers/focusdropdowncontentsonarrows';
import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';

import './../theme/highlight.css';

/**
 * The default Highlight UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HighlightUI extends Plugin {
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
	 * @param {module:highlight/highlightediting~HighlightOption} option
	 * @private
	 */
	_addHighlighterButton( option ) {
		const command = this.editor.commands.get( 'highlight' );

		this._addButton( 'highlight:' + option.model, option.title, getIconForType( option.type ), option.model, decorateHighlightButton );

		function decorateHighlightButton( button ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.bind( 'isOn' ).to( command, 'value', value => value === option.model );

			button.extendTemplate( {
				attributes: {
					style: `color: ${ option.color }`
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

			buttonView.set( {
				label,
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
	 * @param {Array.<module:highlight/highlightediting~HighlightOption>} options
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

			const model = new Model( {
				tooltip: t( 'Highlight' ),
				withText: false,
				isVertical: false,
				// Holds last executed highlighter.
				lastExecuted: startingHighlighter.model,
				// Holds current highlighter to execute (might be different then last used).
				commandValue: startingHighlighter.model
			} );

			// Dropdown button changes to selection (command.value).
			// If selection is in highlight it get active highlight appearance (icon, color).
			// Otherwise it gets appearance (icon, color) of last executed highlight.
			model.bind( 'icon' ).to( command, 'value', value => getIconForType( getActiveOption( value, 'type' ) ) );
			model.bind( 'color' ).to( command, 'value', value => getActiveOption( value, 'color' ) );
			model.bind( 'commandValue' ).to( command, 'value', value => getActiveOption( value, 'model' ) );

			// Create buttons array.
			const buttons = options.map( option => {
				// Get existing highlighter button.
				const buttonView = componentFactory.create( 'highlight:' + option.model );

				// Update lastExecutedHighlight on execute.
				this.listenTo( buttonView, 'execute', () => model.set( { lastExecuted: option.model } ) );

				return buttonView;
			} );

			// Make toolbar button enabled when any button in dropdown is enabled before adding separator and eraser.
			enableModelIfOneIsEnabled( model, buttons );

			// Add separator and eraser buttons to dropdown.
			buttons.push( new ToolbarSeparatorView() );
			buttons.push( componentFactory.create( 'removeHighlight' ) );

			model.set( 'buttons', buttons );

			const splitButtonView = createSplitButtonForDropdown( model, locale );
			const dropdownView = createDropdownView( model, splitButtonView, locale );

			// TODO: Extend template to hide arrow from dropdown. Remove me after changes in theme-lark.
			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-splitbutton-dropdown'
				}
			} );

			addToolbarToDropdown( dropdownView, model );
			closeDropdownOnBlur( dropdownView );
			closeDropdownOnExecute( dropdownView );
			focusDropdownContentsOnArrows( dropdownView );

			bindIconStyleToColor( dropdownView, model );

			dropdownView.extendTemplate( {
				attributes: {
					class: [ 'ck-highlight-dropdown' ]
				}
			} );

			// Returns active highlighter option depending on current command value.
			// If current is not set or it is the same as last execute this method will return the option key (like icon or color)
			// of last executed highlighter. Otherwise it will return option key for current one.
			function getActiveOption( current, key ) {
				const whichHighlighter = !current || current === model.lastExecuted ? model.lastExecuted : current;

				return optionsMap[ whichHighlighter ][ key ];
			}

			return dropdownView;
		} );
	}
}

// Extends split button icon style to reflect last used button style.
function bindIconStyleToColor( dropdownView, model ) {
	const actionView = dropdownView.buttonView.actionView;

	const bind = actionView.bindTemplate;

	// Color will propagate to iconView.
	actionView.extendTemplate( {
		attributes: {
			style: bind.to( 'color', color => `color:${ color }` )
		}
	} );

	actionView.bind( 'color' ).to( model, 'color' );
}

// Returns icon for given highlighter type.
function getIconForType( type ) {
	return type === 'marker' ? markerIcon : penIcon;
}
