from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.backends import default_backend
'''
Funcion para la creacion de las claves publicas que tendrá el grupo.
'''
def generar_generador_y_modulo():
    """
    Genera un par de generador (g) y módulo (p) para Diffie-Hellman.
    """
    parameters = dh.generate_parameters(generator=2, key_size=512, backend=default_backend())
    p = parameters.parameter_numbers().p
    g = parameters.parameter_numbers().g
    return p, g

