var orgDao = require("../../../../data/org_dao.js");

module.exports = function(req, res) {
    var idToDelete = req.params.id;

    orgDao.delete(idToDelete, function(err, result) {

        if (err) {
            //should redirect to error page or set variable to show error message
        }

        res.redirect('/ui/admin/org');
    });
}