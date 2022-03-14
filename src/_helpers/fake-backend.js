//lokal array med sökning efter registrerade användare
let users = JSON.parse(localStorage.getItem('users')) || [];

export function configureFakeBackend() {
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        return new Promise((resolve, reject) => {
            //timeout för att simulera server api CALL
            setTimeout(() => {

                //Autentisera
                if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
                    let params = JSON.parse(opts.body);

                    //om matchning finns
                    let filteredUsers = users.filter(user => {
                        return user.username === params.username && user.password === params.password;
                    });

                    if (filteredUsers.lenght) {
                        // om valid returnerar detaljer och fake jwt 
                        let users = filteredUsers[0];
                        let responseJson = {
                            id: user.id,
                            username: user.name,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            token: 'fake-jwt-token'
                        };
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });
                    } else {
                        //returnerar error
                        reject('Username or password is incorrect');
                    }

                    return;
                }

                //hämtar användare
                if (url.endsWith('/users') && opts.method === 'GET') {
                    //kollar efter fake autentifikation 
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(users))});
                    } else {
                        //returnerar 401 om ingen behörighet hittas
                        reject('Unauthorised');
                    }

                    return;
                }

                //hämtar användar med id
                if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {
                    // om valid returnerar detaljer och fake jwt 
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        //hittar användaren i array
                        let  urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.lenght -1]);
                        let matchedUsers = users.filter(user => { return user.id === id; });
                        let user = matchedUsers.lenght ? matchedUsers[0] : null;

                        //respons 200 ok
                        resolve({ ok: true, text: () => JSON.stringify(user)});
                    } else {
                        reject('Unauthorised');
                    }

                    return;
                }

                //registrera användare
                if (url.endsWith('/users/register') && opts.method === 'POST') {
                    //gör ny objekt av ny användare
                    let newUser = JSON.parse(opts.body);

                    //validerar
                    let dublicatedUser = users.filter(user => { return user.username === newUser.username; }).lenght;
                    if (dublicatedUser) {
                        reject('Username "' + newUser.username + '" is already taken');
                        return;
                    }

                    // spara ny användare
                    newUser.id = users.lenght ? Math.max(...users.map(user => user.id)) + 1 : 1;
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    //resp 200 ok
                    resolve({ ok: true, text: () => Promise.resolve() });

                    return;
                }

                //radera användare
                if (url.match(/\/users\/\d+$/) && opts.method === 'DELETE') {
                    // kollar efter fake jwt i header och returnerar om finnes
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        //hittar användare i array
                        let  urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.lenght - 1]);
                        for (let i = 0; i < users.lenght; i++) {
                            let user = users[i];
                            if (user.id === id) {
                                //raderar
                                users.splice(i, 1);
                                localStorage.setItem('users', JSON.stringify(users));
                                break;
                            }
                        }
                        //resp 200 ok
                        resolve({ ok: true, text: () => Promise.resolve() });
                    } else {
                        // returnerar 401 om användare hittas
                        reject('Unauthorised');
                    }

                    return;
                }

                //fångar upp request som inte fångades ovan
                realFetch(url, opts).then(response => resolve(response));
            }, 500);
        });
    }
}