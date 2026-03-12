---
category: update-guides
meta-title: Update to version 48.x | CKEditor 5 Documentation
menu-title: Update to v48.x
order: 76
modified_at: 2026-03-03
---

# Update to CKEditor&nbsp;5 v48.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For optimal results, ensure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v48.0.0

Released on XXXXXXXXX, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v48.0.0))

### CSS nesting output now follows native specificity more closely

As part of the preparation for a planned migration to native CSS nesting at the beginning of 2027, we updated the generated CSS output to behave more like native CSS nesting. We are not switching to native CSS nesting yet, but some compiled selectors are now stronger than in earlier releases. We are making this change now to reduce the number of changes needed later.

This mainly affects nested rules written under a list of selectors. In some cases, the final selector may now be stronger than before. Because of this, some custom CSS overrides that worked in earlier versions may no longer apply without changes.

Most integrations should not be affected. However, if you override CKEditor&nbsp;5 styles with your own CSS, check whether any of your overrides stopped working after the update.

If needed, fix your custom styles by making your override selector more specific or by loading your CSS later so it takes precedence.

The following simplified example shows the kind of difference you may notice:

```css
/* Before */
.ck.ck-button, a.ck.ck-button {
	&.ck-button_with-text {}
}

/* After */
:is(.ck.ck-button, a.ck.ck-button).ck-button_with-text {}
```

These selectors look similar, but the second one can have a stronger effect in the cascade, which may change which rule wins.

If you do not override the editor styles, no action is required.

### Deprecation of the `@ckeditor/ckeditor5-theme-lark` package

The `@ckeditor/ckeditor5-theme-lark` package has been deprecated. The styles from this package have been moved to respective feature packages. All generic styles that affect the editor's UI more broadly have been moved to the `@ckeditor/ckeditor5-ui` package.

If you import styles from the aggregate stylesheets, such as `ckeditor5/ckeditor5.css` and `ckeditor5-premium-features/ckeditor5-premium-features.css`, you don't need to change anything.

However, if you followed the {@link getting-started/setup/optimizing-build-size Optimizing build size} guide and imported styles from individual packages, you need to update your imports:

1. Remove the import from the `@ckeditor/ckeditor5-theme-lark` package:

	 ```js
	 // Remove this import.
	 import '@ckeditor/ckeditor5-theme-lark/dist/index.css';
	 ```

2. Move the import from the `@ckeditor/ckeditor5-ui` package to the top of your style imports:

	 ```js
	 // Move this import to the top of your styles imports.
	 import '@ckeditor/ckeditor5-ui/dist/index.css';
	 ```

### Collaboration user colors now use CSS-variable-based styling

The collaboration user coloring implementation has been refactored to use runtime CSS variables instead of using a mixin.

If you use only the default user colors, no changes are required. However, if you specified custom user colors, you can migrate by following these three steps:

1. Remove the `@ckeditor/ckeditor5-collaboration-core/theme/usercolormixin.css` import.
2. Replace `@mixin userColor` definitions with `--ck-user-colors--*` and `--ck-user-colors--*-alpha` CSS variables.

	The old and new approaches look like this:

	```css
	/* Before */
	@import "@ckeditor/ckeditor5-collaboration-core/theme/usercolormixin.css";

	@mixin userColor hsla(31, 90%, 43%, 1), hsla(31, 90%, 43%, 0.15), 8;
	@mixin userColor hsla(61, 90%, 43%, 1), hsla(61, 90%, 43%, 0.15), 9;
	```

	```css
	/* After */
	:root {
		--ck-user-colors--8: hsla(31, 90%, 43%, 1);
		--ck-user-colors--8-alpha: hsla(31, 90%, 43%, 0.15);

		--ck-user-colors--9: hsla(61, 90%, 43%, 1);
		--ck-user-colors--9-alpha: hsla(61, 90%, 43%, 0.15);
	}
	```

3. Keep the `config.users.colorsCount` option aligned with the total number of defined colors. For the example above (`0-9`), set:

	```js
	users: {
		colorsCount: 10
	}
	```
