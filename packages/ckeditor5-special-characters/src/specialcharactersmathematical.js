/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SpecialCharactersMathematical extends Plugin {
	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Mathematical', [
			{
				character: '‹',
				title: 'Single left-pointing angle quotation mark'
			},
			{
				character: '›',
				title: 'Single right-pointing angle quotation mark'
			},
			{
				character: '«',
				title: 'Left-pointing double angle quotation mark'
			},
			{
				character: '»',
				title: 'Right-pointing double angle quotation mark'
			},
			{
				character: '<',
				title: 'Less-than sign'
			},
			{
				character: '>',
				title: 'Greater-than sign'
			},
			{
				character: '≤',
				title: 'Less-than or equal to'
			},
			{
				character: '≥',
				title: 'Greater-than or equal to'
			},
			{
				character: '–',
				title: 'En dash'
			},
			{
				character: '—',
				title: 'Em dash'
			},
			{
				character: '¯',
				title: 'Macron'
			},
			{
				character: '‾',
				title: 'Overline'
			},
			{
				character: '°',
				title: 'Degree sign'
			},
			{
				character: '−',
				title: 'Minus sign'
			},
			{
				character: '±',
				title: 'Plus-minus sign'
			},
			{
				character: '÷',
				title: 'Division sign'
			},
			{
				character: '⁄',
				title: 'Fraction slash'
			},
			{
				character: '×',
				title: 'Multiplication sign'
			},
			{
				character: 'ƒ',
				title: 'Latin small letter f with hook'
			},
			{
				character: '∫',
				title: 'Integral'
			},
			{
				character: '∑',
				title: 'N-ary summation'
			},
			{
				character: '∞',
				title: 'Infinity'
			},
			{
				character: '√',
				title: 'Square root'
			},
			{
				character: '∼',
				title: 'Tilde operator'
			},
			{
				character: '≅',
				title: 'Approximately equal to'
			},
			{
				character: '≈',
				title: 'Almost equal to'
			},
			{
				character: '≠',
				title: 'Not equal to'
			},
			{
				character: '≡',
				title: 'Identical to'
			},
			{
				character: '∈',
				title: 'Element of'
			},
			{
				character: '∉',
				title: 'Not an element of'
			},
			{
				character: '∋',
				title: 'Contains as member'
			},
			{
				character: '∏',
				title: 'N-ary product'
			},
			{
				character: '∧',
				title: 'Logical and'
			},
			{
				character: '∨',
				title: 'Logical or'
			},
			{
				character: '¬',
				title: 'Not sign'
			},
			{
				character: '∩',
				title: 'Intersection'
			},
			{
				character: '∪',
				title: 'Union'
			},
			{
				character: '∂',
				title: 'Partial differential'
			},
			{
				character: '∀',
				title: 'For all'
			},
			{
				character: '∃',
				title: 'There exists'
			},
			{
				character: '∅',
				title: 'Empty set'
			},
			{
				character: '∇',
				title: 'Nabla'
			},
			{
				character: '∗',
				title: 'Asterisk operator'
			},
			{
				character: '∝',
				title: 'Proportional to'
			},
			{
				character: '∠',
				title: 'Angle'
			},
			{
				character: '¼',
				title: 'Vulgar fraction one quarter'
			},
			{
				character: '½',
				title: 'Vulgar fraction one half'
			},
			{
				character: '¾',
				title: 'Vulgar fraction three quarters'
			}
		] );
	}
}
