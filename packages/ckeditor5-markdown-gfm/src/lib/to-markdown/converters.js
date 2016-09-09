/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// Exports an array with custom converters used by to-markdown library.
export default [

	// Converting code blocks with class name matching output from marked library.
	{
		filter: (node) =>  {
			const regexp = /lang-(.+)/;

			return node.nodeName === 'PRE' &&
				node.firstChild &&
				node.firstChild.nodeName === 'CODE' &&
				regexp.test( node.firstChild.className );
		},
		replacement: ( content, node ) => {
			const regexp = /lang-(.+)/;
			const lang = regexp.exec( node.firstChild.className )[ 1 ];

			return '\n\n``` ' + lang + '\n' + node.firstChild.textContent + '\n```\n\n';
		}
	},
];
