"""BLK-A8: deploy scripts corretos; gate de produção é humano (loop não publica)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEPLOY = ROOT / "deploy"
APP = ROOT / "app"


def _caddy() -> str:
    return (DEPLOY / "Caddyfile.snippet").read_text(encoding="utf-8")


def _sh() -> str:
    return (DEPLOY / "deploy.sh").read_text(encoding="utf-8")


# ── Caddyfile ─────────────────────────────────────────────────────────────────

def test_caddyfile_existe():
    """deploy/Caddyfile.snippet deve existir."""
    assert (DEPLOY / "Caddyfile.snippet").exists(), "Caddyfile.snippet ausente"


def test_caddyfile_autenticacao():
    """Caddyfile.snippet deve usar forward_auth (Authelia)."""
    assert "forward_auth" in _caddy(), "forward_auth ausente no Caddyfile"


def test_caddyfile_file_server():
    """Caddyfile.snippet deve servir arquivos estáticos (file_server)."""
    assert "file_server" in _caddy(), "file_server ausente no Caddyfile"


def test_caddyfile_sem_credenciais_hardcoded():
    """Caddyfile.snippet não deve conter credenciais ou IPs fixos — só templates."""
    caddy = _caddy()
    # Permite "SEU-DOMINIO" como placeholder, mas não IPs hardcoded como 192.168 etc.
    import re
    ips = re.findall(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', caddy)
    assert not ips, f"IP hardcoded no Caddyfile: {ips}"


# ── deploy.sh ─────────────────────────────────────────────────────────────────

def test_deploy_sh_existe():
    """deploy/deploy.sh deve existir."""
    assert (DEPLOY / "deploy.sh").exists(), "deploy.sh ausente"


def test_deploy_sh_rsync():
    """deploy.sh deve usar rsync para transferência de arquivos."""
    assert "rsync" in _sh(), "rsync ausente em deploy.sh"


def test_deploy_sh_env_vars():
    """deploy.sh deve usar variáveis de ambiente (${VPS_USER}, ${VPS_HOST}), sem hosts hardcoded."""
    sh = _sh()
    assert "${VPS_USER}" in sh or "$VPS_USER" in sh, "VPS_USER não referenciado em deploy.sh"
    assert "${VPS_HOST}" in sh or "$VPS_HOST" in sh, "VPS_HOST não referenciado em deploy.sh"


def test_deploy_sh_sem_git_push():
    """deploy.sh não deve conter 'git push' — deploy é rsync, o loop não publica código."""
    assert "git push" not in _sh(), "git push indevido em deploy.sh"


# ── Reconciliação no app ──────────────────────────────────────────────────────

def test_reconciliacao_no_app():
    """index.html deve ter a seção #reconciliacao visível."""
    html = (APP / "index.html").read_text(encoding="utf-8")
    assert 'id="reconciliacao"' in html, "seção #reconciliacao ausente em index.html"


def test_reconciliacao_paridade_nota():
    """index.html deve mencionar paridade por construção na seção de reconciliação."""
    html = (APP / "index.html").read_text(encoding="utf-8")
    assert "Paridade por constru" in html or "paridade" in html.lower(), \
        "nota de paridade por construção ausente na seção reconciliação"
