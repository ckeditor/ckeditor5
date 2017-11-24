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

	_addRemoveHighlightButton() {
		const t = this.editor.t;

		this._addButton( 'removeHighlight', t( 'Remove highlighting' ), highlightRemoveIcon );
	}

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

			decorateButton( buttonView );

			return buttonView;
		} );
	}

	_addDropdown( highlighters ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const firstHighlighter = highlighters[ 0 ];

		componentFactory.add( 'highlightDropdown', locale => {
			const model = new Model( {
				label: t( 'Highlight' ),
				withText: false,
				selected: firstHighlighter.name,
				icon: highlightIcon,
				type: firstHighlighter.type,
				color: firstHighlighter.color,
				command: firstHighlighter.name
			} );

			model.bind( 'isOn' ).to( editor.commands.get( firstHighlighter.name ), 'value' );

			// TODO: bind this in model
			const dropdownView = createSplitButtonDropdown( model, locale );

			// Extend split button icon style to reflect last used button style
			const iconView = dropdownView.buttonView.buttonView.iconView;
			const bind = iconView.bindTemplate;

			iconView.extendTemplate( {
				attributes: {
					style: bind.to( 'style' )
				}
			} );

			iconView.bind( 'style' ).to( model, 'type', model, 'color', getIconStyleForHighlighter );

			// TODO: forward event ?:
			// TODO: lame names buttonView/buttonView
			dropdownView.buttonView.on( 'execute', () => {
				editor.execute( model.command );
				editor.editing.view.focus();
			} );

			const buttons = highlighters.map( highlighter => {
				const buttonView = componentFactory.create( highlighter.name );

				this.listenTo( buttonView, 'execute', () => {
					model.set( {
						type: highlighter.type,
						color: highlighter.color,
						command: highlighter.name,
						icon: highlightIcon
					} );

					model.unbind( 'isOn' );
					model.bind( 'isOn' ).to( editor.commands.get( highlighter.name ), 'value' );
				} );

				return buttonView;
			} );

			const removeButton = componentFactory.create( 'removeHighlight' );
			buttons.push( removeButton );

			this.listenTo( removeButton, 'execute', () => {
				model.type = 'remove';
				model.color = undefined;
				model.command = 'removeHighlight';
				model.icon = highlightRemoveIcon;

				model.unbind( 'isOn' );
				model.bind( 'isOn' ).to( editor.commands.get( 'removeHighlight' ), 'value' );
			} );

			model.bind( 'isEnabled' ).to(
				// Bind to #isEnabled of each command...
				...getBindingTargets( buttons, 'isEnabled' ),
				// ...and set it true if any command #isEnabled is true.
				( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
			);

			// TODO: This duplicates buttonDropdown
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

			return dropdownView;
		} );
	}
}

// TODO: this is duplicated
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
