AWS.config.region = 'eu-central-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-central-1:ae393405-a63b-4405-b9c4-9add248c5ace',
    Logins: {
        'cognito-idp.eu-central-1.amazonaws.com/eu-central-1_Xs98OoIxj': JSON.parse(localStorage.getItem('token'))
    }
});

$(document).ready(function () {
    updateAuthenticationStatus();
    loadAdmin();
});
function logout() {
    localStorage.clear();
    window.location = '/';
};

function updateAuthenticationStatus() {
    $('#user').empty();
    $('#login').empty();
    var user = localStorage.getItem('token');
    if (user) {
        $('#user').show().append('<a onclick="logout()">Log out</a>');
        $('#login').hide();
    } else {
        $('#login').show().append('<a href="/login">Log in</a>');
        $('#user').hide();
    }
}

function loadAdmin() {
    if (window.location.pathname == '/admin/') {
        if (localStorage.getItem('token')) {
            AWS.config.credentials.get(function (err) {
                var client = apigClientFactory.newClient({
                    accessKey: AWS.config.credentials.accessKeyId,
                    secretKey: AWS.config.credentials.secretAccessKey,
                    sessionToken: AWS.config.credentials.sessionToken,
                    region: 'eu-central-1'
                });
                client.participantsGet().then(function (data) {
                    for (var i = 0; i < data.data.message.length; i++) {
                        $('#participants').append('<h4>' + data.data.message[i].email + '</h4>' + '\n' + data.data.message[i].firstname + ' ' + data.data.message[i].lastname);
                    }
                });
            });
        } else {
            window.location = '/';
        }
    }
}

$('#register').submit(function (e) {
    e.preventDefault();

    $('#test').hide();
    $('#invisble').append('blablabla');


    var client = apigClientFactory.newClient();

    var email = $('#email').val();
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    client.registerPost({}, {email: email, firstname: firstname, lastname: lastname}, {})
        .then(function (data) {
        if (data.data.statusCode == 200) {
            $('#register').hide();
            $('#response').append('<div class="alert alert-success">' + data.data.message + '</div>')
        } else {
            $('#register').hide();
            $('#response').append('<div class="alert alert-danger">' + data.data.message + '</div>')
        }
    }, function (data) {
        alert("failed " + data.data.message)
    })
});

$('#signin').submit(function (e) {
    e.preventDefault();
    AWSCognito.config.region = 'eu-central-1';
    AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-central-1:ae393405-a63b-4405-b9c4-9add248c5ace'
    });
    // Need to provide placeholder keys unless unauthorised user access is enabled for user pool
    AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'});

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
        UserPoolId: 'eu-central-1_Xs98OoIxj',
        ClientId: '1giir25g9moks5k2l3b997flpg'
    });

    var authenticationData = {
        Username: $('#username').val(),
        Password: $('#password').val(),
    };
    var userData = {
        Username: $('#username').val(),
        Pool: userPool
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            localStorage.setItem('token', JSON.stringify(result.idToken.jwtToken));
            window.location = '/';
        },
        onFailure: function (err) {
            console.log(err);
        }
    });
})
