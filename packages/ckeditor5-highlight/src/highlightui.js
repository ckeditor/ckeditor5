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
			this._addButton( highlighter );
		}

		this._addRubberButton();

		this._addDropdown( highlighters );
	}

	_addButton( highlighter ) {
		const editor = this.editor;
		const command = editor.commands.get( 'highlight' );

		editor.ui.componentFactory.add( 'highlight-' + highlighter.class, locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: highlighter.title,
				icon: highlightIcon,
				tooltip: true,
				// TODO: how to pass this & name
				class: highlighter.class
			} );

			// Bind button model to command.
			buttonView.bind( 'isEnabled' ).to( command, 'isEnabled' );
			buttonView.bind( 'isOn' ).to( command, 'value', value => value === highlighter.class );

			// Execute command.
			this.listenTo( buttonView, 'execute', () => {
				editor.execute( 'highlight', { class: highlighter.class } );
				editor.editing.view.focus();
			} );

			// TODO:
			buttonView.iconView.extendTemplate( {
				attributes: { style: highlighter.type === 'pen' ? { color: highlighter.color } : { backgroundColor: highlighter.color } }
			} );

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

			const buttons = highlighters.map( highlighter => componentFactory.create( 'highlight-' + highlighter.class ) );

			buttons.push( componentFactory.create( 'highlightRemove' ) );

			const buttonView = componentFactory.create( 'highlight-' + highlighters[ 0 ].class );

			model.bind( 'isEnabled' ).to(
				// Bind to #isEnabled of each command...
				...getBindingTargets( buttons, 'isEnabled' ),
				// ...and set it true if any command #isEnabled is true.
				( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
			);

			// TODO: Is this needed in UI at all?
			const dropdownView = createSplitButtonDropdown( model, locale, buttonView );

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

			// TODO: A bit hack-ish: Swap the split button button to executed one.
			buttons.map( buttonView => {
				this.listenTo( buttonView, 'execute', () => {
					if ( dropdownView.buttonView.buttonView.class !== buttonView.class ) {
						const newButton = componentFactory.create( buttonView.class ? 'highlight-' + buttonView.class : 'highlightRemove' );

						dropdownView.buttonView.swapButton( newButton );
					}
				} );
			} );

			return dropdownView;
		} );
	}

	_addRubberButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'highlightRemove', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Remove highlighting' ),
				icon: highlightRemoveIcon,
				tooltip: true
			} );

			this.listenTo( buttonView, 'execute', () => {
				editor.execute( 'highlight' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
	}
}

// TODO: this is duplicated
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
