export function authHeader() {
    //returnerar behörighet med Json Web Token jwt
    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        return { 'Authorization': 'Bearer' + user.token };
    } else {
        return {};
    }
}