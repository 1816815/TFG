# Generated by Django 5.1.2 on 2025-06-04 08:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cuestamarket', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnswerOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('answer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='selected_options', to='cuestamarket.answer')),
                ('option', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cuestamarket.option')),
            ],
            options={
                'unique_together': {('answer', 'option')},
            },
        ),
    ]
