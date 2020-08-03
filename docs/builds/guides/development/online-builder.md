---
# Scope:
# * Introduction to custom builds and why one would create them.
# * Introduction to online builder
# * Step-by-step instructions on using online builder.

menu-title: Online builder
category: builds-development
order: 10
---

# Creating custom builds

A build is a simple [npm](https://www.npmjs.com) package (usually developed in a Git repository) with a predefined set of dependencies. Out of this repository, distribution files can be generated through the build process.

Some of the reasons for creating custom builds are:

* Adding features which are not included in the existing builds, either from a third party or custom developed.
* Removing unnecessary features present in a build.
* Changing the {@link builds/guides/integration/basic-api#creating-an-editor editor creator}.
* Changing the {@link framework/guides/theme-customization editor theme}.
* Changing the {@link features/ui-language localization language} of the editor.
* Enabling bug fixes which are still not a part of any public release.

This is where the online builder comes to aid the users needs.

## Online builder

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

## Using online builder to create custom CKEditor 5 WYSIWYG editor

### Choosing editor type

The following CKEditor 5 Builds are currently available to choose from:

 * [Classic editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor)
 * [Inline editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#inline-editor)
 * [Balloon editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#balloon-editor)
 * [Balloon block editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#balloon-block-editor)
 * [Document editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#document-editor)

 Refer to the documentation to check what kind of editor suits your needs. Once you choose the desired editor type, press the **Next step** button.

 For the sake of clarity, this guide will use the Classic build as an example.

 <!-- Needs an image of build choice page -->

### Choosing plugins

The basic build come with a predefined set of plugins. Take a moment to check these options out. You can freely remove those, that will not be used in your build.

<!-- Need an image of the basic plugins selection -->

Below the preselected plugins, you will find a large collection of features that can be added to the custom build. Choose the one you need.

<!-- Need an image of the plugins selection -->

<info-box hint>
	Note that some of the plugins require other plugins to work. These mentioned in the **Require plugin** section of the description box.
</info-box>

Once you choose all the desired plugins, press the **Next step** button.

### Toolbar composition

Next step allows you to compose the toolbar. A simple drag-and-drop workspace allows for adding buttons representing the chosen plugins to the toolbars. The user may change the order of the buttons and group them accordingly.

<!-- Need an image of the toolbar editor -->

<info-box hint>
	Note that some of the buttons are pre-placed and are grayed out. To move one of these, drag them from the lower bar into the upper bar - they will become focused and can be moved around.
</info-box>

Once you design the toolbar, press the **Next step** button.

### Choosing the defaut language

This is simply - just scroll the list of available languages and check the one you want to be the main editor language.

<info-box hint>
	All other languages will still be available in the `translations` folder.
</info-box>

### Download the customized build

This is as simple as it gets: just press the **Download** button to get the customized package.

Refer to the [Installation page](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html#zip-download) for further instruction on installing the custom build.


