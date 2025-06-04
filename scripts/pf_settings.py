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

    opts.add_option(
        "pf_startinauto",
        OptionInfo(
            True, "Launch the WebUI with Auto Format enabled", **args
        ).needs_reload_ui(),
    )

    opts.add_option(
        "pf_startwithdedupe",
        OptionInfo(
            True, "Launch the WebUI with Remove Duplicates enabled", **args
        ).needs_reload_ui(),
    )

    opts.add_option(
        "pf_startwithrmudscr",
        OptionInfo(
            True, "Launch the WebUI with Remove Underscores enabled", **args
        ).needs_reload_ui(),
    )

    opts.add_option(
        "pf_appendcomma",
        OptionInfo(True, "Append a comma at the end of each line", **args)
        .info("only take effect when there are more than 1 line")
        .needs_reload_ui(),
    )

    opts.add_option(
        "pf_onpaste",
        OptionInfo(
            False, "Format the texts pasted from clipboard", **args
        ).needs_reload_ui(),
    )

    opts.add_option(
        "pf_booru",
        OptionInfo(False, 'Process the "Booru Structure"', **args)
        .info("only take effect when the above option is enabled")
        .needs_reload_ui(),
    )

    opts.add_option(
        "pf_exclusion",
        OptionInfo(
            default="",
            label="Tags excluded from Remove Underscores",
            component=Textbox,
            component_args={
                "placeholder": "score_9, score_8_up, score_7_up",
                "max_lines": 4,
                "lines": 1,
            },
            **args,
        ).info("requires <b>Reload</b> button"),
    )

    opts.add_option(
        "pf_alias",
        OptionInfo(
            default="",
            label="Tag Alias for Remove Duplicates",
            component=Textbox,
            component_args={
                "placeholder": "1girl: girl, woman, lady\nadult: \\d+\\s*(y\\.?o\\.?|[Yy]ear[s]? [Oo]ld)",
                "max_lines": 8,
                "lines": 2,
            },
            **args,
        )
        .info("requires <b>Reload</b> button")
        .link(
            "Regexper",
            "https://regexper.com/#%5Cd%2B%5Cs*%28y%5C.%3Fo%5C.%3F%7C%5BYy%5Dear%5Bs%5D%3F%20%5BOo%5Dld%29",
        ),
    )


on_ui_settings(on_settings)
