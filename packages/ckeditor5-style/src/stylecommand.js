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
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		const value = [];
		const enabledStyles = [];

		// Inline styles;
		for ( const ghsAttributeName of this.styles.getInlineGhsAttributeNames() ) {
			// Active styles.
			const ghsAttributeValue = this._getValueFromFirstAllowedNode( ghsAttributeName );
			const styleNames = this._getStyleNamesForGhsAttributeValue( ghsAttributeValue );

			value.push( ...styleNames );

			// Enabled styles.
			if ( model.schema.checkAttributeInSelection( selection, ghsAttributeName ) ) {
				const definitions = this.styles.getDefinitionsByGhsAttributeName( ghsAttributeName );

				for ( const definition of definitions ) {
					enabledStyles.push( definition.name );
				}
			}
		}

		// Block styles.
		const firstBlock = first( selection.getSelectedBlocks() );

		if ( firstBlock && model.schema.checkAttribute( firstBlock, 'htmlAttributes' ) && !model.schema.isObject( firstBlock ) ) {
			// Active styles.
			const ghsAttributeValue = firstBlock.getAttribute( 'htmlAttributes' );
			const styleNames = this._getStyleNamesForGhsAttributeValue( ghsAttributeValue );

			value.push( ...styleNames );

			// Enabled styles.
			const definitions = this.styles.getDefinitionsByElementName( firstBlock.name );

			for ( const definition of definitions ) {
				enabledStyles.push( definition.name );
			}
		}

		this.enabledStyles = enabledStyles;
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
			 * This warning may be caused by passing name that is not specified in any of the
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

		model.change( () => {
			const definition = this.styles.getDefinitionsByName( styleName );

			if ( definition.isBlock ) {
				Array.from( doc.selection.getSelectedBlocks() )
					.filter( block => (
						definition.modelElements.includes( block.name ) &&
						model.schema.checkAttribute( block, 'htmlAttributes' ) )
					)
					.forEach( block => this._updateStyle( definition, block ) );
			} else {
				this._updateStyle( definition, selection );
			}
		} );
	}

	/**
	 * Adds or removes classes to element, range or selection.
	 *
	 * @private
	 * @param {Object} definition Style definition object.
	 * @param {module:engine/model/selection~Selectable} selectable Selection, range or element to update the style on.
	 */
	_updateStyle( { name, element, classes }, selectable ) {
		const htmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		if ( this.value.includes( name ) ) {
			htmlSupport.removeModelHtmlClass( element, classes, selectable );
		} else {
			htmlSupport.addModelHtmlClass( element, classes, selectable );
		}
	}

	/**
	 * TODO
	 */
	* _getStyleNamesForGhsAttributeValue( ghsAttributeValue ) {
		if ( !ghsAttributeValue || !ghsAttributeValue.classes ) {
			return;
		}

		for ( const className of ghsAttributeValue.classes ) {
			const definition = this.styles.getDefinitionsByClassName( className );

			if ( definition ) {
				yield definition.name;
			}
		}
	}

	/**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection returns the selection attribute.
	 *
	 * @private
	 * @param {String} attributeName Name of the GHS attribute.
	 * @returns {Object|null} The attribute value.
	 */
	_getValueFromFirstAllowedNode( attributeName ) {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;

		if ( selection.isCollapsed ) {
			return selection.getAttribute( attributeName );
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkAttribute( item, attributeName ) ) {
					return item.getAttribute( attributeName );
				}
			}
		}

		return null;
	}
}
