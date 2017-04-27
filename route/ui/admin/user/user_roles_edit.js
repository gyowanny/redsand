var userDao = require("../../../../data/user_dao.js");

const orgEditFormUri = 'admin/user/user_roles_edit';

var renderForm = function(title, user, res) {
    var formData = {
        form:{
            title: title
        },
        user: user
    };
    res.render(orgEditFormUri, formData);
}

module.exports = function(req, res) {
    var id = req.params.id;

    userDao.findById(id, function(err, userFound){
        renderForm("User - Edit Access Rights", userFound, res);
    });

}