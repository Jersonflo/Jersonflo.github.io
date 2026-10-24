"""Servidor local para probar el portafolio sin caché (cada recarga trae los archivos nuevos).

Uso: python tools/serve.py 5510   (desde la carpeta portafolio)
"""
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 5510
http.server.ThreadingHTTPServer(('', port), NoCache).serve_forever()
