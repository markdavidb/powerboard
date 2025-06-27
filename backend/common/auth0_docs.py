# common/auth0_docs.py
"""
Add an OAuth2-Auth0 flow to Swagger /docs for any FastAPI app.
Usage:
    from common.auth0_docs import wire_auth0_docs
    wire_auth0_docs(app, port=8002)
"""
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.openapi.utils import get_openapi
from common.config import settings

def wire_auth0_docs(app, *, port: int) -> OAuth2AuthorizationCodeBearer:
    """Patch `app` so its Swagger UI knows about Auth0 and has the PKCE button."""
    scheme = OAuth2AuthorizationCodeBearer(
        authorizationUrl=f"https://{settings.AUTH0_DOMAIN}/authorize",
        tokenUrl=f"https://{settings.AUTH0_DOMAIN}/oauth/token",
        scopes={
            "openid":  "OpenID Connect",
            "profile": "User profile information",
            "email":   "User email address",
        },
    )

    # Tell Swagger-UI how to start the PKCE dance
    app.swagger_ui_init_oauth = {
        "clientId": settings.AUTH0_CLIENT_ID,
        "usePkceWithAuthorizationCodeGrant": True,
        "additionalQueryStringParams": {
            "audience": settings.AUTH0_API_AUDIENCE,
            "scope": "openid profile email",
            "prompt": "login",
        },
        "redirectUri": f"http://localhost:{port}/docs/oauth2-redirect",
    }
    app.swagger_ui_parameters = {"persistAuthorization": False}

    # Monkey-patch OpenAPI so every op requires Auth0
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        schema = get_openapi(
            title=app.title,
            version="1.0.0",
            description=f"{app.title} (Auth0-secured)",
            routes=app.routes,
        )
        schema.setdefault("components", {}).setdefault("securitySchemes", {})["Auth0"] = {
            "type": "oauth2",
            "flows": {
                "authorizationCode": {
                    "authorizationUrl": f"https://{settings.AUTH0_DOMAIN}/authorize",
                    "tokenUrl": f"https://{settings.AUTH0_DOMAIN}/oauth/token",
                    "scopes": {
                        "openid":  "OpenID Connect",
                        "profile": "User profile information",
                        "email":   "User email address",
                    },
                }
            },
        }

        for path_item in schema["paths"].values():
            for op in path_item.values():
                op.setdefault("security", []).append({"Auth0": ["openid", "profile", "email"]})

        app.openapi_schema = schema
        return schema

    app.openapi = custom_openapi
    return scheme  # not used elsewhere, but you can Depend() on it if you like
