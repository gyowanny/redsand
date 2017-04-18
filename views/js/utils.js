function convertFormToJSON(form){
    var array = $(form).serializeArray();
    var json = {};

    $.each(array, function() {
        json[this.name] = this.value || '';
    });

    if (json.id === '') {
        delete json.id;
    }

    return json;
}