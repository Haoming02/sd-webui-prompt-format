from modules.script_callbacks import on_ui_settings
from modules.shared import OptionInfo, opts
import gradio as gr

section = ("pf", "Prompt Format")


def on_settings():

    opts.add_option(
        "pf_disableupdateinput",
        OptionInfo(
            False,
            "Disable automatic input updates",
            section=section,
            category_id="system",
        ).info(
            "check this if you have Extensions, such as [tagcomplete], that subscribe to text editing event"
        ),
    )

    opts.add_option(
        "pf_startinauto",
        OptionInfo(True, "Start in Auto Mode", section=section, category_id="system"),
    )

    opts.add_option(
        "pf_startwithdedupe",
        OptionInfo(
            True,
            "Launch with Remove Duplicates",
            section=section,
            category_id="system",
        ),
    )

    opts.add_option(
        "pf_startwithrmudscr",
        OptionInfo(
            False,
            "Launch with Remove Underscores",
            section=section,
            category_id="system",
        ),
    )

    opts.add_option(
        "pf_exclusion",
        OptionInfo(
            default="",
            label="Exclude Tags from Remove Underscores",
            component=gr.Textbox,
            component_args={
                "placeholder": "score_9, score_8_up, score_7_up",
                "lines": 1,
                "max_lines": 1,
            },
            section=section,
            category_id="system",
        ),
    )

    opts.add_option(
        "pf_alias",
        OptionInfo(
            default="",
            label="Tag Alias for Remove Duplicates",
            component=gr.Textbox,
            component_args={
                "placeholder": "1girl: girl, woman, lady\nadult: \\d*\\s*(y\\.?o\\.?|[Yy]ear[s]? [Oo]ld)",
                "lines": 8,
                "max_lines": 64,
            },
            section=section,
            category_id="system",
        )
        .info(
            """treat tags on the right as duplicates, and substitute them with the main tag on the left)
             (based on regular expression, meaning you may need to escape some symbols)
             (comma is not supported in pattern"""
        )
        .link("RegExr", "https://regexr.com/"),
    )


on_ui_settings(on_settings)
