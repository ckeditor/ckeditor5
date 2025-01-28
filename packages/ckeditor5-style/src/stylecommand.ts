/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/stylecommand
 */

import type { DocumentSelection, Element } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { logWarning, first } from 'ckeditor5/src/utils.js';
import type { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import StyleUtils, {
	type BlockStyleDefinition,
	type NormalizedStyleDefinition,
	type NormalizedStyleDefinitions
} from './styleutils.js';

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
	 * The StyleUtils plugin.
	 */
	private _styleUtils: StyleUtils;

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
		this._styleUtils = this.editor.plugins.get( StyleUtils );
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
			// Check if this inline style is enabled.
			if ( this._styleUtils.isStyleEnabledForInlineSelection( definition, selection ) ) {
				enabledStyles.add( definition.name );
			}

			// Check if this inline style is active.
			if ( this._styleUtils.isStyleActiveForInlineSelection( definition, selection ) ) {
				value.add( definition.name );
			}
		}

		// Block styles.
		const firstBlock = first( selection.getSelectedBlocks() ) || selection.getFirstPosition()!.parent;

		if ( firstBlock ) {
			const ancestorBlocks = firstBlock.getAncestors( { includeSelf: true, parentFirst: true } ) as Array<Element>;

			for ( const block of ancestorBlocks ) {
				if ( block.is( 'rootElement' ) ) {
					break;
				}

				for ( const definition of this._styleDefinitions.block ) {
					// Check if this block style is enabled.
					if ( !this._styleUtils.isStyleEnabledForBlock( definition, block ) ) {
						continue;
					}

					enabledStyles.add( definition.name );

					// Check if this block style is active.
					if ( this._styleUtils.isStyleActiveForBlock( definition, block ) ) {
						value.add( definition.name );
					}
				}

				// E.g. reached a model table when the selection is in a cell. The command should not modify
				// ancestors of a table.
				if ( model.schema.isObject( block ) ) {
					break;
				}
			}
		}

		this.enabledStyles = Array.from( enabledStyles ).sort();
		this.isEnabled = this.enabledStyles.length > 0;
		this.value = this.isEnabled ? Array.from( value ).sort() : [];
	}

	/**
	 * Executes the command &ndash; applies the style classes to the selection or removes it from the selection.
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

		const allDefinitions: Array<NormalizedStyleDefinition> = [
			...this._styleDefinitions.inline,
			...this._styleDefinitions.block
		];

		const activeDefinitions = allDefinitions.filter( ( { name } ) => this.value.includes( name ) );
		const definition: NormalizedStyleDefinition = allDefinitions.find( ( { name } ) => name == styleName )!;
		const shouldAddStyle = forceValue === undefined ? !this.value.includes( definition.name ) : forceValue;

		model.change( () => {
			let selectables;

			if ( isBlockStyleDefinition( definition ) ) {
				selectables = this._findAffectedBlocks( getBlocksFromSelection( selection ),
					definition
				);
			} else {
				selectables = [ this._styleUtils.getAffectedInlineSelectable( definition, selection ) ];
			}

			for ( const selectable of selectables ) {
				if ( shouldAddStyle ) {
					htmlSupport.addModelHtmlClass( definition.element, definition.classes, selectable );
				} else {
					htmlSupport.removeModelHtmlClass(
						definition.element,
						getDefinitionExclusiveClasses( activeDefinitions, definition ),
						selectable
					);
				}
			}
		} );
	}

	/**
	 * Returns a set of elements that should be affected by the block-style change.
	 */
	private _findAffectedBlocks(
		selectedBlocks: Iterable<Element>,
		definition: BlockStyleDefinition
	): Set<Element> {
		const blocks = new Set<Element>();

		for ( const selectedBlock of selectedBlocks ) {
			const ancestorBlocks = selectedBlock.getAncestors( { includeSelf: true, parentFirst: true } ) as Array<Element>;

			for ( const block of ancestorBlocks ) {
				if ( block.is( 'rootElement' ) ) {
					break;
				}

				const affectedBlocks = this._styleUtils.getAffectedBlocks( definition, block );

				if ( affectedBlocks ) {
					for ( const affectedBlock of affectedBlocks ) {
						blocks.add( affectedBlock );
					}

					break;
				}
			}
		}

		return blocks;
	}
}

/**
 * Returns classes that are defined only in the supplied definition and not in any other active definition. It's used
 * to ensure that classes used by other definitions are preserved when a style is removed. See #11748.
 *
 * @param activeDefinitions All currently active definitions affecting selected element(s).
 * @param definition Definition whose classes will be compared with all other active definition classes.
 * @returns Array of classes exclusive to the supplied definition.
 */
function getDefinitionExclusiveClasses(
	activeDefinitions: Array<NormalizedStyleDefinition>,
	definition: NormalizedStyleDefinition
): Array<string> {
	return activeDefinitions.reduce( ( classes: Array<string>, currentDefinition: NormalizedStyleDefinition ) => {
		if ( currentDefinition.name === definition.name ) {
			return classes;
		}

		return classes.filter( className => !currentDefinition.classes.includes( className ) );
	}, definition.classes );
}

/**
 * Checks if provided style definition is of type block.
 */
function isBlockStyleDefinition( definition: NormalizedStyleDefinition ): definition is BlockStyleDefinition {
	return 'isBlock' in definition;
}

/**
 * Gets block elements from selection. If there are none, returns first selected element.
 * @param selection Current document's selection.
 * @returns Selected blocks if there are any, first selected element otherwise.
 */
function getBlocksFromSelection( selection: DocumentSelection ) {
	const blocks = Array.from( selection.getSelectedBlocks() );
	if ( blocks.length ) {
		return blocks;
	}
	return [ selection.getFirstPosition()!.parent as Element ];
}
