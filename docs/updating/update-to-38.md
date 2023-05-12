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

For the entire list of changes introduced in version 37.0.0, see the [release notes for CKEditor 5 v37.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v37.0.0.

## Introduction of the "Powered by CKEditor" logo

From version v38.0.0 onwards, all **open source installations** of CKEditor 5 will carry a small “Powered by CKEditor” watermark in the bottom right corner of the editing area. This new tag links directly to the [CKEditor website](https://ckeditor.com/) and while it may be a little frustrating to some, it is designed to make sure the entire community knows who is powering and modernizing their rich text editor.

This change **does not affect customers with commercial licenses**. However, to remove the footer, owners of commercial licenses for standalone features will have to update their authentication keys available in the CKEditor Environment Dashboard. This concerns the following: pagination, productivity pack, non-real-time collaboration features.

Services and features secured on the server side (real-time collaboration features, export to PDF/Word, import from PDF) **do not require** any additonal actions.

We have prepared a detailed {@link support/managing-ckeditor-logo Managing the "Powered by CKEditor" logo} guide to help everyone through the transition and explain any concerns.
