DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'cuestamarket.duckdns.org', '91.99.94.146/']
# Build paths inside the project like this: BASE_DIR / 'subdir'.
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3'
    }
}
