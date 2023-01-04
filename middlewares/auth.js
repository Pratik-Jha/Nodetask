function authAdmin(role) {
    if (role == null) {
        return false
    } else {
        return true
    }
}

module.exports = {
    authAdmin
}