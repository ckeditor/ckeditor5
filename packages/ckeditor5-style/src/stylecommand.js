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
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 * @param {Object} styleDefinitions Normalized definitions of the styles.
	 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions.block Definitions of block styles.
	 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions.inline Definitions of inline styles.
	 */
	constructor( editor, styleDefinitions ) {
		super( editor );

		/**
		 * Set of currently applied styles on current selection.
		 *
		 * Names of styles correspond to the `name` property of
		 * {@link module:style/style~StyleDefinition configured definitions}.
		 *
		 * @observable
		 * @readonly
		 * @member {Array.<String>} #value
		 */

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
		 * Normalized definitions of the styles.
		 *
		 * @private
		 * @readonly
		 * @member {Object} #styleDefinitions
		 */
		this._styleDefinitions = styleDefinitions;

		// TODO is this needed?
		this.refresh();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const value = new Set();
		const enabledStyles = new Set();

		// Inline styles.
		for ( const definition of this._styleDefinitions.inline ) {
			for ( const ghsAttributeName of definition.ghsAttributes ) {
				// Check if this inline style is enabled.
				if ( model.schema.checkAttributeInSelection( selection, ghsAttributeName ) ) {
					enabledStyles.add( definition.name );
				}

				// Check if this inline style is active.
				const ghsAttributeValue = this._getValueFromFirstAllowedNode( ghsAttributeName );

				if ( hasAllClasses( ghsAttributeValue, definition.classes ) ) {
					value.add( definition.name );
				}
			}
		}

		// Block styles.
		const firstBlock = first( selection.getSelectedBlocks() );

		if ( firstBlock && model.schema.checkAttribute( firstBlock, 'htmlAttributes' ) && !model.schema.isObject( firstBlock ) ) {
			for ( const definition of this._styleDefinitions.block ) {
				// Check if this block style is enabled.
				if ( !definition.modelElements.includes( firstBlock.name ) ) {
					continue;
				}

				enabledStyles.add( definition.name );

				// Check if this block style is active.
				const ghsAttributeValue = firstBlock.getAttribute( 'htmlAttributes' );

				if ( hasAllClasses( ghsAttributeValue, definition.classes ) ) {
					value.add( definition.name );
				}
			}
		}

		this.enabledStyles = Array.from( enabledStyles ).sort();
		this.isEnabled = this.enabledStyles.length > 0;
		this.value = this.isEnabled ? Array.from( value ).sort() : [];
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

		const model = this.editor.model;
		const selection = model.document.selection;
		const htmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		const definition = [
			...this._styleDefinitions.inline,
			...this._styleDefinitions.block
		].find( ( { name } ) => name == styleName );

		model.change( () => {
			const selectables = [];

			if ( definition.isBlock ) {
				for ( const block of selection.getSelectedBlocks() ) {
					if ( definition.modelElements.includes( block.name ) ) {
						selectables.push( block );
					}
				}
			} else {
				selectables.push( selection );
			}

			for ( const selectable of selectables ) {
				if ( this.value.includes( definition.name ) ) {
					htmlSupport.removeModelHtmlClass( definition.element, definition.classes, selectable );
				} else {
					htmlSupport.addModelHtmlClass( definition.element, definition.classes, selectable );
				}
			}
		} );
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

// Verifies if all classes are set on the given GHS attribute.
function hasAllClasses( ghsAttributeValue, classes ) {
	if ( !ghsAttributeValue || !ghsAttributeValue.classes ) {
		return false;
	}

	return classes.every( className => ghsAttributeValue.classes.includes( className ) );
}
