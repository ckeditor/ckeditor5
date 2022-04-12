/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/stylecommand
 */

import { Command } from 'ckeditor5/src/core';
import { logWarning, first } from 'ckeditor5/src/utils';

/**
 * Style command.
 *
 * Applies and removes styles from selection and elements.
 *
 * @extends module:core/command~Command
 */
export default class StyleCommand extends Command {
	constructor( editor, styles ) {
		super( editor );

		/**
		 * Set of currently applied styles on current selection.
		 *
		 * Names of styles correspond to the `name` property of
		 * {@link module:style/style~StyleDefinition configured definitions}.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean|String} #value
		 */

		/**
		 * Styles object. Helps in getting styles definitions by
		 * class name, style name and model element name.
		 *
		 * @private
		 * @readonly
		 * @member {module:style/styleediting~Styles}
		 */
		this.styles = styles;

		/**
		 * Names of enabled styles (styles that can be applied to the current selection).
		 *
		 * Names of enabled styles correspond to the `name` property of
		 * {@link module:style/style~StyleDefinition configured definitions}.
		 *
		 * @readonly
		 * @observable
		 * @member {Array.<String>} #enabledStyles
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
	 *   * If the selection is on a range, the command applies the style classes to all nodes in that range.
	 *   * If the selection is collapsed in a non-empty node, the command applies the style classes to the
	 * {@link module:engine/model/document~Document#selection} itself (note that typed characters copy style classes from the selection).
	 *
	 * * When applying block styles:
	 *   * If the selection is on a range, the command applies the style classes to the nearest block parent element.
	 *
	 * * When selection is set on a widget object:
	 *   * Do nothing. Widgets are not yet supported by the style command.
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
	 * Adds or removes classes to element, range or selection.
	 *
	 * @private
	 * @param {Object} definition Style definition object.
	 * @param {module:engine/model/selection~Selectable} selectable Selection, range or element to update the style on.
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
	 * Returns inline element value.
	 *
	 * @private
	 * @param {Array} value
	 * @param {module:engine/model/selection~Selection} selection
	 */
	_prepareNewInlineElementValue( value, selection ) {
		let newValue = [ ...value ];

		const attributes = selection.getAttributes();

		for ( const [ attribute ] of attributes ) {
			newValue = [ ...newValue, ...this._getAttributeValue( attribute ) ];
		}

		return newValue;
	}

	/**
	 * Returns element value and sets enabled styles.
	 *
	 * @private
	 * @param {Array} value
	 * @param {Object|null} element
	 * @return {Array} Current block element styles value.
	 */
	_prepareNewBlockElementValue( value, element ) {
		const availableDefinitions = this.styles.getDefinitionsByElementName( element.name );

		if ( availableDefinitions ) {
			const blockStyleNames = availableDefinitions.map( ( { name } ) => name );
			this.enabledStyles = [ ...this.enabledStyles, ...blockStyleNames ];
		}

		return [ ...value, ...this._getAttributeValue( 'htmlAttributes' ) ];
	}

	/**
	 * Get classes attribute value.
	 *
	 * @private
	 * @param {String} attribute
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
	 * Gets classes from currently selected block element.
	 *
	 * @private
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
	 * Gets classes from currently selected text element.
	 *
	 * @private
	 * @param {String} attributeName Text attribute name.
	 */
	_getValueFromFirstAllowedNode( attributeName ) {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			/* istanbul ignore next */
			const { classes } = selection.getAttribute( attributeName ) || {};

			/* istanbul ignore next */
			return classes || [];
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				/* istanbul ignore else */
				if ( schema.checkAttribute( item, attributeName ) ) {
					/* istanbul ignore next */
					const { classes } = item.getAttribute( attributeName ) || {};

					/* istanbul ignore next */
					return classes || [];
				}
			}
		}

		/* istanbul ignore next */
		return [];
	}
}
