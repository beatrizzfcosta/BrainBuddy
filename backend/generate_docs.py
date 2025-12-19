#!/usr/bin/env python3
"""
Script para gerar documentação do backend com pdoc
"""
import os
import subprocess
import sys
from pathlib import Path

def main():
    """Gera documentação HTML do backend"""
    # Diretório do backend
    backend_dir = Path(__file__).parent
    docs_dir = backend_dir / "docs"
    
    print("Gerando documentação do backend com pdoc...")
    
    # Criar diretório de documentação
    docs_dir.mkdir(exist_ok=True)
    
    # Tentar usar venv se existir
    venv_python = backend_dir / "venv" / "bin" / "python"
    python_exe = str(venv_python) if venv_python.exists() else sys.executable
    
    # Comando pdoc (versão 16+ usa sintaxe diferente)
    cmd = [
        python_exe, "-m", "pdoc",
        "-o", str(docs_dir),
        "-d", "google",
        "--show-source",
        "app"
    ]
    
    try:
        subprocess.run(cmd, check=True, cwd=backend_dir)
        print(f"Documentação gerada em: {docs_dir}/")
        
        # Encontrar o arquivo index.html (pdoc 16+ pode criar estrutura diferente)
        index_files = list(docs_dir.rglob("index.html"))
        if index_files:
            index_file = index_files[0]
            print(f"Abra {index_file} no navegador")
            
            # Tentar abrir automaticamente (macOS)
            if sys.platform == "darwin":
                subprocess.run(["open", str(index_file)])
        else:
            print(f"Documentação gerada em: {docs_dir}/")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao gerar documentação: {e}")
        print("\nDica: Certifique-se de que:")
        print("   1. O venv está ativado ou as dependências estão instaladas")
        print("   2. pdoc está instalado: pip install pdoc")
        sys.exit(1)
    except FileNotFoundError:
        print("pdoc não encontrado. Instale com: pip install pdoc")
        sys.exit(1)

if __name__ == "__main__":
    main()

