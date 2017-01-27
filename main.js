function generateExport(site) {
    site.getData(function(data) {
        $('#page-content h1#site-name').text(data.name);
    }, handleError);

    $('#load-info').show();
    updatePageProgress({}, {current: 0, total: 1});
    site.getAllPages()
        .on('progress', updatePageProgress)
        .on('done', renderPages)
        .on('error', handleError);

    $('#site-contents').text('');
}

function handleError(msg) {
    console.warn(msg);
}

function updatePageProgress(event, info) {
    console.log(info);
    $('#load-info .progress-bar').width((info.current / info.total * 100) + '%');
}

function renderPages(event, data) {
    console.log('renderPages');
    $('#load-info').hide();
    updatePageProgress({}, {current: 0, total: 1});
    $.each(data.pages, function(_, page) {
        $('#site-contents')
            .append($('<hr>'))
            .append($('<h1>').text(page.title.rendered));
        $('<div>', {class: "site-page"}).html(page.content.rendered)
            .appendTo($('#site-contents'));
    });
}

jQuery(function($) {
    $('.hidden').hide().removeClass('hidden');
    $('form').on('submit', function(e) {
        e.preventDefault();
        generateExport(new Site($(this).find('input#url').val()));
    });
});
