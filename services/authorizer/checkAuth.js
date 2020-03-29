import jwt from "jsonwebtoken";
import axios from "axios";
import jwkToPem from "jwk-to-pem";

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

export const auth = async (event, context) => {
  const token = event.authorizationToken;

  if (!token) return new Error("Not authorrized");
  const tokenParts = event.authorizationToken.split(" ");
  const tokenValue = tokenParts[1];

  let result = await axios.get(
    `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`
  );
  const pem = jwkToPem(result.data.keys[1]);
  try {
    const decoded = jwt.verify(tokenValue, pem, { algorithm: ["RS256"] });

    return generatePolicy(decoded.sub, "Allow", event.methodArn);
  } catch (err) {
    return new Error("Not authorized");
  }
};
