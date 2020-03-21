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
const utilPromiseAdminInitAuth = promisify(COGNITO_CLIENT.initiateAuth).bind(
  COGNITO_CLIENT
);

export const login = async (event, context) => {
  const data = JSON.parse(event.body);
  const { email, password } = data;
  const userAuthParams = {
    ClientId: process.env.AWS_CLIENT_ID,
    //UserPoolId: process.env.AWS_USER_POOL_ID,
    AuthFlow: "USER_PASSWORD_AUTH",
    AnalyticsMetadata: {
      AnalyticsEndpointId: "STRING_VALUE"
    },
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  };
  try {
    let result = await utilPromiseAdminInitAuth(userAuthParams);
    console.log(result);
    return {
      statusCode: 200,
      body: JSON.stringify(result.AuthenticationResult.AccessToken)
    };
  } catch (err) {
    console.log(err);
  }
};
