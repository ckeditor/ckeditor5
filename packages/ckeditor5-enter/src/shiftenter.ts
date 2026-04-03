/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter/shiftenter
 */

import { ShiftEnterCommand } from './shiftentercommand.js';
import { EnterObserver, type ViewDocumentEnterEvent } from './enterobserver.js';
import { Plugin } from '@ckeditor/ckeditor5-core';

import type {
	ModelElement,
	ModelNode,
	ModelWriter
} from '@ckeditor/ckeditor5-engine';

/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */
export class ShiftEnter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShiftEnter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const t = this.editor.t;

		// Configure the schema.
		schema.register( 'softBreak', {
			allowWhere: '$text',
			allowAttributesOf: '$text',
			isInline: true
		} );

		// Configure converters.
		conversion.for( 'upcast' )
			.elementToElement( {
				model: 'softBreak',
				view: 'br'
			} );

		conversion.for( 'downcast' )
			.elementToElement( {
				model: 'softBreak',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
			} );

		view.addObserver( EnterObserver );

		editor.commands.add( 'shiftEnter', new ShiftEnterCommand( editor ) );
		editor.model.document.registerPostFixer( writer => removeStaleSoftBreakAttributes( writer ) );

		this.listenTo<ViewDocumentEnterEvent>( viewDocument, 'enter', ( evt, data ) => {
			// When not in composition, we handle the action, so prevent the default one.
			// When in composition, it's the browser who modify the DOM (renderer is disabled).
			if ( !viewDocument.isComposing ) {
				data.preventDefault();
			}

			// The hard enter key is handled by the Enter plugin.
			if ( !data.isSoft ) {
				return;
			}

			editor.execute( 'shiftEnter' );
			view.scrollToTheSelection();
		}, { priority: 'low' } );

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Insert a soft break (a <code>&lt;br&gt;</code> element)' ),
					keystroke: 'Shift+Enter'
				}
			]
		} );
	}
}

/**
 * The post-fixer that removes attributes from stale soft-break elements.
 */
function removeStaleSoftBreakAttributes( writer: ModelWriter ): boolean {
	const parentsToCheck = new Set<ModelElement>();

	for ( const change of writer.model.document.differ.getChanges() ) {
		if ( change.type == 'insert' || change.type == 'remove' ) {
			if ( change.position.parent.is( 'element' ) ) {
				parentsToCheck.add( change.position.parent );
			}
		} else if ( change.type == 'attribute' ) {
			if ( change.range.start.parent.is( 'element' ) ) {
				parentsToCheck.add( change.range.start.parent );
			}
		}
	}

	let wasChanged = false;

	for ( const parent of parentsToCheck ) {
		// Just a sibling nodes check. We do not need to check attributes of nested elements.
		for ( const child of parent.getChildren() ) {
			// Find a softBreak element.
			if ( !child.is( 'element', 'softBreak' ) ) {
				continue;
			}

			const nextSibling = child.nextSibling;

			// Do not remove attributes when softBreak is the last element or there is some element after it.
			if ( !nextSibling || nextSibling.is( 'element' ) ) {
				continue;
			}

			for ( const [ key, value ] of child.getAttributes() ) {
				// Remove the attribute if the next sibling does not have the same attribute.
				if ( !hasSameAttribute( nextSibling, key, value ) ) {
					writer.removeAttribute( key, child );
					wasChanged = true;
				}
			}
		}
	}

	return wasChanged;
}

/**
 * Returns `true` if the given node has the same attribute as the one provided in the parameters.
 */
function hasSameAttribute( node: ModelNode | null, key: string, value: unknown ): boolean {
	return node?.getAttribute( key ) === value;
}
