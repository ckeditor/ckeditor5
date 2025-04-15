---
category: update-guides
meta-title: Update to version 45.x | CKEditor 5 Documentation
menu-title: Update to v45.x
order: 79
modified_at: 2025-04-07
---

# Update to CKEditor&nbsp;5 v45.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v45.0.0

Released on April 7, 2024. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v45.0.0))

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v45.0.0.

### Email editing enhancements

We are making it easier to create and edit emails directly in CKEditor 5 with several enhancements. This release introduces the following new features:

* {@link features/export-with-inline-styles Export with Inline Styles} (⭐) provides the ability to export email content with automatically inlined styles, ensuring compatibility and proper rendering across different email clients.
* {@link features/email-configuration-helper Email Configuration Helper} (⭐) is a new configuration helper plugin that provides guidance for integrators to correctly set up an email-friendly editor while avoiding common pitfalls.
* {@link features/layout-tables Layout tables} are a new type of tables that has been introduced to simplify the creation of structured email designs, offering better control over layout, alignment and spacing.

Apart from these new features, this update also brings various fixes and improvements related to table behavior, enhanced HTML support, and better handling of complex email structures. These refinements help ensure a more seamless email editing experience, reducing inconsistencies and improving compatibility with external email clients.

### The fullscreen feature

A long-requested feature has finally arrived with the {@link features/fullscreen introduction of full-screen editing} for the classic and decoupled editor types. This new mode provides a focused writing experience by making the editor the centerpiece of the screen. The expanded screen space allows for better visibility of content in sidebars such as comments, suggestions, and document outlines, enhancing your overall workflow.

### UI toolbar refactoring

The {@link features/link link} and {@link features/bookmarks bookmark} features have been refactored to use standard toolbar components, making them more customizable and consistent:

#### Link feature changes

The link UI has been refactored to allow for easier customization of the link toolbar through configuration. The most notable changes include:

* The custom `LinkActionsView` has been replaced with a standard `ToolbarView`. The toolbar is accessible via `LinkUI#toolbarView` instead of `LinkUI#actionsView` and configurable through the `link.toolbar` configuration option.
* Link properties (decorators) are now accessed through the toolbar instead of a separate settings panel.
* The link toolbar now uses components registered in `ComponentFactory`, making it more extensible.

Here is how to configure the link toolbar:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		link: {
			toolbar: [ 'myCustomLinkInfo', '|', 'editLink', 'linkProperties', 'unlink' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

#### Bookmark feature changes

The bookmark UI has been refactored to use the `WidgetToolbarRepository` instead of a custom `ActionsView`. Key changes include:

* The custom `BookmarkUI#actionsView` has been removed in favor of using the standard widget toolbar system.
* The bookmark toolbar is configurable through the `bookmark.toolbar` configuration option.
* The toolbar items are registered in `ComponentFactory` and can be customized.

For bookmark features, you can configure the toolbar like this:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		bookmark: {
			toolbar: [ 'bookmarkPreview', '|', 'editBookmark', 'removeBookmark' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Custom toolbar components

The link and bookmark features now allow custom toolbar items to be registered in their respective toolbars. To add a custom item:

1. Register it in the component factory
2. Add it to the toolbar configuration

Below is an example of registering a custom component:

```js
editor.ui.componentFactory.add( 'myCustomLinkInfo', locale => {
	const button = new ButtonView( locale );
	const linkCommand = editor.commands.get( 'link' );

	button.bind( 'isEnabled' ).to( linkCommand, 'value', href => !!href );
	button.bind( 'label' ).to( linkCommand, 'value' );

	button.on( 'execute', () => {
		// Add your custom component logic here
	} );

	return button;
} );
```

Once registered, the component can be used in the toolbar configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		link: {
			toolbar: [ 'myCustomLinkInfo', '|', 'editLink', 'unlink' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

For a complete list of available toolbar items and configuration options, see the {@link module:link/linkconfig~LinkConfig#toolbar link configuration documentation} and {@link module:bookmark/bookmarkconfig~BookmarkConfig#toolbar bookmark configuration documentation}.

### Link provider registration

The link UI now supports registering custom link providers through the new `LinkUI#registerLinksListProvider` method. This allows for adding a list of predefined links available in the link form. Here is a simple example:

```js
editor.plugins.get( 'LinkUI' ).registerLinksListProvider( {
	label: 'My links',

	// Return a list of links to display in the link form
	getListItems: () => [
		{
			id: 'homepage',
			href: 'https://example.com',
			label: 'Homepage',
			icon: linkIcon
		}
	],

	// Optional: Customize how links are displayed in preview
	getItem: href => {
		return {
			href,
			label: 'My custom label',
			tooltip: 'Open link'
		};
	}
} );
```

The registered links will appear as a button in the link form, allowing users to quickly insert commonly used links.

#### Other code changes

* The `createBookmarkCallbacks()` helper has been replaced with the `isScrollableToTarget()` and `scrollToTarget()` helpers.

### Unified form styles

Form components across various features (link, bookmark, image, table) have been unified using the new `ck-form` and `ck-form__row` classes. The form styling has been centralized in the `theme-lark` package.

Notable changes:

* A new `FormRowView` class has been introduced in the UI package for consistent form row layouts.
* All balloon panels now have consistent headers with back buttons.
* Form styles have been moved to a dedicated `form.css` in the theme-lark package.

### New installation methods improvements: icons replacement

We are continuing to strengthen the new installation methods while phasing out older solutions. We added one of the key components you asked for: replacing our icons with your custom ones. It is now possible to replace the icons via the {@link getting-started/setup/customizing-icons package’s override mechanism}.

<info-box info>
	To achieve a proper solution for icons replacement for the npm builds, we needed to introduce a breaking change. If you used our icons for any purposes, make sure to update their paths.
</info-box>

### Major breaking changes in this release

* **[bookmark](https://www.npmjs.com/package/@ckeditor/ckeditor5-bookmark)**: The `BookmarkUI#actionsView` is no longer available. The bookmark feature is now using the `WidgetToolbarRepository` instead.
* **[build-*](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor)**: CKEditor 5 predefined builds are no longer available.
* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `LinkUI#actionsView` is no longer available. The bookmark feature now uses the `LinkUI#toolbarView` (an instance of the `ToolbarView` class) instead of the custom `LinkActionsView`.

### Minor breaking changes in this release

* **[link](https://www.npmjs.com/package/@ckeditor/ckeditor5-link)**: The `createBookmarkCallbacks()` helper is now replaced by the `isScrollableToTarget()` and `scrollToTarget()` helpers.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `FormRowView` class was moved to the `@ckeditor/ckeditor5-ui` package.
* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table)**: The `form.css` component was moved to the `@ckeditor/ckeditor5-theme-lark` package.
* All CKEditor 5 icons are now available in the `@ckeditor/ckeditor5-icons` package.
