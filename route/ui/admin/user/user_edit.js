var userDao = require("../../../../data/user_dao.js");

const orgEditFormUri = 'admin/user/user_edit';

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

    if (id) {
        userDao.findById(id, function(err, userFound){
            renderForm("Edit User", userFound, res);
        });
    } else {
        var newUser = {
            id: null,
            fullName: null,
            login: null,
            email: null,
            password: false,
            orgs: []
        }
        renderForm("New User", newUser, res);
    }

}