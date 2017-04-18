var orgDao = require("../../../../data/org_dao.js");

module.exports = function(req, res) {
    orgDao.getAll(function(err, orgList) {
        var formData = {
            form: {
                title: 'Organizations',
            },
            list: orgList
        }
        res.render('admin/org/org_list', formData);
    });
}