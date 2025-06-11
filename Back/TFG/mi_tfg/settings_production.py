import os 
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'cuestamarket.duckdns.org', 'api.cuestamarket.duckdns.org']
DEBUG = False
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MARIADB_DATABASE'),
        'USER': os.getenv('MARIADB_USER'),
        'PASSWORD': os.getenv('MARIADB_PASSWORD'),
        'HOST': os.getenv('MARIADB_HOST'),
        'PORT': os.getenv('MARIADB_PORT')
    }
}