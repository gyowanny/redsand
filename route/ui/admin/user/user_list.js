var userDao = require("../../../../data/user_dao");

module.exports = function(req, res) {
    userDao.getAll(function(err, userList) {
        var formData = {
            form: {
                title: 'Users',
            },
            list: userList
        }
        res.render('admin/user/user_list', formData);
    });
}