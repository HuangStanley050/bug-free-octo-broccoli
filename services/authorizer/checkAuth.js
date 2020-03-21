import jwt from "jsonwebtoken";
import axios from "axios";
import jwkToPem from "jwk-to-pem";

// const generatePolicy = (principalId, effect, resource) => {
//   const authResponse = {};
//   authResponse.principalId = principalId;
//   if (effect && resource) {
//     const policyDocument = {};
//     policyDocument.Version = "2012-10-17";
//     policyDocument.Statement = [];
//     const statementOne = {};
//     statementOne.Action = "execute-api:Invoke";
//     statementOne.Effect = effect;
//     statementOne.Resource = resource;
//     policyDocument.Statement[0] = statementOne;
//     authResponse.policyDocument = policyDocument;
//   }
//   return authResponse;
// };

//const jwtSecret = "verySecretMuchWow";

export const auth = async (event, context, callback) => {
  const token = event.authorizationToken;

  if (!token) return callback(null, "Unauthorized");
  const tokenParts = event.authorizationToken.split(" ");
  const tokenValue = tokenParts[1];

  let result = await axios.get(
    `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`
  );
  const pem = jwkToPem(result.data.keys[1]);
  console.log(result.data);
  // console.log("+++++++++++++++");
  console.log(pem);
  jwt.verify(tokenValue, pem, { algorithms: ["RS256"] }, function(
    err,
    decodedToken
  ) {
    if (!err) {
      console.log("token okay");
      console.log(decodedToken);
    } else {
      console.log("token not okay");
      console.log("here is the token: ", tokenValue);
      console.log(err);
      callback("Token not authorized");
    }
  });
};
