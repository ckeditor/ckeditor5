/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isprocessinginstruction
 */

/**
 * Checks whether the object is a native DOM Processing Instruction node.
 */
export function isProcessingInstruction( obj: any ): obj is ProcessingInstruction {
	return obj && obj.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
}
