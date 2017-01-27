Site = function(url) {
    this.url = url;
    this.json_url = url + '/wp-json';
}

Site.prototype.getData = function(callback, onError) {
    $.getJSON(this.json_url).done(callback).fail(onError);
}

Site.prototype.getAllPages = function() {
    var events = $({});
    var url = this.json_url + '/wp/v2/pages';
    var per_page = 20;
    var page_count = 0;
    var page_data = [];

    var onError = function(e) {
        events.trigger('error', e);
    };

    var fetchPageGroup = function(page_id) {
        console.log('fetching page ', page_id)
        $.getJSON(url, {page: page_id, per_page: per_page}, function(data) {
            console.log('got page ', page_id);
            page_data = page_data.concat(data);
            console.log(page_data);
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
        console.log('got first page');
        page_data = data;
        console.log(page_data);
        page_count = Number(first_request.getResponseHeader('X-WP-TotalPages'));
        events.trigger('progress', {current: 1, total: page_count});
        if (page_count > 1) {
            fetchPageGroup(2);
        }
        else {
            events.trigger('done', {pages: page_data});
        }
    });

    return events;
}
