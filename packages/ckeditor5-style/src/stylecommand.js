/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Command } from 'ckeditor5/src/core';
import { logWarning, first } from 'ckeditor5/src/utils';

/**
 * TODO
 *
 * @extends module:core/command~Command
 */
export default class StyleCommand extends Command {
	constructor( editor, styles ) {
		super( editor );

		/**
		 * Set of currently applied styles on current selection.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean|String} #value
		 */

		/**
		 * Styles object ... TODO
		 *
		 * @readonly
		 * @member {Object}
		 */
		this.styles = styles;

		/**
		 * Defines enabled styles. Different set of styles will be enabled
		 * depending on the current selection.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #enabledStyles
		 */
		this.set( 'enabledStyles', [] );

		/**
		 * Refresh state.
		 */
		this.refresh();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		let value = [];
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const block = first( selection.getSelectedBlocks() );

		this.enabledStyles = [];

		if ( !block || !editor.model.schema.isObject( block ) ) {
			value = this._prepareNewInlineElementValue( value, selection );
			this.enabledStyles = this.styles.getInlineElementsNames();

			if ( block ) {
				value = this._prepareNewBlockElementValue( value, block );
			}
		}

		this.isEnabled = this.enabledStyles.length > 0;
		this.value = this.isEnabled ? value : [];
	}

	/**
	 * Executes the command &mdash; applies the style classes to the selection or removes it from the selection.
	 *
	 * If the command value already contains the requested style, it will remove the style classes. Otherwise, it will set it.
	 *
	 * The execution result differs, depending on the {@link module:engine/model/document~Document#selection} and the
	 * style type (inline or block):
	 *
	 * * When applying inline styles:
	 * * * If the selection is on a range, the command applies the style classes to all nodes in that range.
	 * * * If the selection is collapsed in a non-empty node, the command applies the style classes to the
	 * {@link module:engine/model/document~Document#selection} itself (note that typed characters copy style classes from the selection).
	 *
	 * * When applying block styles:
	 * * * If the selection is on a range, the command applies the style classes to the nearest block parent element.
	 *
	 * * When selection is set on a widget object:
	 * * * Do nothing. Widgets are not yet supported by the style command.
	 *
	 * @fires execute
	 * @param {String} styleName Style name matching the one defined in the config.
	 */
	execute( styleName ) {
		if ( !this.enabledStyles.includes( styleName ) ) {
			/**
			 * Style command can be executed only on a correct style name.
			 * This warning may be caused by passing name that it not specified in any of the
			 * definitions in the styles config, when trying to apply style that is not allowed
			 * on given element or passing class name instead of the style name.
			 *
			 * @error style-command-executed-with-incorrect-style-name
			 */
			logWarning( 'style-command-executed-with-incorrect-style-name' );
			return;
		}

		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const selectedBlockElement = first( selection.getSelectedBlocks() );
		const definition = this.styles.getDefinitionsByName( styleName );

		if ( selectedBlockElement && definition.isBlock ) {
			this._handleStyleUpdate( definition, selectedBlockElement );
		} else {
			this._handleStyleUpdate( definition, selection );
		}
	}

	/**
	 * TODO
	 *
	 * @param {TODO} definition
	 * @param {TODO} selectable
	 */
	_handleStyleUpdate( definition, selectable ) {
		const { name, element, classes } = definition;
		const htmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		if ( this.value.includes( name ) ) {
			htmlSupport.removeModelHtmlClass( element, classes, selectable );
		} else {
			htmlSupport.addModelHtmlClass( element, classes, selectable );
		}
	}

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} selection
	 */
	_prepareNewInlineElementValue( value, selection ) {
		let newValue = [];

		const attributes = selection.getAttributes();

		for ( const [ attribute ] of attributes ) {
			newValue = [ ...value, ...this._getAttributeValue( attribute ) ];
		}

		return newValue;
	}

	/**
	 * TODO
	 *
	 * @param {TODO} value
	 * @param {TODO} block
	 */
	_prepareNewBlockElementValue( value, block ) {
		const availableDefinitions = this.styles.getDefinitionsByElementName( block.name );

		if ( availableDefinitions ) {
			const blockStyleNames = availableDefinitions.map( ( { name } ) => name );
			this.enabledStyles = [ ...this.enabledStyles, ...blockStyleNames ];
		}

		return [ ...value, ...this._getAttributeValue( 'htmlAttributes' ) ];
	}

	/**
	 * TODO
	 *
	 * @param {TODO} attribute
	 */
	_getAttributeValue( attribute ) {
		const value = [];
		const classes = attribute === 'htmlAttributes' ?
			this._getValueFromBlockElement() :
			this._getValueFromFirstAllowedNode( attribute );

		for ( const htmlClass of classes ) {
			const { name } = this.styles.getDefinitionsByClassName( htmlClass ) || {};

			value.push( name );
		}

		return value;
	}

	/**
	 * TODO
	 */
	_getValueFromBlockElement() {
		const selection = this.editor.model.document.selection;
		const block = first( selection.getSelectedBlocks() );
		const attributes = block.getAttribute( 'htmlAttributes' );

		if ( attributes ) {
			return attributes.classes;
		}

		return [];
	}

	/**
	 * TODO
	 *
	 * @param {TODO} attributeName
	 */
	_getValueFromFirstAllowedNode( attributeName ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			const { classes } = selection.getAttribute( attributeName );
			return classes;
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				const { classes } = item.getAttribute( attributeName );
				return classes;
			}
		}
	}
}
