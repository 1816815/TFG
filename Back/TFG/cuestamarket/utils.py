from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
import os

def send_activation_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    frontend_base_url = os.getenv('FRONTEND_URL', 'http://127.0.0.1:5173')

    activation_url = f"{frontend_base_url}/activar/{uid}/{token}"

    subject = "Activa tu cuenta"
    html_content = render_to_string("emails/activation_mail.html", {
        "user": user,
        "activation_url": activation_url
    })
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(subject, text_content, to=[user.email])
    email.attach_alternative(html_content, "text/html")
    email.send()
