var COGNITO_REGION_ID = "us-east-2";
var USER_POOL_ID = "us-east-2_3uaV9APeM";
var CLIENT_ID = "mch5bke71ct0o14gcttr95fj0";
var IDENTITY_POOL_ID = "us-east-2:89495521-7e6b-4487-8f5d-c72bb004a5e2";
var LAMBDA_REGION_ID = "ap-southeast-2";
var LOAD_VOTE_LAMBDA_FUNCTION = "LoadVote";
var SAVE_VOTE_LAMBDA_FUNCTION = "SaveVote";
var GET_VOTE_RESULTS_LAMBDA_FUNCTION = "GetVoteResults";

function showProgress(message)
{
	setElementValue("progress.text", message);
    showPopup("progress");
}

function hideProgress()
{
    hidePopup("progress");
}

function showSignin()
{
    hideElement("signupSection");
    clearElements("signup");
    hideElement("confirmationSection");
    clearElements("confirm");
    hideElement("forgotPasswordSection");
    clearElements("forgotPassword");
    hideElement("resetPasswordSection");
    clearElements("resetPassword");
    showElement("signinSection");
}

function showSignup()
{
    hideElement("signinSection");
    clearElements("signin");
    hideElement("confirmationSection");
    clearElements("confirm");
    hideElement("forgotPasswordSection");
    clearElements("forgotPassword");
    hideElement("resetPasswordSection");
    clearElements("resetPassword");
    showElement("signupSection");
}

function showConfirmation()
{
    hideElement("signinSection");
    clearElements("signin");
    hideElement("signupSection");
    clearElements("signup");
    hideElement("forgotPasswordSection");
    clearElements("forgotPassword");
    hideElement("resetPasswordSection");
    clearElements("resetPassword");
    showElement("confirmationSection");
}

function showForgotPassword()
{
    hideElement("signinSection");
    clearElements("signin");
    hideElement("signupSection");
    clearElements("signup");
    hideElement("confirmationSection");
    clearElements("confirm");
    hideElement("resetPasswordSection");
    clearElements("resetPassword");
    showElement("forgotPasswordSection");
}

function showResetPassword()
{
    hideElement("signinSection");
    clearElements("signin");
    hideElement("signupSection");
    clearElements("signup");
    hideElement("confirmationSection");
    clearElements("confirm");
    hideElement("forgotPasswordSection");
    clearElements("forgotPassword");
    showElement("resetPasswordSection");
}

function signupGo()
{
    hideElement("signup.message");
    showProgress("Signing up...");

    var username = getElementValue("signup.username");
    var password = getElementValue("signup.password");
    var givenName = getElementValue("signup.given_name");
    var familyName = getElementValue("signup.family_name");
    var email = getElementValue("signup.email");
    var phoneNumber = getElementValue("signup.phone_number");
    
    // TODO Validate fields

    var dataGivenName =
    {
        Name : "given_name",
        Value : givenName
    };
    var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(dataGivenName);
    
    var dataFamilyName =
    {
        Name : "family_name",
        Value : familyName
    };
    var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFamilyName);
    
    var dataEmail =
    {
        Name : "email",
        Value : email
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    
    var dataPhoneNumber =
    {
        Name : 'phone_number',
        Value : phoneNumber
    };
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
     
    var attributeList = [];
    attributeList.push(attributeGivenName);
    attributeList.push(attributeFamilyName);
    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
     
    var poolData =
    {
        UserPoolId : USER_POOL_ID,
        ClientId : CLIENT_ID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    userPool.signUp(username, password, attributeList, null, function(err, result)
    {
        hideProgress();

        if(err)
        {
            setElementValue("signup.message", err.message);
            showElement("signup.message");
            return;
        }
        
        setElementValue("confirm.username", getElementValue("signup.username"));
        hideElement("signupSection");
        clearElements("signup");
        showElement("confirmationSection");
    });
}

function signupClear()
{
    hideElement("signup.message");
    clearElements("signup");
}

function confirmGo()
{
    hideElement("confirm.message");
    showProgress("Confirming signup...");

    var username = getElementValue("confirm.username");
    var verificationCode = getElementValue("confirm.code");

    // TODO Validate fields
    
    var poolData =
    {
        UserPoolId : USER_POOL_ID,
        ClientId : CLIENT_ID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    var userData =
    {
        Username : username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(verificationCode, true, function(err, result)
    {
        hideProgress();

        if(err)
        {
            setElementValue("confirm.message", err.message || JSON.stringify(err));
            showElement("confirm.message");
            return;
        }
        
        setElementValue("signin.username", getElementValue("confirm.username"));
        clearElements("signup");
        hideElement("confirmationSection");
        clearElements("confirm");
        showElement("signinSection");
    });
}

var cognitoUser = null;
function signinGo()
{
    hideElement("signin.message");
    showProgress("Signing in...");

    var username = getElementValue("signin.username");
    var password = getElementValue("signin.password");

    // TODO Validate fields
    
    var poolData =
    {
        UserPoolId : USER_POOL_ID,
        ClientId : CLIENT_ID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    var userData =
    {
        Username : username,
        Pool : userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    var authenticationData =
    {
        Username : username,
        Password : password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
    cognitoUser.authenticateUser(authenticationDetails,
    {
        onSuccess: function(result)
        {
            var loginsValue = {};
            loginsValue["cognito-idp." + COGNITO_REGION_ID + ".amazonaws.com/" + USER_POOL_ID] = result.getIdToken().getJwtToken();
            var credentials = new AWS.CognitoIdentityCredentials(
            {
                IdentityPoolId : IDENTITY_POOL_ID,
                Logins : loginsValue
            });
            
            AWS.config.region = COGNITO_REGION_ID;
            AWS.config.credentials = credentials;
            
            credentials.refresh(function(err)
            {
                hideProgress();

                if(err)
                {
                    setElementValue("signin.message", err.toString());
                    showElement("signin.message");
                    return;
                }
                
                var groups = result.idToken.payload["cognito:groups"];
                groups = (groups == null) ? [ "[Default]" ] : groups;
                setElementValue("welcome.username", getElementValue("signin.username"));
                setElementValue("details.groups", groups.join(", "));
                var operation = groups.indexOf("admin") >= 0 ? showElement : hideElement;
                var adminElements = getElements("admin_function");
                for(var i = 0; i < adminElements.length; i++)
                {
                    operation(adminElements[i].id);
                }
                
                hideElement("header");
                hideElement("signinSection");
                clearElement("signin.password");
                showElement("memberContent");
            });
        },
        
        newPasswordRequired: function(userAttributes, requiredAttributes)
        {
            hideProgress();

            var newPassword = prompt("Please enter a new password");
            var firstName = prompt("Please enter your first name");
            var attributeData = { given_name: firstName };
            
            cognitoUser.completeNewPasswordChallenge(newPassword, attributeData, this);
        },

        onFailure: function(err)
        {
            hideProgress();
            setElementValue("signin.message", err.message || JSON.stringify(err));
            showElement("signin.message");
        }
    });
}

function signinClear()
{
    hideElement("signin.message");
    clearElements("signin");
}

function forgotPasswordGo()
{
    hideElement("forgotPassword.message");
    showProgress("Requesting reset...");

    var username = getElementValue("forgotPassword.username");

    // TODO Validate fields
    
    var poolData =
    {
        UserPoolId : USER_POOL_ID,
        ClientId : CLIENT_ID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    var userData =
    {
        Username : username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.forgotPassword(
    {
        onSuccess: function(data)
        {
            hideProgress();
            setElementValue("resetPassword.username", getElementValue("forgotPassword.username"));
            hideElement("forgotPasswordSection");
            clearElements("forgotPassword");
            showElement("resetPasswordSection");
        },
        
        onFailure: function(err)
        {
            hideProgress();
            setElementValue("forgotPassword.message", err.toString());
            showElement("forgotPassword.message");
        }
    });
}

function resetPasswordGo()
{
    hideElement("resetPassword.message");
    showProgress("Resetting password...");

    var username = getElementValue("resetPassword.username");
    var verificationCode = getElementValue("resetPassword.code");
    var password = getElementValue("resetPassword.password");

    // TODO Validate fields
    
    var poolData =
    {
        UserPoolId : USER_POOL_ID,
        ClientId : CLIENT_ID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    var userData =
    {
        Username : username,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmPassword(verificationCode, password,
    {
        onSuccess: function()
        {
            hideProgress();
            setElementValue("signin.username", getElementValue("resetPassword.username"));
            hideElement("resetPasswordSection");
            clearElements("resetPassword");
            showElement("signinSection");
        },
        
        onFailure: function(err)
        {
            hideProgress();
            setElementValue("resetPassword.message", err.toString());
            showElement("resetPassword.message");
        }
    });
}

function detailsLoad()
{
    if(cognitoUser == null)
    {
        setElementValue("details.message", "Not signed in - please sign in");
        showElement("details.message");
        return;
    }
    
    hideElement("details.message");
    showProgress("Loading details...");

    cognitoUser.getUserAttributes(function(err, result)
    {
        hideProgress();

        if(err)
        {
            setElementValue("details.message", err.message || JSON.stringify(err));
            showElement("details.message");
            return;
        }
        
        //var message = "";
        for(var i = 0; i < result.length; i++)
        {
            //message += 'attribute ' + result[i].getName() + ' = ' + result[i].getValue() + "\n";
            setElementValue("details." + result[i].getName(), result[i].getValue());
        }
        //alert(message)
    });
}

function detailsSave()
{
    if(cognitoUser == null)
    {
        setElementValue("details.message", "Not signed in - please sign in");
        showElement("details.message");
        return;
    }

    hideElement("details.message");
    showProgress("Saving details...");

    var attributeList = [];
    var elements = getElements("details");
    for(var i = 0; i < elements.length; i++)
    {
        var element = elements[i];
        if(element.id != "details.message")
        {
            var attributeData =
            {
                Name : element.id.replace("details.", ""),
                Value : getElementValue(element.id)
            };
            
            var attribute = new AmazonCognitoIdentity.CognitoUserAttribute(attributeData);
            attributeList.push(attribute);
        }
    }
    
    cognitoUser.updateAttributes(attributeList, function(err, result)
    {
        hideProgress();

        if(err)
        {
            setElementValue("details.message", err.message || JSON.stringify(err));
            showElement("details.message");
            return;
        }
    });
}

function detailsClear()
{
    hideElement("details.message");
    clearElements("details");
}

function signoutGo()
{
    if(cognitoUser == null)
    {
        return;
    }

    cognitoUser.signOut();
    cognitoUser = null;
    AWS.config.credentials.clearCachedId();
    
    hideElement("memberContent");
    selectTab("memberContent", "welcomeTab");
    clearElements("votes");
    clearElements("details");
    clearElements("admin");
    showElement("header");
    showElement("signinSection");
}

function voteLoad()
{
    showProgress("Getting vote...");

    var payload =
    {
        requestId : 12345, // TODO Generate an Id
        username : getElementValue("signin.username")
    };
    
    var pullParams =
    {
        FunctionName : LOAD_VOTE_LAMBDA_FUNCTION,
        InvocationType : 'RequestResponse',
        Payload: JSON.stringify(payload),
        LogType : 'None'
    };

    var lambda = new AWS.Lambda({region: LAMBDA_REGION_ID, apiVersion: '2015-03-31'});
    
    lambda.invoke(pullParams, function(err, data)
    {
        hideProgress();

        if(err)
        {
            setElementValue("votes.vote", "");
            alert(err);
            return;
        }
        
        var response = JSON.parse(data.Payload);
        if(response.responseCode != 0)
        {
            setElementValue("votes.vote", "");
            alert("Failed to get vote.\n" + response.responseMessage);
            return;
        }
        
        setElementValue("votes.choice", response.vote);
        setElementValue("votes.vote", response.vote == "" ? "[No vote cast]" : response.vote);
    });
}

function voteSave()
{
    showProgress("Casting vote...");

    var payload =
    {
        requestId : 12345, // TODO Generate an Id
        username : getElementValue("signin.username"),
        vote : getElementValue("votes.choice")
    };
    
    var pullParams =
    {
        FunctionName : SAVE_VOTE_LAMBDA_FUNCTION,
        InvocationType : 'RequestResponse',
        Payload: JSON.stringify(payload),
        LogType : 'None'
    };

    var lambda = new AWS.Lambda({region: LAMBDA_REGION_ID, apiVersion: '2015-03-31'});
    
    lambda.invoke(pullParams, function(err, data)
    {
        hideProgress();

        if(err)
        {
            setElementValue("votes.vote", "");
            alert(err);
            return;
        }
        
        var response = JSON.parse(data.Payload);
        if(response.responseCode != 0)
        {
            setElementValue("votes.vote", "");
            alert("Failed to get vote.\n" + response.responseMessage);
            return;
        }
        
        setElementValue("votes.vote", getElementValue("votes.choice"));
    });
}

function voteResults()
{
    showProgress("Getting results...");

    var payload =
    {
        requestId : 12345 // TODO Generate an Id
    };
    
    var pullParams =
    {
        FunctionName : GET_VOTE_RESULTS_LAMBDA_FUNCTION,
        InvocationType : 'RequestResponse',
        Payload: JSON.stringify(payload),
        LogType : 'None'
    };

    var lambda = new AWS.Lambda({region: LAMBDA_REGION_ID, apiVersion: '2015-03-31'});
    
    lambda.invoke(pullParams, function(err, data)
    {
        hideProgress();

        if(err)
        {
            setElementValue("votes.result", "");
            alert(err);
            return;
        }
        
        var response = JSON.parse(data.Payload);
        if(response.responseCode != 0)
        {
            setElementValue("votes.result", "");
            alert("Failed to get vote results.\n" + response.responseMessage);
            return;
        }
        
        setElementValue("votes.result", response.voteResults);
    });
}

function changePasswordGo()
{
    hideElement("changePassword.message");
    showProgress("Changing password...");

    var oldPassword = getElementValue("changePassword.oldPassword");
    var newPassword = getElementValue("changePassword.newPassword");

    // TODO Validate fields
    
    cognitoUser.changePassword(oldPassword, newPassword, function(err, result)
    {
        hideProgress();

        if(err)
        {
            setElementValue("changePassword.message", err.toString());
            showElement("changePassword.message");
            return;
        }
        
        clearElements("changePassword");
        
        alert("Succesfully changed password");
    });
}

function deleteUserGo()
{
    hideElement("deleteUser.message");

    if(confirm("Do wish to close your account?"))
    {
        showProgress("Closing account...");

        cognitoUser.deleteUser(function(err, result)
        {
            hideProgress();

            if(err)
            {
                setElementValue("deleteUser.message", err.toString());
                showElement("deleteUser.message");
                return;
            }
            
            cognitoUser.signOut();
            cognitoUser = null;
            
            hideElement("memberContent");
            selectTab("memberContent", "welcomeTab");
            clearElements("votes");
            clearElements("details");
            clearElements("admin");
            showElement("header");
            clearElements("signin");
            showElement("signinSection");
        });
    }
}