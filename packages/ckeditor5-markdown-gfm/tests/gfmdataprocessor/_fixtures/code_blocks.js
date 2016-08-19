export default [
	{
		name: 'indented with tabs',
		md: '	code block',
		html: '<pre><code>code block</code></pre>'
	},
	{
		name: 'indented with spaces',
		md: '    code block',
		html: '<pre><code>code block</code></pre>'
	}
	// {
	// 	name: 'multiline',
	// 	md: '	first line\n	second line',
	// 	html: ''
	// },
	// {
	// 	name: 'multiline with trailing spaces',
	// 	md: '	the lines in this block  \n	all contain trailing spaces  ',
	// 	html: '<pre><code>the lines in this blockall contain trailing spaces  </code></pre>'
	// }
];
