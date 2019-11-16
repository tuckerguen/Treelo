$(document).ready(async function() {
    const auth0 = await createAuth0Client({
        domain: 'treelo.auth0.com',
        client_id: '48a573Kc8Mo4S2aX2cnFNjVSkx6YHnGn'
    });

    $("#submit").click(async function(){
        await auth0.loginWithPopup({
            redirect_uri: 'https://localhost:8080/login'
        });
        
        const user = await auth0.getUser();
        console.log(user);

        const accessToken = await auth0.getTokenSilently();
        // const result = await fetch('https://localhost:8080/trees', {
        //     method: 'GET',
        //     headers: {
        //         Authorization: 'Bearer ' + accessToken
        //     }
        // });
        

    });
});
