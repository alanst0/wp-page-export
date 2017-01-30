Site = function(url) {
    this.url = url;
    this.json_url = url + '/wp-json';
}

Site.getResponseErrorMessage = function(response) {
    if (response.responseJSON) {
        if (response.responseJSON.code == "rest_no_route") {
            return "This site uses an older version of Wordpress which does not work with this tool.";
        }
    }
    if (response.status == 404) {
        return "Site not found";
    }
    return "Request failed: " + response.statusText + " (" + response.status + ")";
}

Site.prototype.getData = function() {
    var events = $({});
    $.getJSON(this.json_url)
        .done(function(data) {
            events.trigger('done', data);
        })
        .fail(function(response) {
            events.trigger('error', {message: Site.getResponseErrorMessage(response)});
        });
    return events;
}

Site.prototype.getAllPages = function() {
    var events = $({});
    var url = this.json_url + '/wp/v2/pages';
    var per_page = 20;
    var page_count = 0;
    var page_data = [];

    var onError = function(response) {
        events.trigger('error', {message: Site.getResponseErrorMessage(response)});
    };

    var fetchPageGroup = function(page_id) {
        $.getJSON(url, {page: page_id, per_page: per_page}, function(data) {
            page_data = page_data.concat(data);
            events.trigger('progress', {current: page_id, total: page_count});
            if (page_id < page_count) {
                fetchPageGroup(page_id + 1);
            }
            else {
                events.trigger('done', {pages: page_data});
            }
        }).fail(onError);
    };

    var first_request = $.getJSON(url, {per_page: per_page}, function(data) {
        page_data = data;
        page_count = Number(first_request.getResponseHeader('X-WP-TotalPages'));
        events.trigger('progress', {current: 1, total: page_count});
        if (page_count > 1) {
            fetchPageGroup(2);
        }
        else {
            events.trigger('done', {pages: page_data});
        }
    }).fail(onError);

    return events;
}
