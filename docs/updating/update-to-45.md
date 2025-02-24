---
category: update-guides
meta-title: Update to version 45.x | CKEditor 5 Documentation
menu-title: Update to v45.x
order: 79
modified_at: 2024-11-28
---

# Update to CKEditor&nbsp;5 v45.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v45.0.0

_Released on Month X, 2024._

For the entire list of changes introduced in version 45.0.0, see the [release notes for CKEditor&nbsp;5 v45.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v45.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v45.0.0.

### Link UI refactoring

The Link UI has been refactored to allow for easier customization of the link toolbar through configuration. The most notable changes include:

* The custom `LinkActionsView` has been replaced with a standard `ToolbarView`. The toolbar is configurable via the `link.toolbar` configuration option.
* Link properties (decorators) are now accessed through the toolbar instead of a separate settings panel.
* The link toolbar now uses components registered in `ComponentFactory`, making it more extensible.

Here's how to configure the link toolbar in your editor:

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

You can also register custom toolbar items by implementing your own UI components. Here's an example of registering a custom link info component:

```js
editor.ui.componentFactory.add( 'myCustomLinkInfo', locale => {
    const button = new ButtonView( locale );
    const linkCommand = editor.commands.get( 'link' );

    button.bind( 'isEnabled' ).to( linkCommand, 'value', href => !!href );
    button.bind( 'label' ).to( linkCommand, 'value' );

    button.on( 'execute', () => {
        // Add your custom link info logic here
    } );

    return button;
} );
```

For a complete list of available toolbar items and configuration options, see the {@link module:link/linkconfig~LinkConfig#toolbar link configuration documentation}.

#### Code changes

* `LinkUI#actionsView` has been removed. Use `LinkUI#toolbarView` instead.
* The `createBookmarkCallbacks()` helper has been replaced with `isScrollableToTarget()` and `scrollToTarget()` helpers.

### Unified form styles

Form components across various features (Link, Bookmark, Image, Table) have been unified using the new `ck-form` and `ck-form__row` classes. The form styling has been centralized in the theme-lark package.

Notable changes:

* A new `FormRowView` class has been introduced in the UI package for consistent form row layouts
* All balloon panels now have consistent headers with back buttons
* Form styles have been moved to a dedicated `form.css` in the theme-lark package
