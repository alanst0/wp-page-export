function generateExport(site) {
    site.getData()
        .on('done', function(event, data) {
            $('#page-content h1#site-name').text(data.name);
        })
        .on('error', handleError);

    $('#load-info').show();
    $('#load-error').hide();
    updatePageProgress({}, {current: 0, total: 1});
    site.getAllPages()
        .on('progress', updatePageProgress)
        .on('done', renderPages)
        .on('error', handleError);

    $('#site-contents').text('');
}

function handleError(event, info) {
    $('#load-info').hide();
    $('#load-error').show().find('.alert').text(info.message);
    if (info.network_error) {
        $('#load-error .alert').append($('#network-error-info').html());
    }
}

function updatePageProgress(event, info) {
    $('#load-info .progress-bar').width((info.current / info.total * 100) + '%');
}

function renderPages(event, data) {
    $('#load-info').hide();
    updatePageProgress({}, {current: 0, total: 1});
    $.each(data.pages, function(_, page) {
        if (page.content.rendered == "") {
            return;
        }
        var wrapper = $('<div>', {class: "site-page"}).appendTo($("#site-contents"));
        wrapper.append($('<hr>'))
            .append($('<h1>').html(page.title.rendered));
        $('<div>', {class: "site-page-content"}).html(page.content.rendered)
            .appendTo(wrapper);
    });
}

function normalizeURL(url) {
    if (!url.match(/^(https?:)?\/\//)) {
        // The nginx proxy expects a protocol, so use "http".
        // Otherwise, assume this is being hosted statically. We can't request
        // something over a different protocol, so just use this page's protocol.
        url = (window.HAS_NGINX ? 'http:' : '') + '//' + url;
    }
    return url;
}

jQuery(function($) {
    $('.hidden').hide().removeClass('hidden');
    $('form').on('submit', function(e) {
        e.preventDefault();
        var url = $(this).find('input#url').val();
        if (url)
            generateExport(new Site(normalizeURL(url)));
    });
});
