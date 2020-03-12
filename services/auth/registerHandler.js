import AWS from "aws-sdk";
import util from "util";
const { promisify } = util;

AWS.config.update({
  accessKeyId: process.env.AWS_ACC_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET
});

const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-19",
  region: "ap-southeast-2"
});

const utilPromiseRegisterUser = promisify(COGNITO_CLIENT.adminCreateUser).bind(
  COGNITO_CLIENT
);

const utilPromiseSetPassword = promisify(
  COGNITO_CLIENT.adminSetUserPassword
).bind(COGNITO_CLIENT);

export const register = async (event, context) => {
  const data = JSON.parse(event.body);
  const { email, password } = data;
  const createUserParams = {
    UserPoolId: process.env.AWS_USER_POOL_ID,
    Username: email,
    DesiredDeliveryMediums: ["EMAIL"],
    ForceAliasCreation: false,
    TemporaryPassword: password,
    UserAttributes: [{ Name: "email", Value: email }]
  };
  const passwordParams = {
    Password: password /* required */,
    UserPoolId: process.env.AWS_USER_POOL_ID /* required */,
    Username: email /* required */,
    Permanent: true
  };
  try {
    await utilPromiseRegisterUser(createUserParams);
    await utilPromiseSetPassword(passwordParams);
    return {
      statusCode: 200,
      body: "Register route"
    };
  } catch (err) {
    console.log(err);
  }
};
