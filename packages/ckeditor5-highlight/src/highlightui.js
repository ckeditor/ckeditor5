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
			button.bind( 'isOn' ).to( command, 'value' );

			// TODO: bind to
			button.iconView.extendTemplate( {
				attributes: {
					style: highlighter.type === 'pen' ? { color: highlighter.color } : { backgroundColor: highlighter.color }
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

			this.listenTo( buttonView, 'execute', () => {
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

		componentFactory.add( 'highlightDropdown', locale => {
			const model = new Model( {
				label: t( 'Highlight' ),
				withText: false,
				selected: highlighters[ 0 ].class,
				icon: highlightIcon
			} );

			const buttons = highlighters.map( highlighter => componentFactory.create( highlighter.name ) );

			buttons.push( componentFactory.create( 'removeHighlight' ) );

			const initialButton = componentFactory.create( highlighters[ 0 ].name );

			model.bind( 'isEnabled' ).to(
				// Bind to #isEnabled of each command...
				...getBindingTargets( buttons, 'isEnabled' ),
				// ...and set it true if any command #isEnabled is true.
				( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
			);

			// TODO: Is this needed in UI at all?
			const dropdownView = createSplitButtonDropdown( model, locale, initialButton );

			const buttonGroupView = dropdownView.buttonGroupView = new ButtonGroupView( { isVertical: model.isVertical } );

			buttonGroupView.bind( 'isVertical' ).to( model, 'isVertical' );

			buttons.map( view => buttonGroupView.items.add( view ) );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-splitbutton-dropdown'
				}
			} );

			dropdownView.panelView.children.add( buttonGroupView );

			closeDropdownOnBlur( dropdownView );
			closeDropdownOnExecute( dropdownView, buttonGroupView.items );
			focusDropdownItemsOnArrows( dropdownView, buttonGroupView );

			// TODO: weak names buttonView.buttonView
			// TODO: could be move to createSplitButtonDropdown
			dropdownView.buttonView.arrowView.on( 'execute', () => {
				if ( dropdownView.buttonView.buttonView.isEnabled && !dropdownView.isOpen ) {
					dropdownView.isOpen = true;
					buttonGroupView.focus();
				}
			} );

			const bind = dropdownView.buttonView.buttonView.iconView.bindTemplate;

			// const bind = Template.bind( observable, emitter );

			// TODO: check binding

			dropdownView.buttonView.buttonView.iconView.extendTemplate( {
				attributes: {
					style: bind.to( 'style' )
				}
			} );

			dropdownView.buttonView.buttonView.iconView.bind( 'style' ).to( model, 'type', model, 'color', ( type, color ) => {
				if ( type === 'pen' ) {
					return 'color:' + color;
				} else {
					return 'background-color:' + color;
				}
			} );

			// TODO: A bit hack-ish: Swap the split button button to executed one.
			buttons.map( buttonView => {
				this.listenTo( buttonView, 'execute', () => {
					if ( dropdownView.buttonView.buttonView.class !== buttonView.class ) {
						// TODO: const newButton =
						// componentFactory.create( buttonView.class ? 'highlight-' + buttonView.class : 'highlightRemove' );

						model.type = '';
						model.color = '';
						model.command = '';
					}
				} );
			} );

			return dropdownView;
		} );
	}
}

// TODO: this is duplicated
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
