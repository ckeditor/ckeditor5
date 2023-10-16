---
menu-title: Drupal
meta-title: Real-time editing in Drupal | CKEditor 5 documentation
category: integrations
order: 90
modified_at: 2023-10-06
---

{@snippet installation/integrations/framework-integration}

# Real-time editing in Drupal

Drupal is an open-source editing platform. CKEditor 5 is the default editor module for Drupal. The [CKEditor&nbsp;5 Premium Features module](https://www.drupal.org/project/ckeditor5_premium_features) provides instant integration of the real-time collaboration features. Currently, the module includes a set of collaboration tools, the {@link features/productivity-pack Productivity Pack} of essential formatting and navigation features, plus document import and export plugins.

The module also includes the free Full Screen Mode, a free-to-use plugin that maximizes the editing area. It is especially useful when using features like Document outline or Comments which take up extra space around the editor.

## Real-time collaboration in Drupal with CKEditor 5

With collaboration features, users can work together to write, review, and discuss their content right within Drupal. No need to use different apps for drafting and commenting &ndash; you can do it all in one place.

{@img assets/img/drupal_premium_module.gif 721 Drupal with CKEditor&nbsp;5 real-time editing.}

Collaboration Features include:

* {@link features/track-changes Track changes} to make suggested edits.
* {@link features/comments Comments} to discuss the content.
* {@link features/revision-history Revision History} to see what changes were made, and compare and restore previous versions of the content.
* {@link features/real-time-collaboration Real-time Collaboration} to allow multiple users to edit simultaneously.

There is also a dedicated, configurable notifications system developed especially for the CKEditor 5 Premium module for Drupal. It helps the users stay up-to-date whenever someone mentions you in a document, comments, or replies to you, accepts or rejects suggestions, and so on. Integrate it with your own plugin to get notifications via email, Slack, or other services.

All the collaboration features can also be used for {@link features/collaboration#non-real-time-asynchronous-collaboration asynchronous editing}. It is a collaboration mode when a single actor can work on the document at once, using the revision history, track changes, and comments features to interact with previous and following editors, as the work is done sequentially.

Other features available in the CKeditor&nbsp;5 Premium module include:

* Easily defined {@link features/template templates}.
* {@link features/slash-commands Slash commands} that let you create, insert, and format rich content on the go.
* {@link features/format-painter Format painter} to easily style the edited text.
* Enhanced {@link features/paste-from-office-enhanced Paste from Office} and {@link features/import-word Import from Word} features.
* Handy one-click {@link features/export-pdf Export to PDF} and {@link features/export-word Export to Word} features that offer portability and cross-platform interoperability.
* {@link features/mentions Mentions} features that lets you tag other users in comments.


## Supported Drupal versions

* Drupal 9 (requires [enabling CKEditor 5](https://www.drupal.org/docs/core-modules-and-themes/core-modules/experimental-ckeditor-5/installation-and-configuration-of-ckeditor-5-module-on-drupal-9))
* Drupal 10

## Quick start

### Requirements

* PHP 8.0+
* Drupal 9.4 with CKEditor 5 enabled
* Drupal 10

### Installation

Use composer to install the module in Drupal:

```plaintext
composer require drupal/ckeditor5_premium_features
```

Alternatively, add the CKEditor 5 Premium Features Module to your Drupal installation.

To do it, enter the **Manage > Extend** section in the Drupal dashboard first and use the **Add new** module button to provide the source for the CKEditor 5 Premium features module. You can fetch the module from https://www.drupal.org/project/ckeditor5_premium_features

{@img assets/img/drupal_dashboard_add_pfm.png 878 Adding CKEditor&nbsp;5 Premium Features module to Drupal.}

### Activation

CKEditor&nbsp;5 Premium module for Drupal requires an active license key and a few more pieces of information to activate. 

{@img assets/img/drupal_general_settings.png 922 Drupal dashboard.}

Please follow the {@link support/license-key-and-activation License key and activation} guide to find out how to obtain the key and activate the license. You can also use the {@link @trial guides/overview Premium features Free Trial} to obtain a commitment-free, 30-day trial key. Once you have the key ready, in the Drupal dashboard go to the CKEditor&nbsp;5 Premium module configuration. In the **General Setting** section, paste the key in the **License key** input box.

{@img assets/img/drupal_license_key.png 1250 Drupal license key.}

Next, use the information obtained from the [CKEditor 5 Dashboard](https://dashboard.ckeditor.com/) and fill in the following fields in the Drupal module's **General Settings**.

{@img assets/img/drupal_authorizations.png 1342 Drupal authorization settings.}

You can find more details of this process in the [Adding credentials to Drupal](https://www.drupal.org/docs/contributed-modules/ckeditor-5-premium-features/how-to-install-and-set-up-the-module#s-adding-credentials-to-drupal) guide on the Drupal website.

## Configuration

Refer to the CKEditor&nbsp;5 Premium module for Drupal documentation to learn how to [configure the module](https://www.drupal.org/docs/contributed-modules/ckeditor-5-premium-features/how-to-install-and-set-up-the-module#s-configuring-ckeditor-5-premium-features) in the dedicated guide on the Drupal website.
