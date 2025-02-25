/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/linkcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { findAttributeRange } from 'ckeditor5/src/typing.js';
import { Collection, diff, first, toMap } from 'ckeditor5/src/utils.js';
import { LivePosition, type Range, type Item } from 'ckeditor5/src/engine.js';

import AutomaticDecorators from './utils/automaticdecorators.js';
import { extractTextFromLinkRange, isLinkableElement } from './utils.js';
import type ManualDecorator from './utils/manualdecorator.js';

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
	 * {@glink framework/architecture/editing-engine#text-attributes text attributes} brought by
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
	 * An optional parameter called `displayedText` is to add or update text of the link that represents the `href`. For example:
	 *
	 * ```ts
	 * const linkCommand = editor.commands.get( 'link' );
	 *
	 * // Adding a new link with `displayedText` attribute.
	 * linkCommand.execute( 'http://example.com', {}, 'Example' );
	 * ```
	 *
	 * The above code will create an anchor like this:
	 *
	 * ```html
	 * <a href="http://example.com">Example</a>
	 * ```
	 *
	 * @fires execute
	 * @param href Link destination.
	 * @param manualDecoratorIds The information about manual decorator attributes to be applied or removed upon execution.
	 * @param displayedText Text of the link.
	 */
	public override execute(
		href: string,
		manualDecoratorIds: Record<string, boolean> = {},
		displayedText?: string
	): void {
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
			const updateLinkAttributes = ( itemOrRange: Item | Range ): void => {
				writer.setAttribute( 'linkHref', href, itemOrRange );

				truthyManualDecorators.forEach( item => writer.setAttribute( item, true, itemOrRange ) );
				falsyManualDecorators.forEach( item => writer.removeAttribute( item, itemOrRange ) );
			};

			const updateLinkTextIfNeeded = ( range: Range, linkHref?: string ): Range | undefined => {
				const linkText = extractTextFromLinkRange( range );

				if ( !linkText ) {
					return range;
				}

				// Make a copy not to override the command param value.
				let newText = displayedText;

				if ( !newText ) {
					// Replace the link text with the new href if previously href was equal to text.
					// For example: `<a href="http://ckeditor.com/">http://ckeditor.com/</a>`.
					newText = linkHref && linkHref == linkText ? href : linkText;
				}

				// Only if needed.
				if ( newText != linkText ) {
					const changes = findChanges( linkText, newText );
					let insertsLength = 0;

					for ( const { offset, actual, expected } of changes ) {
						const updatedOffset = offset + insertsLength;
						const subRange = writer.createRange(
							range.start.getShiftedBy( updatedOffset ),
							range.start.getShiftedBy( updatedOffset + actual.length )
						);

						// Collect formatting attributes from replaced text.
						const textNode = getLinkPartTextNode( subRange, range )!;
						const attributes = textNode.getAttributes();
						const formattingAttributes = Array
							.from( attributes )
							.filter( ( [ key ] ) => model.schema.getAttributeProperties( key ).isFormatting );

						// Create a new text node.
						const newTextNode = writer.createText( expected, formattingAttributes );

						// Set link attributes before inserting to document to avoid Differ attributes edge case.
						updateLinkAttributes( newTextNode );

						// Replace text with formatting.
						model.insertContent( newTextNode, subRange );

						// Sum of all previous inserts.
						insertsLength += expected.length;
					}

					return writer.createRange( range.start, range.start.getShiftedBy( newText.length ) );
				}
			};

			const collapseSelectionAtLinkEnd = ( linkRange: Range ): void => {
				const { plugins } = this.editor;

				writer.setSelection( linkRange.end );

				if ( plugins.has( 'TwoStepCaretMovement' ) ) {
					// After replacing the text of the link, we need to move the caret to the end of the link,
					// override it's gravity to forward to prevent keeping e.g. bold attribute on the caret
					// which was previously inside the link.
					//
					// If the plugin is not available, the caret will be placed at the end of the link and the
					// bold attribute will be kept even if command moved caret outside the link.
					plugins.get( 'TwoStepCaretMovement' )._handleForwardMovement();
				} else {
					// Remove the `linkHref` attribute and all link decorators from the selection.
					// It stops adding a new content into the link element.
					for ( const key of [ 'linkHref', ...truthyManualDecorators, ...falsyManualDecorators ] ) {
						writer.removeSelectionAttribute( key );
					}
				}
			};

			// If selection is collapsed then update selected link or insert new one at the place of caret.
			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition()!;

				// When selection is inside text with `linkHref` attribute.
				if ( selection.hasAttribute( 'linkHref' ) ) {
					const linkHref = selection.getAttribute( 'linkHref' ) as string;
					const linkRange = findAttributeRange( position, 'linkHref', linkHref, model );
					const newLinkRange = updateLinkTextIfNeeded( linkRange, linkHref );

					updateLinkAttributes( newLinkRange || linkRange );

					// Put the selection at the end of the updated link only when text was changed.
					// When text was not altered we keep the original selection.
					if ( newLinkRange ) {
						collapseSelectionAtLinkEnd( newLinkRange );
					}
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

					const newLinkRange = model.insertContent( writer.createText( displayedText || href, attributes ), position );

					// Put the selection at the end of the inserted link.
					// Using end of range returned from insertContent in case nodes with the same attributes got merged.
					collapseSelectionAtLinkEnd( newLinkRange );
				}
			} else {
				// Non-collapsed selection.

				// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
				// omitting nodes where the `linkHref` attribute is disallowed.
				const selectionRanges = Array.from( selection.getRanges() );
				const ranges = model.schema.getValidRanges( selectionRanges, 'linkHref' );

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

				// Store the selection ranges in a pseudo live range array (stickiness to the outside of the range).
				const stickyPseudoRanges = selectionRanges.map( range => ( {
					start: LivePosition.fromPosition( range.start, 'toPrevious' ),
					end: LivePosition.fromPosition( range.end, 'toNext' )
				} ) );

				// Update or set links (including text update if needed).
				for ( let range of rangesToUpdate ) {
					const linkHref = ( range.start.textNode || range.start.nodeAfter! ).getAttribute( 'linkHref' ) as string | undefined;

					range = updateLinkTextIfNeeded( range, linkHref ) || range;

					updateLinkAttributes( range );
				}

				// The original selection got trimmed by replacing content so we need to restore it.
				writer.setSelection( stickyPseudoRanges.map( pseudoRange => {
					const start = pseudoRange.start.toPosition();
					const end = pseudoRange.end.toPosition();

					pseudoRange.start.detach();
					pseudoRange.end.detach();

					return model.createRange( start, end );
				} ) );
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
}

/**
 * Compares two strings and returns an array of changes needed to transform one into another.
 * Uses the diff utility to find the differences and groups them into chunks containing information
 * about the offset and actual/expected content.
 *
 * @param oldText The original text to compare.
 * @param newText The new text to compare against.
 * @returns Array of change objects containing offset and actual/expected content.
 *
 * @example
 * findChanges( 'hello world', 'hi there' );
 *
 * Returns:
 * [
 * 	{
 * 		"offset": 1,
 * 		"actual": "ello",
 * 		"expected": "i"
 * 	},
 * 	{
 * 		"offset": 2,
 * 		"actual": "wo",
 * 		"expected": "the"
 * 	},
 * 	{
 * 		"offset": 3,
 * 		"actual": "ld",
 * 		"expected": "e"
 * 	}
 * ]
 */
function findChanges( oldText: string, newText: string ): Array<{ offset: number; actual: string; expected: string }> {
	// Get array of operations (insert/delete/equal) needed to transform oldText into newText.
	// Example: diff('abc', 'abxc') returns ['equal', 'equal', 'insert', 'equal']
	const changes = diff( oldText, newText );

	// Track position in both strings based on operation type.
	const counter = { equal: 0, insert: 0, delete: 0 };
	const result = [];

	// Accumulate consecutive changes into slices before creating change objects.
	let actualSlice = '';
	let expectedSlice = '';

	// Adding null as sentinel value to handle final accumulated changes.
	for ( const action of [ ...changes, null ] ) {
		if ( action == 'insert' ) {
			// Example: for 'abc' -> 'abxc', at insert position, adds 'x' to expectedSlice.
			expectedSlice += newText[ counter.equal + counter.insert ];
		}
		else if ( action == 'delete' ) {
			// Example: for 'abc' -> 'ac', at delete position, adds 'b' to actualSlice.
			actualSlice += oldText[ counter.equal + counter.delete ];
		}
		else if ( actualSlice.length || expectedSlice.length ) {
			// On 'equal' or end: bundle accumulated changes into a single change object.
			// Example: { offset: 2, actual: "", expected: "x" }
			result.push( {
				offset: counter.equal,
				actual: actualSlice,
				expected: expectedSlice
			} );

			actualSlice = '';
			expectedSlice = '';
		}

		// Increment appropriate counter for the current operation.
		if ( action ) {
			counter[ action ]++;
		}
	}

	return result;
}

/**
 * Returns text node withing the link range that should be updated.
 *
 * @param range Partial link range.
 * @param linkRange Range of the entire link.
 * @returns Text node.
 */
function getLinkPartTextNode( range: Range, linkRange: Range ): Item | null {
	if ( !range.isCollapsed ) {
		return first( range.getItems() );
	}

	const position = range.start;

	if ( position.textNode ) {
		return position.textNode;
	}

	// If the range is at the start of a link range then prefer node inside a link range.
	if ( !position.nodeBefore || position.isEqual( linkRange.start ) ) {
		return position.nodeAfter;
	} else {
		return position.nodeBefore;
	}
}
