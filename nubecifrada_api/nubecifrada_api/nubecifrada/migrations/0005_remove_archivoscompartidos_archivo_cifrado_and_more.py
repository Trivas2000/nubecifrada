# Generated by Django 5.1.3 on 2024-12-09 05:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nubecifrada', '0004_alter_integrantesgrupo_llave_maestra_cifrada'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='archivoscompartidos',
            name='archivo_cifrado',
        ),
        migrations.AddField(
            model_name='archivoscompartidos',
            name='ruta_archivo',
            field=models.CharField(default='', max_length=255),
        ),
    ]