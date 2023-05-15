---
category: update-guides
menu-title: Update to v38.x
order: 86
modified_at: 2023-05-12
---

# Update to CKEditor 5 v38.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 38.0.0, see the [release notes for CKEditor 5 v38.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v38.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v37.0.0.

## Introduction of the "Powered by CKEditor" logo

Starting from version 38.0.0, all **open source installations** of CKEditor 5 will include a small “Powered by CKEditor” logo in the bottom right corner of the editing area. This logo is designed to raise awareness of the CKEditor brand and will link to the CKEditor website.

If you have a **commercial license**, you can hide the logo by adding `config.licenseKey` to your configuration. If you already use pagination, productivity pack, or non-real-time collaboration features, you don't need to take any action as you should already have `config.licenseKey` in place. The logo will not be visible in your editor.

We have prepared a detailed {@link support/managing-ckeditor-logo Managing the "Powered by CKEditor" logo} guide to help everyone through the transition and explain any concerns.
