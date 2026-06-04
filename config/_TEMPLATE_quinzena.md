# Template — abrir uma nova quinzena

Use no **planejamento de cada quinzena** (reunião com o diretor, ~a cada 2 quintas: 18/06, 02/07,
16/07, 30/07…). Abrir uma quinzena = colar **um bloco em cada** arquivo abaixo, com o **mesmo label**.
O prompt do Scheduler do Cowork **nunca muda** — ele acha a quinzena corrente pela data de hoje.

> Substitua `LABEL`, as datas e os números. **Remova o `_status` "PROVISORIO"** quando travar os
> valores reais. O `_status` é opcional e ignorado pelo motor (qualquer chave `_*` é ignorada).

---

## 1) `config/backlog_quinzena.json` — adicione dentro do objeto raiz

```jsonc
"LABEL": {
  "janela": {
    "de":  "AAAA-MM-DD",          // 1o dia que pontua (date_done >= de)
    "ate": "AAAA-MM-DD",          // ultimo dia (date_done <= ate). No dia == ate o run vira "quinzenal"
    "ancora": "Reuniao 'alinhamento e resultados' (10h BRT) com o diretor Marcos, DD/MM"
  },
  "operacional": { "camadas": { "comprometida": 0, "alvo": 0, "stretch": 0 } },
  "projeto":     { "camadas": { "comprometida": 0, "alvo": 0, "stretch": 0 } },
  "analise":     { "camadas": { "comprometida": 0, "alvo": 0, "stretch": 0 } }
}
```

## 2) `config/disponibilidade.json` — adicione com o MESMO `LABEL`

```jsonc
"LABEL": {
  "Felipe":   { "dias_disponiveis": 0, "afastamentos": [] },
  "Juan":     { "dias_disponiveis": 0, "afastamentos": [] },
  "Vinicius": { "dias_disponiveis": 0, "afastamentos": [] }
}
```

Afastamento (quando houver): `{ "tipo": "ferias|atestado|folga", "dias": N }` dentro de `afastamentos`.

---

## Regras ao preencher (inegociáveis)

- **Label idêntico** nos dois arquivos. Sugestão de formato: `"Junho/2026 (19-02)"` (período).
- **Janelas não se sobrepõem.** A quinzena seguinte começa **no dia após** o `ate` da anterior
  (ex.: fechou em `2026-06-18` → a próxima começa em `2026-06-19`). Sobreposição quebra a seleção por data.
- **Camadas = backlog comprometido, anti-inflação.** `comprometida` = piso de alta confiança ·
  `alvo` = meta · `stretch` = heroico. Dimensione pela **vazão das últimas 1–2 quinzenas**.
  **NUNCA** inflar com item fácil só para ter "boss gordo". São unidades por frente:
  Operacional = **itens**; Projeto/Análise = **pontos de sizing** (1/3/8). Nunca some entre frentes.
- **`dias_disponiveis` = dias úteis do período − afastamentos − feriados.** (Ex.: Corpus Christi
  04/06/2026 e eventual ponto facultativo 05/06.)
- Travado **antes** da reunião com o diretor. Depois de colado, o run diário já usa os novos números.

## Onde isso se encaixa
- A skill (`growth-rpg-producer`, §1) lê `backlog_quinzena.json`, acha a janela que contém hoje e
  usa esse label. Se nenhuma janela contém hoje → ela **para** e pede este bloco.
- No dia `ate` (fechamento), o run roda em modo **quinzenal**: gera `painel.html` e atualiza
  `historico/acumulado.json` (que vira o ponto de partida vitalício da quinzena seguinte).
