var orgDao = require("../../../../data/org_dao.js");

const orgEditFormUri = 'admin/org/org_edit';

var renderForm = function(title, org, res) {
    var formData = {
        form:{
            title: title
        },
        org: org
    };
    res.render(orgEditFormUri, formData);
}

module.exports = function(req, res) {
    var id = req.params.id;

    if (id) {
        orgDao.findById(id, function(err, orgFound){
            renderForm("Edit Application", orgFound, res);
        });
    } else {
        var newOrg = {
            id: null,
            name: null,
            org_id: null,
            tokenExpiration: null,
            inactive: false
        }
        renderForm("New Application", newOrg, res);
    }

}