FROM python:3.12

LABEL author="Sergio Montoro"
LABEL mail="1816815@alu.murciaeduca.es"

WORKDIR /usr/src/app/

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

COPY TFG/requirements.txt ./

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN  apt-get clean &&\
    rm -rf /var/lib/apt/lists/*

EXPOSE 8000

ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-", "mi_tfg.wsgi:application"]

