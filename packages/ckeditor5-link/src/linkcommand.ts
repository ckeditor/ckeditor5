/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkcommand
 */

import { Command } from 'ckeditor5/src/core';
import { findAttributeRange } from 'ckeditor5/src/typing';
import { Collection, first, toMap } from 'ckeditor5/src/utils';
import type { Range, DocumentSelection, Model, Writer } from 'ckeditor5/src/engine';

import AutomaticDecorators from './utils/automaticdecorators';
import { isLinkableElement } from './utils';
import type ManualDecorator from './utils/manualdecorator';

/**
 * The link command. It is used by the {@link module:link/link~Link link feature}.
 */
export default class LinkCommand extends Command {
	/**
	 * The value of the `'linkHref'` attribute if the start of the selection is located in a node with this attribute.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: string | undefined;

	/**
	 * A collection of {@link module:link/utils/manualdecorator~ManualDecorator manual decorators}
	 * corresponding to the {@link module:link/linkconfig~LinkConfig#decorators decorator configuration}.
	 *
	 * You can consider it a model with states of manual decorators added to the currently selected link.
	 */
	public readonly manualDecorators = new Collection<ManualDecorator>();

	/**
	 * An instance of the helper that ties together all {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition}
	 * that are used by the {@glink features/link link} and the {@glink features/images/images-linking linking images} features.
	 */
	public readonly automaticDecorators = new AutomaticDecorators();

	/**
	 * Synchronizes the state of {@link #manualDecorators} with the currently present elements in the model.
	 */
	public restoreManualDecoratorStates(): void {
		for ( const manualDecorator of this.manualDecorators ) {
			manualDecorator.value = this._getDecoratorStateFromModel( manualDecorator.id );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedElement = selection.getSelectedElement() || first( selection.getSelectedBlocks() );

		// A check for any integration that allows linking elements (e.g. `LinkImage`).
		// Currently the selection reads attributes from text nodes only. See #7429 and #7465.
		if ( isLinkableElement( selectedElement, model.schema ) ) {
			this.value = selectedElement.getAttribute( 'linkHref' ) as string | undefined;
			this.isEnabled = model.schema.checkAttribute( selectedElement, 'linkHref' );
		} else {
			this.value = selection.getAttribute( 'linkHref' ) as string | undefined;
			this.isEnabled = model.schema.checkAttributeInSelection( selection, 'linkHref' );
		}

		for ( const manualDecorator of this.manualDecorators ) {
			manualDecorator.value = this._getDecoratorStateFromModel( manualDecorator.id );
		}
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is non-collapsed, the `linkHref` attribute will be applied to nodes inside the selection, but only to
	 * those nodes where the `linkHref` attribute is allowed (disallowed nodes will be omitted).
	 *
	 * When the selection is collapsed and is not inside the text with the `linkHref` attribute, a
	 * new {@link module:engine/model/text~Text text node} with the `linkHref` attribute will be inserted in place of the caret, but
	 * only if such element is allowed in this place. The `_data` of the inserted text will equal the `href` parameter.
	 * The selection will be updated to wrap the just inserted text node.
	 *
	 * When the selection is collapsed and inside the text with the `linkHref` attribute, the attribute value will be updated.
	 *
	 * # Decorators and model attribute management
	 *
	 * There is an optional argument to this command that applies or removes model
	 * {@glink framework/guides/architecture/editing-engine#text-attributes text attributes} brought by
	 * {@link module:link/utils/manualdecorator~ManualDecorator manual link decorators}.
	 *
	 * Text attribute names in the model correspond to the entries in the {@link module:link/linkconfig~LinkConfig#decorators
	 * configuration}.
	 * For every decorator configured, a model text attribute exists with the "link" prefix. For example, a `'linkMyDecorator'` attribute
	 * corresponds to `'myDecorator'` in the configuration.
	 *
	 * To learn more about link decorators, check out the {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`}
	 * documentation.
	 *
	 * Here is how to manage decorator attributes with the link command:
	 *
	 * ```ts
	 * const linkCommand = editor.commands.get( 'link' );
	 *
	 * // Adding a new decorator attribute.
	 * linkCommand.execute( 'http://example.com', {
	 * 	linkIsExternal: true
	 * } );
	 *
	 * // Removing a decorator attribute from the selection.
	 * linkCommand.execute( 'http://example.com', {
	 * 	linkIsExternal: false
	 * } );
	 *
	 * // Adding multiple decorator attributes at the same time.
	 * linkCommand.execute( 'http://example.com', {
	 * 	linkIsExternal: true,
	 * 	linkIsDownloadable: true,
	 * } );
	 *
	 * // Removing and adding decorator attributes at the same time.
	 * linkCommand.execute( 'http://example.com', {
	 * 	linkIsExternal: false,
	 * 	linkFoo: true,
	 * 	linkIsDownloadable: false,
	 * } );
	 * ```
	 *
	 * **Note**: If the decorator attribute name is not specified, its state remains untouched.
	 *
	 * **Note**: {@link module:link/unlinkcommand~UnlinkCommand#execute `UnlinkCommand#execute()`} removes all
	 * decorator attributes.
	 *
	 * @fires execute
	 * @param href Link destination.
	 * @param manualDecoratorIds The information about manual decorator attributes to be applied or removed upon execution.
	 */
	public override execute( href: string, manualDecoratorIds: Record<string, boolean> = {} ): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		// Stores information about manual decorators to turn them on/off when command is applied.
		const truthyManualDecorators: Array<string> = [];
		const falsyManualDecorators: Array<string> = [];

		for ( const name in manualDecoratorIds ) {
			if ( manualDecoratorIds[ name ] ) {
				truthyManualDecorators.push( name );
			} else {
				falsyManualDecorators.push( name );
			}
		}

		model.change( writer => {
			// If selection is collapsed then update selected link or insert new one at the place of caret.
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition()!;

				// When selection is inside text with `linkHref` attribute.
				if ( selection.hasAttribute( 'linkHref' ) ) {
					const linkText = extractTextFromSelection( selection );
					// Then update `linkHref` value.
					let linkRange = findAttributeRange( position, 'linkHref', selection.getAttribute( 'linkHref' ), model );

					if ( selection.getAttribute( 'linkHref' ) === linkText ) {
						linkRange = this._updateLinkContent( model, writer, linkRange, href );
					}

					writer.setAttribute( 'linkHref', href, linkRange );

					truthyManualDecorators.forEach( item => {
						writer.setAttribute( item, true, linkRange );
					} );

					falsyManualDecorators.forEach( item => {
						writer.removeAttribute( item, linkRange );
					} );

					// Put the selection at the end of the updated link.
					writer.setSelection( writer.createPositionAfter( linkRange.end.nodeBefore! ) );
				}
				// If not then insert text node with `linkHref` attribute in place of caret.
				// However, since selection is collapsed, attribute value will be used as data for text node.
				// So, if `href` is empty, do not create text node.
				else if ( href !== '' ) {
					const attributes = toMap( selection.getAttributes() );

					attributes.set( 'linkHref', href );

					truthyManualDecorators.forEach( item => {
						attributes.set( item, true );
					} );

					const { end: positionAfter } = model.insertContent( writer.createText( href, attributes ), position );

					// Put the selection at the end of the inserted link.
					// Using end of range returned from insertContent in case nodes with the same attributes got merged.
					writer.setSelection( positionAfter );
				}

				// Remove the `linkHref` attribute and all link decorators from the selection.
				// It stops adding a new content into the link element.
				[ 'linkHref', ...truthyManualDecorators, ...falsyManualDecorators ].forEach( item => {
					writer.removeSelectionAttribute( item );
				} );
			} else {
				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where the `linkHref` attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'linkHref' );

				// But for the first, check whether the `linkHref` attribute is allowed on selected blocks (e.g. the "image" element).
				const allowedRanges = [];

				for ( const element of selection.getSelectedBlocks() ) {
					if ( model.schema.checkAttribute( element, 'linkHref' ) ) {
						allowedRanges.push( writer.createRangeOn( element ) );
					}
				}

				// Ranges that accept the `linkHref` attribute. Since we will iterate over `allowedRanges`, let's clone it.
				const rangesToUpdate = allowedRanges.slice();

				// For all selection ranges we want to check whether given range is inside an element that accepts the `linkHref` attribute.
				// If so, we don't want to propagate applying the attribute to its children.
				for ( const range of ranges ) {
					if ( this._isRangeToUpdate( range, allowedRanges ) ) {
						rangesToUpdate.push( range );
					}
				}

				for ( const range of rangesToUpdate ) {
					let linkRange = range;

					if ( rangesToUpdate.length === 1 ) {
						// Current text of the link in the document.
						const linkText = extractTextFromSelection( selection );

						if ( selection.getAttribute( 'linkHref' ) === linkText ) {
							linkRange = this._updateLinkContent( model, writer, range, href );
							writer.setSelection( writer.createSelection( linkRange ) );
						}
					}

					writer.setAttribute( 'linkHref', href, linkRange );

					truthyManualDecorators.forEach( item => {
						writer.setAttribute( item, true, linkRange );
					} );

					falsyManualDecorators.forEach( item => {
						writer.removeAttribute( item, linkRange );
					} );
				}
			}
		} );
	}

	/**
	 * Provides information whether a decorator with a given name is present in the currently processed selection.
	 *
	 * @param decoratorName The name of the manual decorator used in the model
	 * @returns The information whether a given decorator is currently present in the selection.
	 */
	private _getDecoratorStateFromModel( decoratorName: string ): boolean | undefined {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedElement = selection.getSelectedElement();

		// A check for the `LinkImage` plugin. If the selection contains an element, get values from the element.
		// Currently the selection reads attributes from text nodes only. See #7429 and #7465.
		if ( isLinkableElement( selectedElement, model.schema ) ) {
			return selectedElement.getAttribute( decoratorName ) as boolean | undefined;
		}

		return selection.getAttribute( decoratorName ) as boolean | undefined;
	}

	/**
	 * Checks whether specified `range` is inside an element that accepts the `linkHref` attribute.
	 *
	 * @param range A range to check.
	 * @param allowedRanges An array of ranges created on elements where the attribute is accepted.
	 */
	private _isRangeToUpdate( range: Range, allowedRanges: Array<Range> ): boolean {
		for ( const allowedRange of allowedRanges ) {
			// A range is inside an element that will have the `linkHref` attribute. Do not modify its nodes.
			if ( allowedRange.containsRange( range ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Updates selected link with a new value as its content and as its href attribute.
	 *
	 * @param model Model is need to insert content.
	 * @param writer Writer is need to create text element in model.
	 * @param range A range where should be inserted content.
	 * @param href A link value which should be in the href attribute and in the content.
	 */
	private _updateLinkContent( model: Model, writer: Writer, range: Range, href: string ): Range {
		const text = writer.createText( href, { linkHref: href } );

		return model.insertContent( text, range );
	}
}

// Returns a text of a link under the collapsed selection or a selection that contains the entire link.
function extractTextFromSelection( selection: DocumentSelection ): string | null {
	if ( selection.isCollapsed ) {
		const firstPosition = selection.getFirstPosition();

		return firstPosition!.textNode && firstPosition!.textNode.data;
	} else {
		const rangeItems = Array.from( selection.getFirstRange()!.getItems() );

		if ( rangeItems.length > 1 ) {
			return null;
		}

		const firstNode = rangeItems[ 0 ];

		if ( firstNode.is( '$text' ) || firstNode.is( '$textProxy' ) ) {
			return firstNode.data;
		}

		return null;
	}
}
