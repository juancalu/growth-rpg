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

## fonts/cinzel-{400,700}.woff2
- **Fonte:** Cinzel (display, serifada, "pôster de fantasia"). Para títulos/headers/números de destaque.
- **Licença:** SIL Open Font License 1.1
- **Origem:** `@fontsource/cinzel` (subset `latin`) via jsdelivr:
  - https://cdn.jsdelivr.net/npm/@fontsource/cinzel@5/files/cinzel-latin-700-normal.woff2
  - https://cdn.jsdelivr.net/npm/@fontsource/cinzel@5/files/cinzel-latin-400-normal.woff2
- **SHA-256:**
  - `8efa224fe70fef188a39c095e218b81fd31061809f2752537e33a9ec7b9c2263`  cinzel-700.woff2
  - `b873cdd90d6bd9ca4793c805b4175abfae00b3611ee8afccf63067133dcf1217`  cinzel-400.woff2

> Use via `@font-face` apontando para `vendor/fonts/` — nunca CDN de fonte. Body permanece em
> *system font stack* (Cinzel é só display).
