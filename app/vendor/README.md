# app/vendor — dependências vendorizadas (sem CDN)

O app é estático e **não faz nenhuma request externa** (requisito do BLK-A2). Bibliotecas de
terceiros ficam aqui, baixadas e versionadas no repo.

## chart.min.js
- **Lib:** Chart.js (UMD, minificado) — expõe o global `Chart`.
- **Versão:** 4.4.1
- **Licença:** MIT
- **Origem:** https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js
- **SHA-256:** `81ffafe13c37e1b25793b020d446f4d9739b949dadb7f9f79d709a0cad781c2f`

> Vendorizado **fora** do container do ralph loop (que roda com egress restrito e não baixaria CDN).
> Para atualizar: troque a versão, rebaixe do cdnjs, recompute o SHA-256 e atualize este arquivo.
> Use via `<script src="vendor/chart.min.js"></script>` — nunca por CDN.
