# Generated by Django 5.1.3 on 2024-12-07 20:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_grupocompartido_archivoscompartidos_integrantesgrupo'),
    ]

    operations = [
        migrations.AddField(
            model_name='grupocompartido',
            name='public_key',
            field=models.TextField(blank=True, null=True),
        ),
    ]
