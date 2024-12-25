# SD Webui Prompt Format
[English|[中文](README_ZH.md)]

This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which helps formatting prompts.

> Also supports [SD.Next](https://github.com/vladmandic/automatic) and [Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge) out of the box!

<p align="center"><img src="sample.jpg" width=512></p>

Sometimes, when you type too fast or copy prompts from all over the places, you end up with duplicated **spaces** or **commas**. This simple Extension helps removing them whenever you click **Generate**.

## Features
- [x] Works in both `txt2img` and `img2img`
- [x] Works in both `Positive` and `Negative`, as well as `Hires. fix` prompts
- [x] Remove extra **spaces** and **commas**
- [x] Fix misplaced **brackets** and **commas**
- [x] Enable `Remove Duplicates` to remove identical tags found in the prompts
  - **Note:** Only works for tag-based prompt, not sentence-based prompt
    - **eg.** `1girl, solo, smile, 1girl` will become `1girl, solo, smile`
    - **eg.** `a girl smiling, a girl standing` will not be changed
- [x] Enable `Remove Underscores` to replace `_` with `space`
- [x] Respect line breaks
  - `Remove Duplicates` only checks within the same line
- [x] Append a comma before a line break
- [x] Toggle between auto formatting and manual formatting
  - In `Auto` mode: The process is ran whenever you click on **Generate**
  - In `Manual` mode: The process is only ran when you click the **Format** button
- [x] Toggle whether the above features are enabled / disabled by default in the `Prompt Format` section under the <ins>System</ins> category of the **Settings** tab
- [x] Pressing `Alt` + `Shift` + `F` can also trigger formatting
- [x] Assign "[alias](#tag-alias)" that counts as duplicates for the specified tags
- [x] Exclude specific tags from `Remove Underscores`
- [x] Click `Reload` to cache new cards
  - By default, the `ExtraNetwork` cards are cached once at the start, to be excluded from `Remove Underscores`. If you added more cards while the Webui is already running, click this button to re-cache again.

### Tag Alias
- In the `Prompt Format` settings, there is a new field for **Tag Alias**
- You can assign other tags that count as the same as the main tag, and thus get removed during `Remove Duplicates`
- The syntax is in the format of `main tag: alias1, alias2, alias3`
  - **example:**
    ```
    1girl: girl, woman, lady
    ```
    - If you type `girl`, it will get converted into `1girl`, and if you already have `1girl`, then the future ones will get removed.

- The pattern for alias uses **Regular Expression**, so certain symbols *(**eg.** `(`, `)`)* will need to be escaped *(**ie.** `\(`, `\)`)*
  - Comma is not supported, as it is used to separate multiple patterns
  - Check out [RegExr](https://regexr.com/) for cheatsheet
  - **example:**
    ```regex
    adult: \d*\s*(y\.?o\.?|[Yy]ear[s]? [Oo]ld)
    ```
    - It will convert `15 yo`, `20 y.o.`, `25 years old`, `30 Year Old` all into `adult`

<hr>

### Note
1. Since the formatting in `Auto` mode is triggered at the same time as the generation, the immediate image might not have its prompts updated.

2. Some Extensions *(**eg.** [tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete))* listen to the text editing event, meaning the formatting will cause them to be triggered. You can disable updating the actual prompts in the `Prompt Format` settings to prevent this. Though you may need to manually type something else for the prompt to get actually updated.
