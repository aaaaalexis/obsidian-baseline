![Baseline Marketplace](../../img/marketplace.png)

Showcase your creativity and help others discover new looks! Baseline Marketplace utilizes Baseline’s powerful customizability, letting you share your unique Style Settings with the community.

### This guide will walk you through each step of the process for submitting your preset to Marketplace.

## 1. Export Your Style Settings

First, you need to package your current settings into a preset file.

1.  In Obsidian, open **Settings**.
2.  Navigate to the **Style Settings** plugin options.
3.  Locate the **Baseline** section and click the export icon (beside the ↺ icon) to export your settings.
4.  Save the file. Use a descriptive, lowercase name with dashes (e.g., `new-preset.json`). **This is your preset file!**

## 2. Add Your Files to the Repository

Next, we'll get your preset file and a preview image into the project.

> [!IMPORTANT]
> Your screenshot must be a full window capture with no borders or shadows.

1.  **Fork the Repository:**
    - Go to [Baseline's GitHub repository](https://github.com/aaaaalexis/obsidian-baseline).
    - Click the **Fork** button in the top-right corner. This creates a personal copy under your GitHub account where you can make changes.

2.  **Upload Your Preset File:**
    - In your newly forked repository, navigate to the `docs/marketplace/preset/` folder.
    - Click the **Add file** dropdown and select **Upload files**.
    - Make sure your preset file is in valid JSON format.
    - Drag and drop your `new-preset.json` file into the upload area.
    - Click **Commit changes**.

3.  **Upload Your Screenshot:**
    - (Optional) Compress your image before uploading.
    - Upload your screenshot using the **Add file** dropdown and select **Upload files**.
    - Your screenshot must be a PNG file named after your preset (e.g., `new-preset.png`).
    - For light and dark mode, use filenames like `new-preset@light.png` or `new-preset@dark.png`. If only `new-preset.png` is uploaded, it will be used for both modes.
    - Drag and drop your image into the upload area.
    - Click **Commit changes**.

## 3. Register Your Preset

Now, let's add an entry for your preset so it appears in Marketplace.

1.  Navigate to the `docs/marketplace/` folder and click on the `preset.json` file.
2.  Click the pencil icon (✏️) in the upper-right corner to edit the file.
3.  Scroll to the bottom of the file. Add a comma `,` after the last closing curly brace `}` and paste the following template on a new line:

    ```json
      "unique-preset-id": {
        "name": "Preset Name",
        "author": "Name or Username",
        "url": "https://github.com/my-username",
        "description": "A short, engaging description of your preset's look and feel."
      }
    ```

4.  **Fill in your details:**

- **`id`**: A unique identifier in `kebab-case`. This must match your preset file name and image file name (excluding the extension).
- **`name`**: The display name for your preset.
- **`author`**: Your name or username for credit.
- **`url`**: A link to your GitHub profile, website, or social media.
- **`description`**: A short, engaging description of your preset's look and feel. Supports Markdown link syntax `[Text](URL)`.

5.  Once you've filled everything out, click **Commit changes**.

## 4. Submit Your Changes for Review

You're at the final step! Now you just need to send your additions over by creating a **Pull Request**.

1.  Go back to the main page of your forked repository.
2.  A banner will appear: "This branch is commits ahead of main." Click **Contribute**, then **Open a pull request**.
3.  Name your pull request as follows: `Add Preset: Preset Name`.
4.  Click **Create pull request**.
