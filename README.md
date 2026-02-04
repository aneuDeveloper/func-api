Start application for development
- npm run start

Use docker image
- docker pull aneudeveloper/func-api

sudo docker build -t aneudeveloper/func-api:1.0.0 .
docker login --username aneudeveloper
docker push aneudeveloper/func-api:1.0.0

## Authentification Configuration

### Disable authentification
AUTHENTIFICATION_ENABLED=true
If authentification is disabled all endpoins skip request validation. Any endpoint can be used without any security.

### Using OIDC with Password grand_type
AUTHENTIFICATION_ENABLED=true
AUTH_TYPE=OIDC
OPENID_WELL_KNOWN_URL="url"
OPENID_REDIRECT_URI="for token endpoint"
CLIENT_EXPOSED_OPENID_REDIRECT_URL="url to your auth
