/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getselection
 */

import isShadowRoot from './isshadowroot.js';

/**
 * TODO
 */
export default function getSelection( node: Node ): Selection | null {
	const rootNode = node.getRootNode();

	if ( isShadowRoot( rootNode ) ) {
		// Safari & current spec.
		const domSelection = rootNode.ownerDocument.defaultView!.getSelection()!;

		if ( typeof domSelection.getComposedRanges == 'function' ) {
			// TODO Does it work if in multiple nested shadows?
			const ranges = domSelection.getComposedRanges( rootNode );

			console.log( 'sel', ranges, domSelection.direction );

			// TODO for now just a DOM selection wrapper
			return {
				rangeCount: ranges.length,

				getRangeAt( index: number ) {
					const staticRange = ranges[ index ];
					const range = rootNode.ownerDocument.createRange();

					range.setStart( staticRange.startContainer, staticRange.startOffset );
					range.setEnd( staticRange.endContainer, staticRange.endOffset );

					// Return the Range as it includes commonAncestorContainer property.
					return range;
				},

				isCollapsed: !ranges.length || ranges[ 0 ].isCollapsed,

				// TODO backward does not recognize correctly
				...ranges.length && {
					anchorNode: domSelection.direction != 'backward' ? ranges[ 0 ].startContainer : ranges[ 0 ].endContainer,
					anchorOffset: domSelection.direction != 'backward' ? ranges[ 0 ].startOffset : ranges[ 0 ].endOffset,
					focusNode: domSelection.direction != 'backward' ? ranges[ 0 ].endContainer : ranges[ 0 ].startContainer,
					focusOffset: domSelection.direction != 'backward' ? ranges[ 0 ].endContainer : ranges[ 0 ].startContainer
				},

				removeAllRanges() {
					return domSelection.removeAllRanges();
				},

				setBaseAndExtent( ...args ) {
					console.log( 'sel set base and extent' );
					return domSelection.setBaseAndExtent( ...args );
				}
			} as any;
		}

		// Blink.
		if ( typeof rootNode.getSelection == 'function' ) {
			return rootNode.getSelection();
		}

		// Firefox.
		return rootNode.host.ownerDocument.defaultView!.getSelection();
	}

	return rootNode.defaultView.getSelection();
}
