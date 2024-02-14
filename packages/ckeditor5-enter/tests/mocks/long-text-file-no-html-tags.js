/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

export const LONG_TEXT_FILE_NO_HTML_TAGS = Array
	.from( Array( 30 ) )
	.map( () =>
		`p
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ante purus, venenatis id purus id, faucibus efficitur metus.
			Aenean at metus vitae ligula luctus laoreet. Aenean pellentesque dapibus justo. Duis tincidunt lectus ut cursus hendrerit.
			Vivamus sodales nisl nec dui tempor, eu auctor nulla tincidunt. Nulla facilisi. Sed in pulvinar leo. Morbi hendrerit rutrum erat
			lacinia consequat. Suspendisse et rutrum nulla. Etiam ultricies ullamcorper ante vitae laoreet.
			Sed efficitur accumsan metus ac mollis. Duis et enim in metus consectetur hendrerit. Pellentesque sollicitudin fringilla
			efficitur. Nullam pellentesque velit mi, eu lobortis nibh egestas at. Curabitur sit amet condimentum justo. Morbi tristique,
			lectus in rhoncus congue, neque massa auctor libero, ut eleifend dolor nulla in justo.
		/p
		p
		&nbsp;
		`
	)
	.join( '\n ' );
