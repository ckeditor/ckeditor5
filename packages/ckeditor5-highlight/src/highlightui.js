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

import highlightIcon from '@ckeditor/ckeditor5-core/theme/icons/input.svg';
import highlightRemoveIcon from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import createSplitButtonDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/createsplitbuttondropdown';
import { closeDropdownOnBlur, closeDropdownOnExecute, focusDropdownItemsOnArrows } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ButtonGroupView from '@ckeditor/ckeditor5-ui/src/buttongroup/buttongroupview';

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
		const highlighters = this.editor.config.get( 'highlight' );

		for ( const highlighter of highlighters ) {
			this._addHighlighterButton( highlighter );
		}

		this._addRemoveHighlightButton();

		this._addDropdown( highlighters );
	}

	/**
	 * Creates remove highlight button.
	 *
	 * @private
	 */
	_addRemoveHighlightButton() {
		const t = this.editor.t;

		this._addButton( 'removeHighlight', t( 'Remove highlighting' ), highlightRemoveIcon );
	}

	/**
	 * Creates toolbar button from provided highlight option.
	 *
	 * @param {module:highlight/highlightediting~HighlightOption} highlighter
	 * @private
	 */
	_addHighlighterButton( highlighter ) {
		const name = highlighter.name;
		const command = this.editor.commands.get( name );

		this._addButton( name, highlighter.title, highlightIcon, decorateHighlightButton );

		function decorateHighlightButton( button ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );

			button.iconView.extendTemplate( {
				attributes: {
					style: getIconStyleForHighlighter( highlighter.type, highlighter.color )
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
	_addButton( name, label, icon, decorateButton = () => {} ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label,
				icon,
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( name );
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
	 * @param {Array.<module:highlight/highlightediting~HighlightOption>} highlighters
	 * @private
	 */
	_addDropdown( highlighters ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const startingHighlighter = highlighters[ 0 ];

		componentFactory.add( 'highlightDropdown', locale => {
			const commandName = startingHighlighter.name;

			const model = new Model( {
				label: t( 'Highlight' ),
				withText: false,
				icon: highlightIcon,
				type: startingHighlighter.type,
				color: startingHighlighter.color,
				command: commandName
			} );

			bindModelToCommand( model, editor, commandName );

			const dropdownView = createSplitButtonDropdown( model, locale );

			bindIconStyle( dropdownView, model );

			dropdownView.buttonView.on( 'execute', () => {
				editor.execute( model.command );
				editor.editing.view.focus();
			} );

			// Add highlighters buttons to dropdown
			const buttons = highlighters.map( highlighter => {
				const buttonView = componentFactory.create( highlighter.name );
				const commandName = highlighter.name;

				this.listenTo( buttonView, 'execute', () => changeToolbarButton( editor, model, {
					type: highlighter.type,
					color: highlighter.color,
					command: commandName,
					icon: highlightIcon
				} ) );

				return buttonView;
			} );

			// Add rubber button to dropdown.
			const rubberButton = componentFactory.create( 'removeHighlight' );
			buttons.push( rubberButton );

			this.listenTo( rubberButton, 'execute', () => changeToolbarButton( editor, model, {
				type: 'remove',
				color: undefined,
				command: 'removeHighlight',
				icon: highlightRemoveIcon
			} ) );

			// Make toolbar button enabled when any button in dropdown is enabled.
			model.bind( 'isEnabled' ).to(
				// Bind to #isEnabled of each command...
				...getBindingTargets( buttons, 'isEnabled' ),
				// ...and set it true if any command #isEnabled is true.
				( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
			);

			// TODO: Temporary group as UI not fully defined yet. Also duplicates button dropdown
			// Group buttons for dropdown.
			const buttonGroupView = dropdownView.buttonGroupView = new ButtonGroupView( { isVertical: false } );
			buttons.map( buttonView => buttonGroupView.items.add( buttonView ) );

			dropdownView.panelView.children.add( buttonGroupView );

			closeDropdownOnBlur( dropdownView );
			closeDropdownOnExecute( dropdownView, buttonGroupView.items );
			focusDropdownItemsOnArrows( dropdownView, buttonGroupView );

			// Focus button group upon opening dropdown view
			dropdownView.buttonView.on( 'select', () => {
				if ( dropdownView.buttonView.buttonView.isEnabled && dropdownView.isOpen ) {
					buttonGroupView.focus();
				}
			}, { priority: 'low' } );
		} );
	}
}

// TODO: this is duplicated in various places (dropdowns)
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}

// Returns style definition for highlighter button
// @param {String} type Type of highlighter. One of: "marker", "pen", "remove".
// @param {String} color Color of highlighter.
function getIconStyleForHighlighter( type, color ) {
	// Only return type for defined types "marker"/"pen". Return empty style otherwise (ie. for "remove" type).
	if ( type === 'pen' ) {
		return 'color:' + color;
	} else if ( type === 'marker' ) {
		return 'background-color:' + color;
	}
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

	iconView.bind( 'style' ).to( model, 'type', model, 'color', getIconStyleForHighlighter );
}
