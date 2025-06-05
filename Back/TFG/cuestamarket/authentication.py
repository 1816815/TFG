from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    An authentication class that retrieves JWT access tokens from cookies.

    This class extends the JWTAuthentication class to authenticate users
    by extracting the JWT access token from the cookies of an incoming
    request. If the token is valid, it returns the corresponding user and
    the validated token.

    Methods:
        authenticate(request): Extracts and validates the access token
            from the request cookies. Returns a tuple of user and validated
            token if successful, or None if not.
    """

    def authenticate(self, request):
        """
        Authenticates the user by retrieving the access token from cookies.

        Args:
            request (Request): The HTTP request object containing cookies.

        Returns:
            tuple: A tuple containing the user and validated token if
            authentication is successful. Returns None if the token is
            missing or invalid.
        """
        token = request.COOKIES.get('access_token')

        if token is None:

            return None

        try:

            validated_token = self.get_validated_token(token)
            return self.get_user(validated_token), validated_token
        
        except Exception:

            return None
