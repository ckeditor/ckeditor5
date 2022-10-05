# Excluding elements from CSS reset

In this test, there's a box with `.ck-reset_all` class and some child elements:

1. In the first section, children styles should be reset. Inspect them visually:
	* buttons, inputs, textarea should have no borders,
	* heading should look like a paragraph (no bold text),
	* paragraph should have no additional margins,
	* a paragraph with `.ck-rtl` should be aligned to the right.
2. In the second section, there's a box with `.ck-reset_all-excluded` that should exclude its content from CSS reset. Inspect it visually:
	* buttons, inputs, textarea should have borders (like in UA styles),
	* headings should look like raw HTML headings (bigger, bold...),
	* etc. (anything reset in the previous section should not happen here)
3. In the third section, there's a box inside the box with `.ck-reset_all-excluded`. Its content should look the same as in its parent. Inspect it visually.
4. Open the dev tools and inspect elements in the "exclusion zones" (the first one and the nested one). Look at CSS selectors:
	* there should be nothing there related to CKEditor and `.ck-reset_all` in particular, **only UA styles provided by the web browser**.
