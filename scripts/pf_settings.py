from modules.script_callbacks import on_ui_settings


def on_settings():
    from modules.shared import OptionInfo, opts
    import gradio as gr

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
        OptionInfo(True, "Launch in Auto Mode", **args),
    )

    opts.add_option(
        "pf_startwithdedupe",
        OptionInfo(True, "Launch with Remove Duplicates", **args),
    )

    opts.add_option(
        "pf_startwithrmudscr",
        OptionInfo(True, "Launch with Remove Underscores", **args),
    )

    opts.add_option(
        "pf_appendcomma",
        OptionInfo(True, "Append a comma at the end of each line", **args)
        .info("only take effect when there are multiple lines")
        .needs_reload_ui(),
    )

    opts.add_option(
        "pf_onpaste",
        OptionInfo(False, "Format the pasted text", **args).needs_reload_ui(),
    )

    opts.add_option(
        "pf_exclusion",
        OptionInfo(
            default="",
            label="Exclude Tags from Remove Underscores",
            component=gr.Textbox,
            component_args={
                "placeholder": "score_9, score_8_up, score_7_up",
                "max_lines": 1,
                "lines": 1,
            },
            **args,
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
                "max_lines": 16,
                "lines": 4,
            },
            **args,
        )
        .link("RegExr", "https://regexr.com/")
        .info(
            """treat tags on the right as duplicates of the main tag on the left)
             (based on regular expression, meaning you need to escape special characters)
             (comma is not allowed"""
        ),
    )

    opts.add_option(
        "pf_booru",
        OptionInfo(
            False,
            'Process the "Booru Structure"',
            **args,
        ).info("requires format on paste) (<b>Experimental</b>"),
    )


on_ui_settings(on_settings)
