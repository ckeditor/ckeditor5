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
import createSplitButtonDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/createsplitbuttondropdown';
import { closeDropdownOnBlur, closeDropdownOnExecute, focusDropdownContentsOnArrows } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

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

		const icon = option.type === 'marker' ? markerIcon : penIcon;

		this._addButton( 'highlight:' + option.model, option.title, icon, option.model, decorateHighlightButton );

		function decorateHighlightButton( button ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );

			button.extendTemplate( {
				attributes: {
					class: 'ck-highlight_button'
				}
			} );

			button.iconView.extendTemplate( {
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
	 * Creates split button drop down UI from provided highlight options.
	 *
	 * @param {Array.<module:highlight/highlightediting~HighlightOption>} options
	 * @private
	 */
	_addDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const startingHighlighter = options[ 0 ];

		componentFactory.add( 'highlightDropdown', locale => {
			const model = new Model( {
				label: t( 'Highlight' ),
				withText: false,
				isVertical: false,
				icon: markerIcon,
				type: startingHighlighter.type,
				color: startingHighlighter.color,
				commandValue: startingHighlighter.model
			} );

			bindModelToCommand( model, editor, 'highlight' );

			const dropdownView = createSplitButtonDropdown( model, locale );

			bindIconStyle( dropdownView, model );

			dropdownView.buttonView.on( 'execute', () => {
				editor.execute( 'highlight', { value: model.commandValue } );
				editor.editing.view.focus();
			} );

			// Add highlighters buttons to dropdown
			const buttons = options.map( option => {
				const buttonView = componentFactory.create( 'highlight:' + option.model );

				this.listenTo( buttonView, 'execute', () => changeToolbarButton( editor, model, {
					type: option.type,
					color: option.color,
					command: 'highlight',
					commandValue: option.model,
					icon: markerIcon
				} ) );

				return buttonView;
			} );
			// Add eraser button to dropdown.
			const eraserButton = componentFactory.create( 'removeHighlight' );
			buttons.push( eraserButton );

			// Make toolbar button enabled when any button in dropdown is enabled.
			model.bind( 'isEnabled' ).to(
				// Bind to #isEnabled of each command...
				...getBindingTargets( buttons, 'isEnabled' ),
				// ...and set it true if any command #isEnabled is true.
				( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
			);

			model.set( 'buttons', buttons );

			// TODO: Temporary group as UI not fully defined yet. Also duplicates button dropdown
			// Group buttons for dropdown.
			const toolbarView = dropdownView.toolbarView = new ToolbarView();

			toolbarView.bind( 'isVertical', 'className' ).to( model, 'isVertical', 'toolbarClassName' );

			model.buttons.map( view => toolbarView.items.add( view ) );

			dropdownView.extendTemplate( {
				attributes: {
					class: [ 'ck-highlight_button', 'ck-buttondropdown' ]
				}
			} );
			dropdownView.panelView.children.add( toolbarView );

			closeDropdownOnBlur( dropdownView );
			closeDropdownOnExecute( dropdownView, toolbarView.items );
			focusDropdownContentsOnArrows( dropdownView, toolbarView );

			// Focus button group upon opening dropdown view
			dropdownView.buttonView.on( 'select', () => {
				if ( dropdownView.buttonView.buttonView.isEnabled && dropdownView.isOpen ) {
					// buttonGroupView.focus();
				}
			}, { priority: 'low' } );

			return dropdownView;
		} );
	}
}

// TODO: this is duplicated in various places (dropdowns)
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}

// Rebinds model values to a new command.
function bindModelToCommand( model, editor, commandName ) {
	model.unbind( 'isOn' );
	model.bind( 'isOn' ).to( editor.commands.get( commandName ), 'value' );
}

// Updates toolbar dropdown button with last selected highlighter.
function changeToolbarButton( editor, model, iconData ) {
	model.set( iconData );

	bindModelToCommand( model, editor, iconData.command );
}

// Extends split button icon style to reflect last used button style.
function bindIconStyle( dropdownView, model ) {
	const iconView = dropdownView.buttonView.buttonView.iconView;

	const bind = iconView.bindTemplate;

	iconView.extendTemplate( {
		attributes: {
			style: bind.to( 'style' )
		}
	} );

	iconView.bind( 'style' ).to( model, 'color', color => `color:${ color }` );
}
