

function ContentTableBuilder(){    
    var tpl_table = "<table class='content_panel' id='${table_id}'></table>";
    var tpl_thead = "<thead>${head_row}</thead>";
    var tpl_tbody = "<tbody>${body_rows}</tbody>";

    this.create = function (config) {
        var columns = config.columns || [];

    }
};