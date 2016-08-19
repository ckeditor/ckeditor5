export default [
	{
		name: 'should create tidy output',
		md: '> A list within a blockquote:\n> \n> *	asterisk 1\n> *	asterisk 2\n> *	asterisk 3\n',
		html: '<blockquote><p>A list within a blockquote:</p><ul><li>asterisk 1</li><li>asterisk 2</li><li>asterisk 3</li></ul></blockquote>'
	}
];
