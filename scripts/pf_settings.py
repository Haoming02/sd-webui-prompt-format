from gradio import Checkbox, Column, Textbox

from modules import scripts
from modules.script_callbacks import on_ui_settings
from modules.shared import OptionInfo, cmd_opts, opts


def get_embeddings() -> set[str]:
    from pathlib import Path

    EXTENSIONS = (".pt", ".pth", ".ckpt", ".safetensors", ".sft")
    items: set[str] = set()

    embeddings = Path(cmd_opts.embeddings_dir)
    for ext in EXTENSIONS:
        files = embeddings.glob(f"**/*{ext}")
        for file in files:
            items.add(file.stem)

    return items


class PFServer(scripts.Script):
    def title(self):
        return "Prompt Format"

    def show(self, is_img2img):
        return scripts.AlwaysVisible if is_img2img else None

    def ui(self, is_img2img):
        if not is_img2img:
            return None

        with Column(visible=False):
            emb = get_embeddings()
            link = Textbox(
                value="\n".join(emb),
                elem_id="pf_embeddings",
                interactive=False,
            )
            dummy = Checkbox(
                label="Enable",
                elem_id="pf_checkbox",
                interactive=True,
            )

        link.do_not_save_to_config = True
        dummy.do_not_save_to_config = True


def on_settings():
    args = {"section": ("pf", "Prompt Format"), "category_id": "system"}

    opts.add_option(
        "pf_disableupdateinput",
        OptionInfo(False, "Disable the automatic updates of the prompts", **args)
        .info(
            """enable this if you have Extensions, such as
            <a href="https://github.com/DominikDoom/a1111-sd-webui-tagcomplete">tagcomplete</a>,
            that subscribe to text editing events"""
        )
        .needs_reload_ui(),
    )

    for label, desc in [
        ("pf_startinauto", 'Launch the WebUI with "Auto Format" enabled'),
        ("pf_startwithdedupe", 'Launch the WebUI with "Remove Duplicates" enabled'),
        ("pf_startwithrmudscr", 'Launch the WebUI with "Remove Underscores" enabled'),
        ("pf_appendcomma", "Append a comma at the end of each line"),
        ("pf_onpaste", "Format the texts pasted from clipboard"),
        ("pf_booru", 'Process the "Booru Structure" on Paste'),
    ]:
        opts.add_option(label, OptionInfo(True, desc, **args).needs_reload_ui())

    _SCORE = "score_1, score_2, score_3, score_7, score_8, score_9"

    opts.add_option(
        "pf_exclusion",
        OptionInfo(
            default=_SCORE,
            label='Tags to exclude from "Remove Underscores"',
            component=Textbox,
            component_args={
                "placeholder": _SCORE,
                "lines": 1,
                "max_lines": 2,
            },
            **args,
        ).info("requires <b>Reload</b> button"),
    )

    opts.add_option(
        "pf_alias",
        OptionInfo(
            default="",
            label='Tag Alias for "Remove Duplicates"',
            component=Textbox,
            component_args={
                "placeholder": "1girl:girl|woman|lady",
                "max_lines": 8,
                "lines": 2,
            },
            **args,
        )
        .info("requires <b>Reload</b> button")
        .link("RegExr", "https://regexr.com/"),
    )


on_ui_settings(on_settings)
