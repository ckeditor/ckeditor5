/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/mentionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import type {
	Element,
	Text,
	Writer,
	Document,
	AttributeElement,
	DowncastConversionApi,
	DowncastDispatcher,
	Position,
	Schema,
	DowncastAttributeEvent,
	Item
} from 'ckeditor5/src/engine';
import { uid } from 'ckeditor5/src/utils';

import MentionCommand from './mentioncommand';
import type { MentionAttribute } from './mention';

/**
 * The mention editing feature.
 *
 * It introduces the {@link module:mention/mentioncommand~MentionCommand command} and the `mention`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span class="mention" data-mention="@mention">`.
 */
export default class MentionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MentionEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		// Allow the mention attribute on all text nodes.
		model.schema.extend( '$text', { allowAttributes: 'mention' } );

		// Upcast conversion.
		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				key: 'data-mention',
				classes: 'mention'
			},
			model: {
				key: 'mention',
				value: ( viewElement: Element ) => _toMentionAttribute( viewElement )
			}
		} );

		// Downcast conversion.
		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: createViewMentionElement
		} );
		editor.conversion.for( 'downcast' ).add( preventPartialMentionDowncast );

		doc.registerPostFixer( writer => removePartialMentionPostFixer( writer, doc, model.schema ) );
		doc.registerPostFixer( writer => extendAttributeOnMentionPostFixer( writer, doc ) );
		doc.registerPostFixer( writer => selectionMentionAttributePostFixer( writer, doc ) );

		editor.commands.add( 'mention', new MentionCommand( editor ) );
	}
}

/**
 * @internal
 */
export function _addMentionAttributes(
	baseMentionData: { id: string; _text: string },
	data?: Record<string, unknown>
): MentionAttribute {
	return Object.assign( { uid: uid() }, baseMentionData, data || {} );
}

/**
 * Creates a mention attribute value from the provided view element and optional data.
 *
 * This function is exposed as
 * {@link module:mention/mention~Mention#toMentionAttribute `editor.plugins.get( 'Mention' ).toMentionAttribute()`}.
 *
 * @internal
 */
export function _toMentionAttribute(
	viewElementOrMention: Element,
	data?: Record<string, unknown>
): MentionAttribute | undefined {
	const dataMention = viewElementOrMention.getAttribute( 'data-mention' ) as string;

	const textNode = viewElementOrMention.getChild( 0 ) as Text;

	// Do not convert empty mentions.
	if ( !textNode ) {
		return;
	}

	const baseMentionData = {
		id: dataMention,
		_text: textNode.data
	};

	return _addMentionAttributes( baseMentionData, data );
}

/**
 * A converter that blocks partial mention from being converted.
 *
 * This converter is registered with 'highest' priority in order to consume mention attribute before it is converted by
 * any other converters. This converter only consumes partial mention - those whose `_text` attribute is not equal to text with mention
 * attribute. This may happen when copying part of mention text.
 */
function preventPartialMentionDowncast( dispatcher: DowncastDispatcher ) {
	dispatcher.on<DowncastAttributeEvent>( 'attribute:mention', ( evt, data, conversionApi ) => {
		const mention = data.attributeNewValue as MentionAttribute;

		if ( !data.item.is( '$textProxy' ) || !mention ) {
			return;
		}

		const start = data.range.start;
		const textNode = start.textNode || start.nodeAfter as Text;

		if ( textNode!.data != mention._text ) {
			// Consume item to prevent partial mention conversion.
			conversionApi.consumable.consume( data.item, evt.name );
		}
	}, { priority: 'highest' } );
}

/**
 * Creates a mention element from the mention data.
 */
function createViewMentionElement( mention: MentionAttribute, { writer }: DowncastConversionApi ): AttributeElement | undefined {
	if ( !mention ) {
		return;
	}

	const attributes = {
		class: 'mention',
		'data-mention': mention.id
	};

	const options = {
		id: mention.uid,
		priority: 20
	};

	return writer.createAttributeElement( 'span', attributes, options );
}

/**
 * Model post-fixer that disallows typing with selection when the selection is placed after the text node with the mention attribute or
 * before a text node with mention attribute.
 */
function selectionMentionAttributePostFixer( writer: Writer, doc: Document ): boolean {
	const selection = doc.selection;
	const focus = selection.focus;

	if ( selection.isCollapsed && selection.hasAttribute( 'mention' ) && shouldNotTypeWithMentionAt( focus! ) ) {
		writer.removeSelectionAttribute( 'mention' );

		return true;
	}

	return false;
}

/**
 * Helper function to detect if mention attribute should be removed from selection.
 * This check makes only sense if the selection has mention attribute.
 *
 * The mention attribute should be removed from a selection when selection focus is placed:
 * a) after a text node
 * b) the position is at parents start - the selection will set attributes from node after.
 */
function shouldNotTypeWithMentionAt( position: Position ): boolean {
	const isAtStart = position.isAtStart;
	const isAfterAMention = position.nodeBefore && position.nodeBefore.is( '$text' );

	return isAfterAMention || isAtStart;
}

/**
 * Model post-fixer that removes the mention attribute from the modified text node.
 */
function removePartialMentionPostFixer( writer: Writer, doc: Document, schema: Schema ): boolean {
	const changes = doc.differ.getChanges();

	let wasChanged = false;

	for ( const change of changes ) {
		if ( change.type == 'attribute' ) {
			continue;
		}

		// Checks the text node on the current position.
		const position = change.position;

		if ( change.name == '$text' ) {
			const nodeAfterInsertedTextNode = position.textNode && position.textNode.nextSibling;

			// Checks the text node where the change occurred.
			wasChanged = checkAndFix( position.textNode, writer ) || wasChanged;

			// Occurs on paste inside a text node with mention.
			wasChanged = checkAndFix( nodeAfterInsertedTextNode, writer ) || wasChanged;
			wasChanged = checkAndFix( position.nodeBefore, writer ) || wasChanged;
			wasChanged = checkAndFix( position.nodeAfter, writer ) || wasChanged;
		}

		// Checks text nodes in inserted elements (might occur when splitting a paragraph or pasting content inside text with mention).
		if ( change.name != '$text' && change.type == 'insert' ) {
			const insertedNode = position.nodeAfter as Element;

			for ( const item of writer.createRangeIn( insertedNode! ).getItems() ) {
				wasChanged = checkAndFix( item, writer ) || wasChanged;
			}
		}

		// Inserted inline elements might break mention.
		if ( change.type == 'insert' && schema.isInline( change.name ) ) {
			const nodeAfterInserted = position.nodeAfter && position.nodeAfter.nextSibling;

			wasChanged = checkAndFix( position.nodeBefore, writer ) || wasChanged;
			wasChanged = checkAndFix( nodeAfterInserted, writer ) || wasChanged;
		}
	}

	return wasChanged;
}

/**
 * This post-fixer will extend the attribute applied on the part of the mention so the whole text node of the mention will have
 * the added attribute.
 */
function extendAttributeOnMentionPostFixer( writer: Writer, doc: Document ): boolean {
	const changes = doc.differ.getChanges();

	let wasChanged = false;

	for ( const change of changes ) {
		if ( change.type === 'attribute' && change.attributeKey != 'mention' ) {
			// Checks the node on the left side of the range...
			const nodeBefore = change.range.start.nodeBefore;
			// ... and on the right side of the range.
			const nodeAfter = change.range.end.nodeAfter;

			for ( const node of [ nodeBefore, nodeAfter ] ) {
				if ( isBrokenMentionNode( node ) && node!.getAttribute( change.attributeKey ) != change.attributeNewValue ) {
					writer.setAttribute( change.attributeKey, change.attributeNewValue, node! );

					wasChanged = true;
				}
			}
		}
	}

	return wasChanged;
}

/**
 * Checks if a node has a correct mention attribute if present.
 * Returns `true` if the node is text and has a mention attribute whose text does not match the expected mention text.
 */
function isBrokenMentionNode( node: Item | null ): boolean {
	if ( !node || !( node.is( '$text' ) || node.is( '$textProxy' ) ) || !node.hasAttribute( 'mention' ) ) {
		return false;
	}

	const text = node.data;
	const mention = node.getAttribute( 'mention' ) as MentionAttribute;

	const expectedText = mention._text;

	return text != expectedText;
}

/**
 * Fixes a mention on a text node if it needs a fix.
 */
function checkAndFix( textNode: Item | null, writer: Writer ): boolean {
	if ( isBrokenMentionNode( textNode ) ) {
		writer.removeAttribute( 'mention', textNode! );

		return true;
	}

	return false;
}
