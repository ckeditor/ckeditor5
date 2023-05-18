/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/stylecommand
 */

import type { Element, Schema } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
import { logWarning, first } from 'ckeditor5/src/utils';
import type { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { isObject } from 'lodash-es';

import type { BlockStyleDefinition, InlineStyleDefinition, NormalizedStyleDefinitions } from './styleutils';

/**
 * Style command.
 *
 * Applies and removes styles from selection and elements.
 */
export default class StyleCommand extends Command {
	/**
	 * Set of currently applied styles on the current selection.
	 *
	 * Names of styles correspond to the `name` property of
	 * {@link module:style/styleconfig~StyleDefinition configured definitions}.
	 *
	 * @observable
	 */
	declare public value: Array<string>;

	/**
	 * Names of enabled styles (styles that can be applied to the current selection).
	 *
	 * Names of enabled styles correspond to the `name` property of
	 * {@link module:style/styleconfig~StyleDefinition configured definitions}.
	 *
	 * @observable
	 */
	declare public enabledStyles: Array<string>;

	/**
	 * Normalized definitions of the styles.
	 */
	private readonly _styleDefinitions: NormalizedStyleDefinitions;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor Editor on which this command will be used.
	 * @param styleDefinitions Normalized definitions of the styles.
	 */
	constructor( editor: Editor, styleDefinitions: NormalizedStyleDefinitions ) {
		super( editor );

		this.set( 'value', [] );
		this.set( 'enabledStyles', [] );

		this._styleDefinitions = styleDefinitions;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		const value = new Set<string>();
		const enabledStyles = new Set<string>();

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

		if ( firstBlock ) {
			const ancestorBlocks = firstBlock.getAncestors( { includeSelf: true, parentFirst: true } ) as Array<Element>;

			for ( const block of ancestorBlocks ) {
				// E.g. reached a model table when the selection is in a cell. The command should not modify
				// ancestors of a table.
				if ( model.schema.isLimit( block ) ) {
					break;
				}

				if ( !model.schema.checkAttribute( block, 'htmlAttributes' ) ) {
					continue;
				}

				for ( const definition of this._styleDefinitions.block ) {
					// Check if this block style is enabled.
					if ( !definition.modelElements.includes( block.name ) ) {
						continue;
					}

					enabledStyles.add( definition.name );

					// Check if this block style is active.
					const ghsAttributeValue = block.getAttribute( 'htmlAttributes' );

					if ( hasAllClasses( ghsAttributeValue, definition.classes ) ) {
						value.add( definition.name );
					}
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
	 * {@link module:engine/model/document~Document#selection}.
	 *
	 * * When applying block styles:
	 *   * If the selection is on a range, the command applies the style classes to the nearest block parent element.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.styleName Style name matching the one defined in the
	 * {@link module:style/styleconfig~StyleConfig#definitions configuration}.
	 * @param options.forceValue Whether the command should add given style (`true`) or remove it (`false`) from the selection.
	 * If not set (default), the command will toggle the style basing on the first selected node. Note, that this will not force
	 * setting a style on an element that cannot receive given style.
	 */
	public override execute( { styleName, forceValue }: { styleName: string; forceValue?: boolean } ): void {
		if ( !this.enabledStyles.includes( styleName ) ) {
			/**
			 * Style command can be executed only with a correct style name.
			 *
			 * This warning may be caused by:
			 *
			 * * passing a name that is not specified in the {@link module:style/styleconfig~StyleConfig#definitions configuration}
			 * (e.g. a CSS class name),
			 * * when trying to apply a style that is not allowed on a given element.
			 *
			 * @error style-command-executed-with-incorrect-style-name
			 */
			logWarning( 'style-command-executed-with-incorrect-style-name' );

			return;
		}

		const model = this.editor.model;
		const selection = model.document.selection;
		const htmlSupport: GeneralHtmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		const definition: BlockStyleDefinition | InlineStyleDefinition = [
			...this._styleDefinitions.inline,
			...this._styleDefinitions.block
		].find( ( { name } ) => name == styleName )!;

		const shouldAddStyle = forceValue === undefined ? !this.value.includes( definition.name ) : forceValue;

		model.change( () => {
			let selectables;

			if ( isBlockStyleDefinition( definition ) ) {
				selectables = getAffectedBlocks( selection.getSelectedBlocks(), definition.modelElements, model.schema );
			} else {
				selectables = [ selection ];
			}

			for ( const selectable of selectables ) {
				if ( shouldAddStyle ) {
					htmlSupport.addModelHtmlClass( definition.element, definition.classes, selectable );
				} else {
					htmlSupport.removeModelHtmlClass( definition.element, definition.classes, selectable );
				}
			}
		} );
	}

	/**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection, returns the selection attribute.
	 *
	 * @param attributeName Name of the GHS attribute.
	 * @returns The attribute value.
	 */
	private _getValueFromFirstAllowedNode( attributeName: string ): unknown | null {
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

/**
 * Verifies if all classes are present in the given GHS attribute.
 */
function hasAllClasses( ghsAttributeValue: unknown, classes: Array<string> ): boolean {
	return isObject( ghsAttributeValue ) &&
		hasClassesProperty( ghsAttributeValue ) &&
		classes.every( className => ghsAttributeValue.classes.includes( className ) );
}

/**
 * Returns a set of elements that should be affected by the block-style change.
 */
function getAffectedBlocks(
	selectedBlocks: IterableIterator<Element>,
	elementNames: Array<string>,
	schema: Schema
): Set<Element> {
	const blocks = new Set<Element>();

	for ( const selectedBlock of selectedBlocks ) {
		const ancestorBlocks: Array<Element> = selectedBlock.getAncestors( { includeSelf: true, parentFirst: true } ) as Array<Element>;

		for ( const block of ancestorBlocks ) {
			if ( schema.isLimit( block ) ) {
				break;
			}

			if ( elementNames.includes( block.name ) ) {
				blocks.add( block );

				break;
			}
		}
	}

	return blocks;
}

/**
 * Checks if provided style definition is of type block.
 */
function isBlockStyleDefinition( definition: BlockStyleDefinition | InlineStyleDefinition ): definition is BlockStyleDefinition {
	return 'isBlock' in definition;
}

/**
 * Checks if given object has `classes` property which is an array.
 *
 * @param obj Object to check.
 */
function hasClassesProperty<T extends { classes?: Array<unknown> }>( obj: T ): obj is T & { classes: Array<unknown> } {
	return Boolean( obj.classes ) && Array.isArray( obj.classes );
}
